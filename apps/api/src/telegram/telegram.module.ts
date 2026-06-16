import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { TelegramAuthGuard } from './telegram.guard';

@Module({
  providers: [TelegramService, TelegramAuthGuard],
  exports: [TelegramService, TelegramAuthGuard],
})
export class TelegramModule {}
