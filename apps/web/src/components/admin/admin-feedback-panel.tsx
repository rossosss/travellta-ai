'use client';

import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/lib/api';
import { clearAuthToken, getAuthToken } from '@/lib/auth-token';
import { cn } from '@/lib/utils';
import type { AuthUser, FeedbackItem, FeedbackStatus } from '@/types/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

const STATUS_LABELS: Record<FeedbackStatus, string> = {
  new: 'Новый',
  in_progress: 'В работе',
  done: 'Обработан',
};

const STATUS_VARIANT: Record<FeedbackStatus, 'default' | 'secondary' | 'outline'> = {
  new: 'default',
  in_progress: 'secondary',
  done: 'outline',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function AdminFeedbackPanel() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<FeedbackStatus | 'all'>('all');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.listFeedback({
        page,
        limit: 20,
        status: statusFilter === 'all' ? undefined : statusFilter,
      });
      setItems(data.items);
      setPages(data.pages);
      setTotal(data.total);
      setNotes((prev) => {
        const next = { ...prev };
        for (const item of data.items) {
          if (next[item.id] === undefined) {
            next[item.id] = item.adminNote ?? '';
          }
        }
        return next;
      });
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    async function init() {
      if (!getAuthToken()) {
        router.replace('/login?next=/admin/feedback');
        return;
      }
      try {
        const me = await api.me();
        if (me.role !== 'admin') {
          router.replace('/chat');
          return;
        }
        setUser(me);
        await load();
      } catch {
        clearAuthToken();
        router.replace('/login?next=/admin/feedback');
      }
    }
    init();
  }, [router, load]);

  useEffect(() => {
    if (user) load();
  }, [user, load]);

  const handleStatus = async (id: string, status: FeedbackStatus) => {
    setSavingId(id);
    try {
      await api.updateFeedback(id, { status, adminNote: notes[id] });
      await load();
    } finally {
      setSavingId(null);
    }
  };

  const handleSaveNote = async (id: string) => {
    setSavingId(id);
    try {
      await api.updateFeedback(id, { adminNote: notes[id] });
      await load();
    } finally {
      setSavingId(null);
    }
  };

  const logout = () => {
    clearAuthToken();
    router.push('/login');
  };

  if (!user) {
    return (
      <div className="min-h-dvh flex items-center justify-center text-muted-foreground text-sm">
        Проверка доступа…
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-muted/20">
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 lg:px-6 py-4 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold">Отзывы пользователей</h1>
            <p className="text-sm text-muted-foreground">
              {user.email} · всего {total}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/chat" className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>
              К чату
            </Link>
            <Button variant="ghost" size="sm" onClick={logout}>
              Выйти
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 lg:px-6 py-6 space-y-4">
        <div className="flex flex-wrap gap-2">
          {(['all', 'new', 'in_progress', 'done'] as const).map((s) => (
            <Button
              key={s}
              size="sm"
              variant={statusFilter === s ? 'default' : 'outline'}
              onClick={() => {
                setPage(1);
                setStatusFilter(s);
              }}
            >
              {s === 'all' ? 'Все' : STATUS_LABELS[s]}
            </Button>
          ))}
        </div>

        {loading && <p className="text-sm text-muted-foreground">Загрузка…</p>}

        {!loading && items.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground text-sm">
              Отзывов пока нет
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {items.map((item) => (
            <Card key={item.id}>
              <CardHeader className="pb-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-base">
                      {item.name || 'Без имени'}
                      {item.email && (
                        <span className="text-muted-foreground font-normal"> · {item.email}</span>
                      )}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(item.createdAt)} · {item.audienceType}
                      {item.travelFrequency ? ` · ${item.travelFrequency}` : ''}
                      {item.contactOk ? ' · можно связаться' : ''}
                    </p>
                  </div>
                  <Badge variant={STATUS_VARIANT[item.status]}>{STATUS_LABELS[item.status]}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {item.painPoint && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Сложности</p>
                    <p className="text-sm whitespace-pre-wrap">{item.painPoint}</p>
                  </div>
                )}
                {item.wish && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Пожелания</p>
                    <p className=" text-sm whitespace-pre-wrap">{item.wish}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Заметка администратора</p>
                  <Textarea
                    value={notes[item.id] ?? ''}
                    onChange={(e) => setNotes((prev) => ({ ...prev, [item.id]: e.target.value }))}
                    rows={2}
                    className="text-sm resize-none"
                    placeholder="Комментарий для себя или команды…"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  {(['new', 'in_progress', 'done'] as FeedbackStatus[]).map((status) => (
                    <Button
                      key={status}
                      size="sm"
                      variant={item.status === status ? 'default' : 'outline'}
                      disabled={savingId === item.id}
                      onClick={() => handleStatus(item.id, status)}
                    >
                      {STATUS_LABELS[status]}
                    </Button>
                  ))}
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={savingId === item.id}
                    onClick={() => handleSaveNote(item.id)}
                  >
                    Сохранить заметку
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {pages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            <Button
              size="sm"
              variant="outline"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Назад
            </Button>
            <span className="text-sm text-muted-foreground">
              {page} / {pages}
            </span>
            <Button
              size="sm"
              variant="outline"
              disabled={page >= pages}
              onClick={() => setPage((p) => p + 1)}
            >
              Далее
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
