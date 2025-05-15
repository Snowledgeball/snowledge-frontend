import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const isAuth = request.headers['x-auth-token'] === '12345';

    if (!isAuth) {
      throw new UnauthorizedException('Token invalide ou manquant');
    }

    return true;
  }
}
