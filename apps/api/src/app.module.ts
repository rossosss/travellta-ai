import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiModule } from './ai/ai.module';
import { ChatModule } from './chat/chat.module';
import { GeocodeCache } from './entities/geocode-cache.entity';
import { ChatSession } from './entities/chat-session.entity';
import { Message } from './entities/message.entity';
import { User } from './entities/user.entity';
import { TelegramModule } from './telegram/telegram.module';
import { TravelModule } from './travel/travel.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['../../.env', '.env'],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        entities: [User, ChatSession, Message, GeocodeCache],
        synchronize: true,
        logging: config.get('NODE_ENV') === 'development',
      }),
    }),
    TelegramModule,
    TravelModule,
    AiModule,
    ChatModule,
  ],
})
export class AppModule {}
