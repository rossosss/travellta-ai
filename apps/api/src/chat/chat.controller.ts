import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { TelegramAuthGuard } from '../telegram/telegram.guard';
import { TelegramUser } from '../telegram/telegram.service';
import { ChatService } from './chat.service';
import { LuckyAnswerDto, SendMessageDto, StartLuckyDto } from './dto/chat.dto';

interface AuthRequest {
  telegramUser: TelegramUser;
}

@Controller('chat')
@UseGuards(TelegramAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('sessions')
  async listSessions(@Req() req: AuthRequest) {
    const user = await this.chatService.getOrCreateUser(req.telegramUser);
    return this.chatService.listSessions(user.id);
  }

  @Post('sessions')
  async createSession(@Req() req: AuthRequest) {
    const user = await this.chatService.getOrCreateUser(req.telegramUser);
    return this.chatService.createSession(user.id);
  }

  @Get('latest')
  async getLatest(@Req() req: AuthRequest) {
    const user = await this.chatService.getOrCreateUser(req.telegramUser);
    return this.chatService.getLatestSession(user.id);
  }

  @Get('session/:id')
  async getSession(@Req() req: AuthRequest, @Param('id') id: string) {
    const user = await this.chatService.getOrCreateUser(req.telegramUser);
    return this.chatService.getSessionHistory(id, user.id);
  }

  @Post('message')
  async sendMessage(@Req() req: AuthRequest, @Body() dto: SendMessageDto) {
    return this.chatService.processMessage(
      req.telegramUser,
      dto.content,
      dto.sessionId,
      dto.mode,
    );
  }

  @Post('lucky/start')
  async startLucky(@Req() req: AuthRequest, @Body() dto: StartLuckyDto) {
    const user = await this.chatService.getOrCreateUser(req.telegramUser);
    const session = await this.chatService.getOrCreateSession(
      user.id,
      dto.sessionId,
      'lucky',
    );
    return this.chatService.startLuckyFlow(session);
  }

  @Post('lucky/answer')
  async luckyAnswer(@Req() req: AuthRequest, @Body() dto: LuckyAnswerDto) {
    return this.chatService.processLuckyAnswer(
      req.telegramUser,
      dto.sessionId,
      dto.questionId,
      dto.answer,
    );
  }
}
