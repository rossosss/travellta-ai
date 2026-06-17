'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { setAuthToken } from '@/lib/auth-token';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useState } from 'react';

type Mode = 'login' | 'register';

export function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const redirectTo = searchParams.get('next') || '/chat';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res =
        mode === 'login'
          ? await api.login(email.trim(), password)
          : await api.register(email.trim(), password, firstName.trim() || undefined);
      setAuthToken(res.token);
      if (res.user.role === 'admin' && redirectTo.startsWith('/admin')) {
        router.push(redirectTo);
      } else if (res.user.role === 'admin' && searchParams.get('next')?.startsWith('/admin')) {
        router.push(searchParams.get('next')!);
      } else {
        router.push(redirectTo === '/admin' ? '/chat' : redirectTo);
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось выполнить вход');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-xl border-border/60">
      <CardHeader>
        <CardTitle>{mode === 'login' ? 'Вход' : 'Регистрация'}</CardTitle>
        <CardDescription>
          {mode === 'login'
            ? 'Войдите по email — или продолжайте как гость без регистрации.'
            : 'Создайте аккаунт, чтобы сохранять историю на всех устройствах.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-6 p-1 rounded-xl bg-muted/60">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 py-2 text-sm rounded-lg transition-colors ${
              mode === 'login' ? 'bg-background shadow-sm font-medium' : 'text-muted-foreground'
            }`}
          >
            Вход
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`flex-1 py-2 text-sm rounded-lg transition-colors ${
              mode === 'register' ? 'bg-background shadow-sm font-medium' : 'text-muted-foreground'
            }`}
          >
            Регистрация
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div className="space-y-1.5">
              <label htmlFor="firstName" className="text-sm font-medium">
                Имя
              </label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Как к вам обращаться"
                autoComplete="given-name"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-medium">
              Пароль
            </label>
            <Input
              id="password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Минимум 8 символов"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>
          )}

          <Button type="submit" className="w-full rounded-full" disabled={loading}>
            {loading ? 'Подождите…' : mode === 'login' ? 'Войти' : 'Зарегистрироваться'}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-border/50 space-y-2 text-center text-sm text-muted-foreground">
          <p>Регистрация не обязательна — чат работает в гостевом режиме.</p>
          <Link href="/chat" className="text-primary hover:underline font-medium">
            Продолжить как гость →
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
