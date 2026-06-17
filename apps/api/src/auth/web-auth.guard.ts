import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { TelegramService, TelegramUser } from '../telegram/telegram.service';

const GUEST_ID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export interface AppAuthContext {
  telegramUser: TelegramUser;
  /** Для веб-гостей: web:{uuid}, иначе tg id */
  userKey: string;
}

@Injectable()
export class WebAuthGuard implements CanActivate {
  private readonly logger = new Logger(WebAuthGuard.name);

  constructor(private readonly telegram: TelegramService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const initData =
      request.headers['x-telegram-init-data'] ??
      request.headers['authorization']?.replace('tma ', '');

    if (initData) {
      try {
        const telegramUser = this.telegram.validateInitData(initData);
        request.auth = {
          telegramUser,
          userKey: String(telegramUser.id),
        } satisfies AppAuthContext;
        return true;
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'unknown';
        this.logger.warn(`Telegram auth failed: ${msg}`);
      }
    }

    const guestId = String(request.headers['x-guest-id'] ?? '').trim();
    if (GUEST_ID_RE.test(guestId)) {
      request.auth = {
        telegramUser: {
          id: this.guestNumericId(guestId),
          first_name: 'Гость',
          language_code: 'ru',
        },
        userKey: `web:${guestId}`,
      } satisfies AppAuthContext;
      return true;
    }

    if (process.env.NODE_ENV === 'development') {
      request.auth = {
        telegramUser: {
          id: 123456789,
          first_name: 'Dev',
          username: 'dev_user',
          language_code: 'ru',
        },
        userKey: '123456789',
      } satisfies AppAuthContext;
      return true;
    }

    throw new UnauthorizedException('Authentication required');
  }

  private guestNumericId(guestId: string): number {
    let hash = 0;
    for (let i = 0; i < guestId.length; i++) {
      hash = (Math.imul(31, hash) + guestId.charCodeAt(i)) | 0;
    }
    return 900_000_000 + (Math.abs(hash) % 99_000_000);
  }
}
