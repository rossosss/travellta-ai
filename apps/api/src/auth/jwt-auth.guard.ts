import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractBearer(request.headers.authorization);
    if (!token) {
      throw new UnauthorizedException('Требуется авторизация');
    }

    const user = await this.authService.validateJwt(token);
    if (!user) {
      throw new UnauthorizedException('Сессия истекла или недействительна');
    }

    request.auth = this.authService.buildAuthContext(user);
    return true;
  }

  private extractBearer(header?: string): string | null {
    if (!header?.startsWith('Bearer ')) return null;
    const token = header.slice(7).trim();
    return token || null;
  }
}
