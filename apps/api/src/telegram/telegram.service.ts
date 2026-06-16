import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'crypto';

export interface TelegramUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

@Injectable()
export class TelegramService {
  private readonly botToken: string;

  constructor(private readonly config: ConfigService) {
    this.botToken = this.config.get<string>('TELEGRAM_BOT_TOKEN', '');
  }

  validateInitData(initData: string): TelegramUser {
    if (!initData) {
      if (process.env.NODE_ENV === 'development') {
        return {
          id: 123456789,
          first_name: 'Dev',
          username: 'dev_user',
          language_code: 'ru',
        };
      }
      throw new UnauthorizedException('Missing Telegram init data');
    }

    if (!this.botToken) {
      return this.parseUser(initData);
    }

    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    params.delete('hash');

    const dataCheckString = [...params.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    const secretKey = createHmac('sha256', 'WebAppData')
      .update(this.botToken)
      .digest();

    const calculatedHash = createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    if (calculatedHash !== hash) {
      throw new UnauthorizedException('Invalid Telegram init data');
    }

    const authDate = parseInt(params.get('auth_date') ?? '0', 10);
    if (Date.now() / 1000 - authDate > 86400) {
      throw new UnauthorizedException('Telegram init data expired');
    }

    return this.parseUser(initData);
  }

  private parseUser(initData: string): TelegramUser {
    const params = new URLSearchParams(initData);
    const userStr = params.get('user');
    if (userStr) {
      return JSON.parse(userStr) as TelegramUser;
    }
    return { id: 0 };
  }
}
