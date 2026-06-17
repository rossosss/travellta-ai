import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AppAuthContext, WebAuthGuard } from '../auth/web-auth.guard';
import { ChatService } from './chat.service';
import { LuckyAnswerDto, SendMessageDto, StartLuckyDto } from './dto/chat.dto';

interface AuthRequest {
  auth: AppAuthContext;
}

@Controller('chat')
@UseGuards(WebAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('sessions')
  async listSessions(@Req() req: AuthRequest) {
    const user = await this.chatService.getOrCreateUser(req.auth);
    return this.chatService.listSessions(user.id);
  }

  @Post('sessions')
  async createSession(@Req() req: AuthRequest) {
    const user = await this.chatService.getOrCreateUser(req.auth);
    return this.chatService.createSession(user.id);
  }

  @Get('latest')
  async getLatest(@Req() req: AuthRequest) {
    const user = await this.chatService.getOrCreateUser(req.auth);
    return this.chatService.getLatestSession(user.id);
  }

  @Get('session/:id')
  async getSession(@Req() req: AuthRequest, @Param('id') id: string) {
    const user = await this.chatService.getOrCreateUser(req.auth);
    return this.chatService.getSessionHistory(id, user.id);
  }

  @Post('message')
  async sendMessage(@Req() req: AuthRequest, @Body() dto: SendMessageDto) {
    return this.chatService.processMessage(
      req.auth,
      dto.content,
      dto.sessionId,
      dto.mode,
    );
  }

  @Post('lucky/start')
  async startLucky(@Req() req: AuthRequest, @Body() dto: StartLuckyDto) {
    const user = await this.chatService.getOrCreateUser(req.auth);
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
      req.auth,
      dto.sessionId,
      dto.questionId,
      dto.answer,
    );
  }
}
