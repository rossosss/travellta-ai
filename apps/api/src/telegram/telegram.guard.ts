import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { TelegramService } from './telegram.service';

@Injectable()
export class TelegramAuthGuard implements CanActivate {
  constructor(private readonly telegram: TelegramService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const initData =
      request.headers['x-telegram-init-data'] ??
      request.headers['authorization']?.replace('tma ', '');

    try {
      request.telegramUser = this.telegram.validateInitData(initData ?? '');
      return true;
    } catch {
      throw new UnauthorizedException('Telegram authentication failed');
    }
  }
}
