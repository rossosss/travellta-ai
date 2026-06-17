'use client';

import { ChatHistoryPanel } from '@/components/chat/chat-history-panel';
import { ChatHistorySheet } from '@/components/chat/chat-history-sheet';
import { ChatInput } from '@/components/chat/chat-input';
import { MessageBubble } from '@/components/chat/message-bubble';
import { PopularRoutes } from '@/components/chat/popular-routes';
import { api } from '@/lib/api';
import { clearAuthToken, getAuthToken } from '@/lib/auth-token';
import type { AuthUser } from '@/types/auth';
import type { ChatMessage, ChatSessionSummary, PopularRoute } from '@/types/chat';
import { Compass, History, Home, LogIn, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

const SESSION_STORAGE_KEY = 'travellta_session_id';

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  type: 'text',
  content:
    'Привет! 👋 Я навигатор отдыха — построю путь от вашего дома до курорта: автобус, поезд, перелёт. Напишите откуда и куда, например: «Из Москвы в Сочи 25.06–28.06».',
};

const SUGGESTIONS = [
  'Из Москвы на выходные в Питер, бюджет 30 000 ₽',
  'Из Санкт-Петербурга в Сочи в июле, бюджет 80 000 ₽',
  'Из Москвы на Пхукет, бюджет 150 000 ₽',
];

export function ChatContainer() {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [sessionId, setSessionId] = useState<string>();
  const [sessionList, setSessionList] = useState<ChatSessionSummary[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [popularRoutes, setPopularRoutes] = useState<PopularRoute[]>([]);
  const [loading, setLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback((smooth = true) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({
      top: el.scrollHeight,
      behavior: smooth ? 'smooth' : 'instant',
    });
  }, []);

  const refreshSessionList = useCallback(async () => {
    try {
      setSessionsLoading(true);
      const data = await api.listSessions();
      setSessionList(data.sessions);
    } catch {
      /* ignore */
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (historyLoaded) scrollToBottom();
  }, [messages, historyLoaded, scrollToBottom]);

  useEffect(() => {
    async function init() {
      try {
        const [routesData] = await Promise.all([
          api.getPopularRoutes(),
          refreshSessionList(),
          (async () => {
            const stored = localStorage.getItem(SESSION_STORAGE_KEY);
            if (stored) {
              const session = await api.getSession(stored);
              if (session?.messages?.length) {
                setSessionId(session.sessionId);
                setMessages([WELCOME_MESSAGE, ...session.messages]);
              }
            }
          })(),
        ]);
        setPopularRoutes(routesData.routes);
        if (getAuthToken()) {
          try {
            setAuthUser(await api.me());
          } catch {
            clearAuthToken();
          }
        }
      } catch {
        /* ignore */
      } finally {
        setHistoryLoaded(true);
      }
    }
    init();
  }, [refreshSessionList]);

  const persistSession = (id: string) => {
    setSessionId(id);
    localStorage.setItem(SESSION_STORAGE_KEY, id);
  };

  const loadSession = async (id: string) => {
    setLoading(true);
    try {
      const session = await api.getSession(id);
      if (session) {
        persistSession(session.sessionId);
        setMessages(
          session.messages?.length
            ? [WELCOME_MESSAGE, ...session.messages]
            : [WELCOME_MESSAGE],
        );
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = () => {
    setSessionId(undefined);
    localStorage.removeItem(SESSION_STORAGE_KEY);
    setMessages([WELCOME_MESSAGE]);
  };

  const handleSend = async (content: string) => {
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      type: 'text',
      content,
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await api.sendMessage(content, sessionId);
      persistSession(res.sessionId);
      setMessages((prev) => [...prev, res.message]);
      refreshSessionList();
    } catch (err) {
      console.error('chat send failed', err);
      const hint =
        err instanceof Error && err.message.includes('401')
          ? 'Не удалось авторизоваться. Обновите страницу и попробуйте снова.'
          : 'Не удалось обработать запрос. Проверьте соединение и попробуйте ещё раз.';
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          type: 'text',
          content: hint,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleLucky = async () => {
    setLoading(true);
    try {
      const res = await api.startLucky(sessionId);
      persistSession(res.sessionId);
      setMessages((prev) => [...prev, ...res.messages]);
      refreshSessionList();
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          type: 'text',
          content: 'Не удалось запустить режим удачи.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = async (questionId: string, option: string) => {
    if (!sessionId) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      type: 'text',
      content: option,
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await api.luckyAnswer(sessionId, questionId, option);
      setMessages((prev) => [...prev, res.message]);
      if (res.done) refreshSessionList();
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          type: 'text',
          content: 'Ошибка при обработке ответа.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!historyLoaded) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground text-sm">Загрузка...</div>
      </div>
    );
  }

  const hasUserMessages = messages.some((m) => m.role === 'user');
  const showHome = !hasUserMessages;

  return (
    <div className="flex flex-1 min-h-0 overflow-hidden lg:flex-row">
      <aside className="hidden lg:flex lg:flex-col lg:w-72 xl:w-80 lg:shrink-0 lg:min-h-0 lg:overflow-hidden lg:border-r lg:border-border/40 lg:bg-muted/20">
        <ChatHistoryPanel
          sessions={sessionList}
          activeSessionId={sessionId}
          onSelectSession={loadSession}
          onNewChat={handleNewChat}
          loading={sessionsLoading}
        />
      </aside>

      <div className="flex flex-col flex-1 min-h-0 min-w-0 overflow-hidden">
        <ChatHistorySheet
          open={historyOpen}
          onOpenChange={setHistoryOpen}
          sessions={sessionList}
          activeSessionId={sessionId}
          onSelectSession={loadSession}
          onNewChat={handleNewChat}
          loading={sessionsLoading}
        />

        <header className="sticky top-0 shrink-0 px-4 lg:px-6 pb-3 pt-safe lg:pt-4 border-b border-border/40 bg-background/95 backdrop-blur-xl z-20">
          <div className="flex items-center gap-2 lg:gap-3 max-w-5xl mx-auto w-full">
            <Link
              href="/"
              className="p-2 rounded-xl hover:bg-muted/60 transition-colors"
              aria-label="На главную"
            >
              <Home className="w-5 h-5 text-muted-foreground" />
            </Link>
            <button
              type="button"
              onClick={() => {
                setHistoryOpen(true);
                refreshSessionList();
              }}
              className="p-2 rounded-xl hover:bg-muted/60 transition-colors lg:hidden"
              aria-label="История чатов"
            >
              <History className="w-5 h-5 text-muted-foreground" />
            </button>
            <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-gradient-to-br from-violet-600 to-cyan-400 flex items-center justify-center shadow-md shrink-0">
              <Compass className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-semibold text-sm lg:text-base leading-tight">Навигатор</h1>
              <p className="text-xs lg:text-sm text-muted-foreground truncate">
                Travellta · AI-маршруты
              </p>
            </div>
            <Link
              href="/"
              className="hidden lg:inline-flex text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              На главную
            </Link>
            {authUser ? (
              <div className="flex items-center gap-1 shrink-0">
                {authUser.role === 'admin' && (
                  <Link
                    href="/admin/feedback"
                    className="hidden sm:inline text-xs text-primary hover:underline px-2"
                  >
                    Админка
                  </Link>
                )}
                <span className="hidden sm:inline text-xs text-muted-foreground max-w-[120px] truncate px-1">
                  {authUser.email}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    clearAuthToken();
                    setAuthUser(null);
                    window.location.reload();
                  }}
                  className="p-2 rounded-xl hover:bg-muted/60 transition-colors"
                  aria-label="Выйти"
                >
                  <LogOut className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            ) : (
              <Link
                href="/login?next=/chat"
                className="p-2 rounded-xl hover:bg-muted/60 transition-colors shrink-0"
                aria-label="Войти"
              >
                <LogIn className="w-5 h-5 text-muted-foreground" />
              </Link>
            )}
          </div>
        </header>

        <div
          ref={scrollRef}
          className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain px-4 lg:px-6 touch-pan-y"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <div className="py-4 lg:py-6 space-y-4 lg:space-y-5 pb-2 max-w-5xl mx-auto w-full">
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                onOptionSelect={handleOptionSelect}
              />
            ))}

            {showHome && (
              <div className="flex flex-col gap-4 lg:gap-6 pt-1">
                <PopularRoutes routes={popularRoutes} onSelect={handleSend} disabled={loading} />
                <div className="flex flex-col gap-2 lg:gap-3">
                  <p className="text-xs lg:text-sm text-muted-foreground px-1">Или напишите:</p>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => handleSend(s)}
                        disabled={loading}
                        className="text-left text-xs lg:text-sm px-3 py-2.5 lg:px-4 lg:py-3 rounded-xl bg-muted/60 hover:bg-muted transition-colors text-muted-foreground border border-border/40"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        </div>

        <ChatInput onSend={handleSend} onLucky={handleLucky} disabled={loading} />
      </div>
    </div>
  );
}
