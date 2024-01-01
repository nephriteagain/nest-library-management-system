import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
    HttpStatus,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { jwtConstants } from './constants';
import { AuthService } from './auth.service';


@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private jwtService: JwtService,
        private authService: AuthService
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const response: Response = context.switchToHttp().getResponse();
        const token = this.authService.extractTokenFromHeader(request);
        if (!token) {
            response.redirect(HttpStatus.PERMANENT_REDIRECT, '/signin');
            return false;
        }
        try {
            const payload = await this.jwtService.verifyAsync(token, {
                secret: `${jwtConstants.secret}`,
            });
            // 💡 We're assigning the payload to the request object here
            // so that we can access it in our route handlers
            request['user'] = payload;
        } catch {
            response.sendStatus(HttpStatus.SERVICE_UNAVAILABLE);
            return false;
        }
        return true;
    }

}
