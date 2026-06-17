import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { TelegramModule } from '../telegram/telegram.module';
import { AdminGuard } from './admin.guard';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { WebAuthGuard } from './web-auth.guard';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    TelegramModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const expiresIn = config.get<string>('JWT_EXPIRES_IN') ?? '30d';
        return {
          secret: config.get<string>('JWT_SECRET') ?? 'dev-jwt-secret-change-me',
          signOptions: { expiresIn: expiresIn as `${number}d` },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, WebAuthGuard, JwtAuthGuard, AdminGuard],
  exports: [AuthService, WebAuthGuard, JwtAuthGuard, AdminGuard, JwtModule],
})
export class AuthModule {}
