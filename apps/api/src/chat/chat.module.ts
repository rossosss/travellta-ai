import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiModule } from '../ai/ai.module';
import { ChatSession } from '../entities/chat-session.entity';
import { Message } from '../entities/message.entity';
import { User } from '../entities/user.entity';
import { TelegramModule } from '../telegram/telegram.module';
import { TravelModule } from '../travel/travel.module';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, ChatSession, Message]),
    TelegramModule,
    TravelModule,
    AiModule,
  ],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
