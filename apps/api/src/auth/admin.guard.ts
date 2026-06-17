import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { AppAuthContext } from './auth.types';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const auth = request.auth as AppAuthContext | undefined;
    if (auth?.role !== 'admin') {
      throw new ForbiddenException('Доступ только для администратора');
    }
    return true;
  }
}
