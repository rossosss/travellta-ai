export interface AuthUser {
  id: string;
  email: string;
  firstName?: string | null;
  role: 'user' | 'admin';
}

export type FeedbackStatus = 'new' | 'in_progress' | 'done';

export interface FeedbackItem {
  id: string;
  name?: string | null;
  email?: string | null;
  audienceType: string;
  travelFrequency?: string | null;
  painPoint?: string | null;
  wish?: string | null;
  contactOk: boolean;
  source?: string | null;
  status: FeedbackStatus;
  adminNote?: string | null;
  createdAt: string;
  updatedAt: string;
}
