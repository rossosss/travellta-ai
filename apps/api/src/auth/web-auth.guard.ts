import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { TelegramService } from '../telegram/telegram.service';
import { AuthService } from './auth.service';
import { AppAuthContext } from './auth.types';

const GUEST_ID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

@Injectable()
export class WebAuthGuard implements CanActivate {
  private readonly logger = new Logger(WebAuthGuard.name);

  constructor(
    private readonly telegram: TelegramService,
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const initData =
      request.headers['x-telegram-init-data'] ??
      request.headers['authorization']?.replace(/^tma /i, '');

    if (initData && !String(initData).startsWith('eyJ')) {
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

    const bearer = this.extractBearer(request.headers.authorization);
    if (bearer) {
      const user = await this.authService.validateJwt(bearer);
      if (user) {
        request.auth = this.authService.buildAuthContext(user);
        return true;
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

  private extractBearer(header?: string): string | null {
    if (!header?.startsWith('Bearer ')) return null;
    const token = header.slice(7).trim();
    return token || null;
  }

  private guestNumericId(guestId: string): number {
    let hash = 0;
    for (let i = 0; i < guestId.length; i++) {
      hash = (Math.imul(31, hash) + guestId.charCodeAt(i)) | 0;
    }
    return 900_000_000 + (Math.abs(hash) % 99_000_000);
  }
}
