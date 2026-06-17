import { getGuestId } from '@/lib/guest-id';
import type { ChatMessage } from '@/types/chat';

function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const env = process.env.NEXT_PUBLIC_API_URL;
    if (env && !env.includes('localhost') && !env.includes('127.0.0.1')) {
      return env.replace(/\/$/, '');
    }
    return window.location.origin;
  }
  return (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001').replace(/\/$/, '');
}

function getInitData(): string {
  if (typeof window === 'undefined') return '';
  return window.Telegram?.WebApp?.initData ?? '';
}

function getHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const initData = getInitData();
  if (initData) {
    headers['X-Telegram-Init-Data'] = initData;
  } else {
    headers['X-Guest-Id'] = getGuestId();
  }
  return headers;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${getApiBaseUrl()}/api${path}`;
  const res = await fetch(url, {
    ...options,
    headers: { ...getHeaders(), ...options?.headers },
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || `Request failed: ${res.status} ${url}`);
  }

  return res.json();
}

export interface FeedbackPayload {
  name?: string;
  email?: string;
  audienceType: string;
  travelFrequency?: string;
  painPoint?: string;
  wish?: string;
  contactOk?: boolean;
  source?: string;
}

export const api = {
  sendFeedback(payload: FeedbackPayload) {
    return request<{ ok: true; id: string }>('/feedback', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

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

  listSessions() {
    return request<{ sessions: import('@/types/chat').ChatSessionSummary[] }>('/chat/sessions');
  },

  createSession() {
    return request<{ sessionId: string }>('/chat/sessions', { method: 'POST', body: '{}' });
  },
};
