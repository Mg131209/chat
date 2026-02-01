import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  logger: Logger;
  constructor(private jwtService: JwtService) {
    this.logger = new Logger(AuthGuard.name);
  }
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const authorization: string | undefined = request.headers.authorization;
    const token: string | undefined = authorization?.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const tokenPayload = await this.jwtService.verifyAsync(token);
      request.user = {
        userId: tokenPayload.sub,
        username: tokenPayload.username,
      };
    } catch (error) {
      this.logger.error(error.message);
      throw new UnauthorizedException(error);
    }
    return true;
  }
}
