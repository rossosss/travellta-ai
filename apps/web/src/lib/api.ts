import type { ChatMessage } from '@/types/chat';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

function getHeaders(): HeadersInit {
  const initData =
    typeof window !== 'undefined'
      ? window.Telegram?.WebApp?.initData ?? ''
      : '';

  return {
    'Content-Type': 'application/json',
    'X-Telegram-Init-Data': initData,
  };
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}/api${path}`, {
    ...options,
    headers: { ...getHeaders(), ...options?.headers },
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || `Request failed: ${res.status}`);
  }

  return res.json();
}

export const api = {
  sendMessage(content: string, sessionId?: string) {
    return request<{ sessionId: string; message: ChatMessage }>('/chat/message', {
      method: 'POST',
      body: JSON.stringify({ content, sessionId }),
    });
  },

  startLucky(sessionId?: string) {
    return request<{ sessionId: string; messages: ChatMessage[] }>(
      '/chat/lucky/start',
      {
        method: 'POST',
        body: JSON.stringify({ sessionId }),
      },
    );
  },

  luckyAnswer(sessionId: string, questionId: string, answer: string) {
    return request<{ sessionId: string; message: ChatMessage; done: boolean }>(
      '/chat/lucky/answer',
      {
        method: 'POST',
        body: JSON.stringify({ sessionId, questionId, answer }),
      },
    );
  },

  getSession(sessionId: string) {
    return request<{ sessionId: string; messages: ChatMessage[]; mode?: string } | null>(
      `/chat/session/${sessionId}`,
    );
  },

  getLatestSession() {
    return request<{ sessionId: string; messages: ChatMessage[]; mode?: string } | null>(
      '/chat/latest',
    );
  },

  getPopularRoutes() {
    return request<{ routes: import('@/types/chat').PopularRoute[] }>('/travel/popular');
  },
};
