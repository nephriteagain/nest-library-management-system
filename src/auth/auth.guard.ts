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

        // NOTE: this is safe because there is a password required in the request body
        if (
            request.path === '/api/auth/register' || 
            request.path === ('api/auth/login')
        ) {
            console.log(request.path, 'is allowed')
            return true;
        }

        // if (
        //     envConstants.regexRoutes.some((item) =>
        //         item.regex.test(request.path),
        //     )
        // ) {
        //     console.log('spa routes matched, interceptor will handle it');
        //     return true;
        // }

        if (request.path.startsWith('/api/auth') && request.method !== 'GET') {
            console.log('GET on auth, guard skipped');
            return true;
        }

        const jwt = request.cookies.jwt;
        if (!jwt) {
            throw new UnauthorizedException('now jwt found!')
        }
        try {
            const payload = await this.jwtService.verifyAsync(jwt, {
                secret: `${envConstants.secret}`,
            });
            // 💡 We're assigning the payload to the request object here
            // so that we can access it in our route handlers
            // request['user'] = payload;
        } catch {
            console.error('invalid jwt');
            throw new UnauthorizedException('invalid jwt')
        }
        return true;
    }
}
