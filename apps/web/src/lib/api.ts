import { getAuthToken } from '@/lib/auth-token';
import { getGuestId } from '@/lib/guest-id';
import type { AuthUser, FeedbackItem, FeedbackStatus } from '@/types/auth';
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
  const token = getAuthToken();

  if (initData) {
    headers['X-Telegram-Init-Data'] = initData;
  } else if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    headers['X-Guest-Id'] = getGuestId();
  }
  return headers;
}

function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  if (!token) throw new Error('Требуется авторизация');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
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
  register(email: string, password: string, firstName?: string) {
    return request<{ token: string; user: AuthUser }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, firstName }),
    });
  },

  login(email: string, password: string) {
    return request<{ token: string; user: AuthUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  me() {
    return request<AuthUser>('/auth/me', { headers: getAuthHeaders() });
  },

  listFeedback(params?: { page?: number; limit?: number; status?: FeedbackStatus }) {
    const qs = new URLSearchParams();
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    if (params?.status) qs.set('status', params.status);
    const query = qs.toString();
    return request<{
      items: FeedbackItem[];
      total: number;
      page: number;
      limit: number;
      pages: number;
    }>(`/feedback${query ? `?${query}` : ''}`, { headers: getAuthHeaders() });
  },

  updateFeedback(id: string, payload: { status?: FeedbackStatus; adminNote?: string }) {
    return request<{ ok: true; item: FeedbackItem }>(`/feedback/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
  },

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
