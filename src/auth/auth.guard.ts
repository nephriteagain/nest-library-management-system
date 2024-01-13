import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
    HttpStatus,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { envConstants } from './constants';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private jwtService: JwtService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request: Request = context.switchToHttp().getRequest();
        const response: Response = context.switchToHttp().getResponse();

        if (request.path === '/') {
            console.log('serving static files');
            return true;
        }

        if (request.path.startsWith('/auth') && request.method !== 'GET') {
            console.log('auth guard skipped');
            return true;
        }

        const jwt = request.cookies.jwt;
        if (!jwt) {
            console.error('no jwt found');
            return false;
        }
        try {
            const payload = await this.jwtService.verifyAsync(jwt, {
                secret: `${envConstants.secret}`,
            });
            console.log('jwt accepted');
            // 💡 We're assigning the payload to the request object here
            // so that we can access it in our route handlers
            // request['user'] = payload;
        } catch {
            console.error('invalid jwt');
            response.sendStatus(HttpStatus.UNAUTHORIZED);
            return false;
        }
        console.log('auth guard passed');
        return true;
    }
}
