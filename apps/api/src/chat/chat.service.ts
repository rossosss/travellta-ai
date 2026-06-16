import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IntentParserService } from '../ai/intent-parser.service';
import { ChatSession } from '../entities/chat-session.entity';
import { Message } from '../entities/message.entity';
import { User } from '../entities/user.entity';
import { TelegramUser } from '../telegram/telegram.service';
import { TravelService } from '../travel/travel.service';
import { TravelPreferences } from '../travel/travel.types';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
    @InjectRepository(ChatSession)
    private readonly sessionsRepo: Repository<ChatSession>,
    @InjectRepository(Message)
    private readonly messagesRepo: Repository<Message>,
    private readonly intentParser: IntentParserService,
    private readonly travelService: TravelService,
  ) {}

  async getOrCreateUser(telegramUser: TelegramUser): Promise<User> {
    let user = await this.usersRepo.findOne({
      where: { telegramId: String(telegramUser.id) },
    });

    if (!user) {
      user = this.usersRepo.create({
        telegramId: String(telegramUser.id),
        firstName: telegramUser.first_name,
        lastName: telegramUser.last_name,
        username: telegramUser.username,
        languageCode: telegramUser.language_code,
      });
      await this.usersRepo.save(user);
    }

    return user;
  }

  async getOrCreateSession(
    userId: string,
    sessionId?: string,
    mode: 'chat' | 'lucky' = 'chat',
  ): Promise<ChatSession> {
    if (sessionId) {
      const existing = await this.sessionsRepo.findOne({
        where: { id: sessionId, userId },
      });
      if (existing) return existing;
    }

    const session = this.sessionsRepo.create({ userId, mode, context: {} });
    return this.sessionsRepo.save(session);
  }

  async getLatestSession(userId: string) {
    const session = await this.sessionsRepo.findOne({
      where: { userId },
      order: { updatedAt: 'DESC' },
    });

    if (!session) return null;

    return this.getSessionHistory(session.id, userId);
  }

  async getSessionHistory(sessionId: string, userId: string) {
    const session = await this.sessionsRepo.findOne({
      where: { id: sessionId, userId },
    });

    if (!session) return null;

    const messages = await this.messagesRepo.find({
      where: { sessionId },
      order: { createdAt: 'ASC' },
    });

    return {
      sessionId: session.id,
      mode: session.mode,
      messages: messages
        .filter((m) => m.type !== 'loading')
        .map((m) => ({
        id: m.id,
        role: m.role,
        type: m.type,
        content: m.content,
        metadata: m.metadata,
        createdAt: m.createdAt,
      })),
    };
  }

  async processMessage(
    telegramUser: TelegramUser,
    content: string,
    sessionId?: string,
    mode?: 'chat' | 'lucky',
  ) {
    const user = await this.getOrCreateUser(telegramUser);
    const session = await this.getOrCreateSession(user.id, sessionId, mode);

    await this.saveMessage(session.id, 'user', 'text', content);

    const context = (session.context ?? {}) as Record<string, unknown>;
    const parsed = await this.intentParser.parse(content, context);

    if (parsed.intent === 'lucky_start') {
      return this.startLuckyFlow(session);
    }

    if (parsed.intent === 'clarify') {
      const assistantMsg = await this.saveMessage(
        session.id,
        'assistant',
        'question',
        parsed.clarifyingQuestion ?? 'Расскажите подробнее',
      );

      await this.updateSession(session.id, {
        context: { ...context, preferences: parsed.preferences },
      });

      return {
        sessionId: session.id,
        message: this.formatMessage(assistantMsg),
      };
    }

    const preferences = parsed.preferences;
    await this.updateSession(session.id, {
      context: { preferences },
    });

    const loadingMsg = await this.saveMessage(
      session.id,
      'assistant',
      'loading',
      'Подбираю маршруты: самолёт, поезд и автобус с удобными пересадками... ✈️🚆',
    );

    const packages = await this.travelService.buildTripPackages(
      preferences,
      preferences.destinationCode ? 1 : 3,
    );
    await this.messagesRepo.delete(loadingMsg.id);

    const responseText =
      packages.length > 1
        ? `Нашёл ${packages.length} отличных варианта для вас!`
        : 'Вот лучший вариант для вашего отпуска:';

    const assistantMsg = await this.saveMessage(
      session.id,
      'assistant',
      'trip_result',
      responseText,
      { packages },
    );

    return {
      sessionId: session.id,
      message: this.formatMessage(assistantMsg),
    };
  }

  async startLuckyFlow(session: ChatSession) {
    const questions = this.travelService.getLuckyQuestions();
    const firstQuestion = questions[0];

    await this.updateSession(session.id, {
      mode: 'lucky',
      context: {
        luckyMode: true,
        luckyStep: 0,
        luckyAnswers: {},
        preferences: { budget: 100000 },
      },
    });

    const intro = await this.saveMessage(
      session.id,
      'assistant',
      'text',
      '🎲 Отлично! Давайте испытаем удачу — ответьте на пару вопросов, и я подберу сюрприз-путешествие!',
    );

    const question = await this.saveMessage(
      session.id,
      'assistant',
      'question',
      firstQuestion.question,
      { question: firstQuestion },
    );

    return {
      sessionId: session.id,
      messages: [this.formatMessage(intro), this.formatMessage(question)],
    };
  }

  async processLuckyAnswer(
    telegramUser: TelegramUser,
    sessionId: string,
    questionId: string,
    answer: string,
  ) {
    const user = await this.getOrCreateUser(telegramUser);
    const session = await this.sessionsRepo.findOne({
      where: { id: sessionId, userId: user.id },
    });

    if (!session) {
      throw new Error('Session not found');
    }

    await this.saveMessage(session.id, 'user', 'text', answer);

    const context = session.context as Record<string, unknown>;
    const luckyStep = (context.luckyStep as number) ?? 0;
    const luckyAnswers = (context.luckyAnswers as Record<string, string>) ?? {};
    luckyAnswers[questionId] = answer;

    let preferences = (context.preferences as TravelPreferences) ?? {};
    preferences = this.intentParser.mapLuckyAnswer(questionId, answer, preferences);

    const questions = this.travelService.getLuckyQuestions();
    const nextStep = luckyStep + 1;

    if (nextStep < questions.length) {
      const nextQuestion = questions[nextStep];
      await this.updateSession(session.id, {
        context: {
          ...context,
          luckyStep: nextStep,
          luckyAnswers,
          preferences,
        },
      });

      const questionMsg = await this.saveMessage(
        session.id,
        'assistant',
        'question',
        nextQuestion.question,
        { question: nextQuestion },
      );

      return {
        sessionId: session.id,
        message: this.formatMessage(questionMsg),
        done: false,
      };
    }

    await this.updateSession(session.id, {
      mode: 'chat',
      context: { ...context, luckyAnswers, preferences },
    });

    const loadingMsg = await this.saveMessage(
      session.id,
      'assistant',
      'loading',
      '🎰 Крутим рулетку направлений...',
    );

    if (!preferences.dateFrom) {
      const d = new Date();
      d.setDate(d.getDate() + 21);
      preferences.dateFrom = d.toISOString().split('T')[0];
      d.setDate(d.getDate() + 10);
      preferences.dateTo = d.toISOString().split('T')[0];
    }

    const packages = await this.travelService.buildTripPackages(preferences, 1);
    await this.messagesRepo.delete(loadingMsg.id);

    const assistantMsg = await this.saveMessage(
      session.id,
      'assistant',
      'trip_result',
      '🎉 Удача на вашей стороне! Вот ваш сюрприз-отпуск:',
      { packages },
    );

    return {
      sessionId: session.id,
      message: this.formatMessage(assistantMsg),
      done: true,
    };
  }

  private async updateSession(
    sessionId: string,
    data: { context?: Record<string, unknown>; mode?: ChatSession['mode'] },
  ) {
    const patch: Record<string, unknown> = {};
    if (data.context !== undefined) patch.context = data.context;
    if (data.mode !== undefined) patch.mode = data.mode;
    await this.sessionsRepo.update(sessionId, patch);
  }

  private async saveMessage(
    sessionId: string,
    role: 'user' | 'assistant' | 'system',
    type: 'text' | 'trip_result' | 'question' | 'loading',
    content: string,
    metadata?: Record<string, unknown>,
  ) {
    const message = this.messagesRepo.create({
      sessionId,
      role,
      type,
      content,
      metadata,
    });
    return this.messagesRepo.save(message);
  }

  private formatMessage(message: Message) {
    return {
      id: message.id,
      role: message.role,
      type: message.type,
      content: message.content,
      metadata: message.metadata,
      createdAt: message.createdAt,
    };
  }
}
