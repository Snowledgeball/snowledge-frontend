import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    // Simule une auth (à remplacer par une vraie vérif JWT/session)
    const request = context.switchToHttp().getRequest();
    return !!request.headers['authorization'];
  }
}
