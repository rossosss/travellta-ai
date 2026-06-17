import { TelegramUser } from '../telegram/telegram.service';

export type UserRole = 'user' | 'admin';

export interface AppAuthContext {
  telegramUser: TelegramUser;
  /** Telegram id, web:{uuid} или email:{uuid} */
  userKey: string;
  userId?: string;
  email?: string;
  role?: UserRole;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
}
