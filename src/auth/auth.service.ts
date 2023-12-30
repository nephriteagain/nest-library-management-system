import {
    Injectable,
    UnauthorizedException,
    NotFoundException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) {}

    async signIn(username: string, pass: string): Promise<any> {
        const user = await this.usersService.findUser(username);
        console.log(user);
        if (!user) {
            throw new NotFoundException();
        }
        const isOk = this.usersService.loginUser(user.password, pass);
        if (!isOk) {
            throw new UnauthorizedException();
        }
        const { password, ...result } = user;
        const payload = { sub: result._id, email: result.email };

        return {
            access_token: await this.jwtService.signAsync(payload),
        };
    }
}
