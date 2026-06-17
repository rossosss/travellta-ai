import {
  ConflictException,
  Injectable,
  Logger,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { AppAuthContext, JwtPayload, UserRole } from './auth.types';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

const BCRYPT_ROUNDS = 10;

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async onModuleInit() {
    await this.ensureAdminFromEnv();
  }

  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();
    const existing = await this.usersRepo.findOne({ where: { email } });
    if (existing) {
      throw new ConflictException('Пользователь с таким email уже существует');
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const adminEmail = this.config.get<string>('ADMIN_EMAIL')?.trim().toLowerCase();
    const role: UserRole = adminEmail && email === adminEmail ? 'admin' : 'user';

    const user = this.usersRepo.create({
      email,
      passwordHash,
      telegramId: `email:${randomUUID()}`,
      firstName: dto.firstName?.trim() || email.split('@')[0],
      role,
    });
    await this.usersRepo.save(user);

    return this.buildAuthResponse(user);
  }

  async login(dto: LoginDto) {
    const email = dto.email.trim().toLowerCase();
    const user = await this.usersRepo.findOne({ where: { email } });
    if (!user?.passwordHash) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    return this.buildAuthResponse(user);
  }

  async me(userId: string) {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }
    return this.toPublicUser(user);
  }

  async validateJwt(token: string): Promise<User | null> {
    try {
      const payload = this.jwtService.verify<JwtPayload>(token);
      if (!payload?.sub) return null;
      return this.usersRepo.findOne({ where: { id: payload.sub } });
    } catch {
      return null;
    }
  }

  buildAuthContext(user: User): AppAuthContext {
    return {
      telegramUser: {
        id: this.emailNumericId(user.id),
        first_name: user.firstName || user.email?.split('@')[0] || 'Пользователь',
        language_code: user.languageCode || 'ru',
      },
      userKey: user.telegramId,
      userId: user.id,
      email: user.email ?? undefined,
      role: user.role,
    };
  }

  private buildAuthResponse(user: User) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email!,
      role: user.role,
    };
    return {
      token: this.jwtService.sign(payload),
      user: this.toPublicUser(user),
    };
  }

  private toPublicUser(user: User) {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      role: user.role,
    };
  }

  private async ensureAdminFromEnv() {
    const email = this.config.get<string>('ADMIN_EMAIL')?.trim().toLowerCase();
    const password = this.config.get<string>('ADMIN_PASSWORD');
    if (!email || !password) return;

    let user = await this.usersRepo.findOne({ where: { email } });
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    if (!user) {
      user = this.usersRepo.create({
        email,
        passwordHash,
        telegramId: `email:${randomUUID()}`,
        firstName: 'Admin',
        role: 'admin',
      });
      await this.usersRepo.save(user);
      this.logger.log(`Admin user created for ${email}`);
      return;
    }

    user.role = 'admin';
    user.passwordHash = passwordHash;
    await this.usersRepo.save(user);
    this.logger.log(`Admin user synced for ${email}`);
  }

  private emailNumericId(userId: string): number {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = (Math.imul(31, hash) + userId.charCodeAt(i)) | 0;
    }
    return 800_000_000 + (Math.abs(hash) % 99_000_000);
  }
}
