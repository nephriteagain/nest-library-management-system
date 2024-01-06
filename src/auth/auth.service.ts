import {
    Injectable,
    UnauthorizedException,
    NotFoundException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { ObjectId } from 'mongoose';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) {}

    // TODO: i am getting a access token even with incorrect password!
    async signIn(
        email: string,
        pass: string,
    ): Promise<{ access_token: string }> {
        const user = await this.usersService.findUser(email);
        if (!user) {
            throw new NotFoundException();
        }
        const isOk = this.usersService.loginUser(pass, user.password);
        if (!isOk) {
            throw new UnauthorizedException();
        }
        const payload = { sub: user._id, email: user.email };

        return {
            access_token: await this.jwtService.signAsync(payload),
        };
    }

    extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }

    getTokenData(accessToken: string): { sub: ObjectId; email: string } {
        return this.jwtService.decode<{
            sub: ObjectId;
            email: string;
            [key: string]: any;
        }>(accessToken);
    }
}
