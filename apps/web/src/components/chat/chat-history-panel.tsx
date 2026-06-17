'use client';

import type { ChatSessionSummary } from '@/types/chat';
import { MessageSquarePlus, MessagesSquare } from 'lucide-react';

interface ChatHistoryPanelProps {
  sessions: ChatSessionSummary[];
  activeSessionId?: string;
  onSelectSession: (sessionId: string) => void;
  onNewChat: () => void;
  loading?: boolean;
  onAfterSelect?: () => void;
  title?: string;
}

function formatRelativeTime(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  }
  if (diffDays === 1) return 'Вчера';
  if (diffDays < 7) return `${diffDays} дн. назад`;
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

export function ChatHistoryPanel({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  loading,
  onAfterSelect,
  title = 'История чатов',
}: ChatHistoryPanelProps) {
  return (
    <>
      {title && (
        <div className="p-4 border-b border-border/50 shrink-0">
          <h2 className="text-left text-base font-semibold">{title}</h2>
        </div>
      )}

      <div className="p-3 shrink-0">
        <button
          type="button"
          onClick={() => {
            onNewChat();
            onAfterSelect?.();
          }}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <MessageSquarePlus className="w-4 h-4" />
          Новый чат
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-3 pb-4 space-y-1">
        {loading && (
          <p className="text-xs text-muted-foreground px-2 py-4">Загрузка...</p>
        )}

        {!loading && sessions.length === 0 && (
          <div className="text-center py-8 px-4">
            <MessagesSquare className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">
              Пока нет сохранённых диалогов. Начните новый чат!
            </p>
          </div>
        )}

        {sessions.map((session) => {
          const active = session.sessionId === activeSessionId;
          return (
            <button
              key={session.sessionId}
              type="button"
              onClick={() => {
                onSelectSession(session.sessionId);
                onAfterSelect?.();
              }}
              className={`w-full text-left px-3 py-2.5 rounded-xl transition-colors ${
                active
                  ? 'bg-primary/10 border border-primary/20'
                  : 'hover:bg-muted/70 border border-transparent'
              }`}
            >
              <p className="text-sm font-medium truncate leading-snug">{session.title}</p>
              <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                {session.preview}
              </p>
              <p className="text-[10px] text-muted-foreground/70 mt-1">
                {formatRelativeTime(session.updatedAt)}
              </p>
            </button>
          );
        })}
      </div>
    </>
  );
}
