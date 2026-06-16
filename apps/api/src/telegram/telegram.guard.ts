import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { TelegramService } from './telegram.service';

@Injectable()
export class TelegramAuthGuard implements CanActivate {
  private readonly logger = new Logger(TelegramAuthGuard.name);

  constructor(private readonly telegram: TelegramService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const initData =
      request.headers['x-telegram-init-data'] ??
      request.headers['authorization']?.replace('tma ', '');

    try {
      request.telegramUser = this.telegram.validateInitData(initData ?? '');
      return true;
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'unknown';
      this.logger.warn(
        `Telegram auth failed: ${msg} (initData length: ${(initData ?? '').length})`,
      );
      throw new UnauthorizedException('Telegram authentication failed');
    }
  }
}
