import {
    Injectable,
    UnauthorizedException,
    NotFoundException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { ObjectId } from 'mongoose';
import { EmployeeSchemaType } from 'src/types/models';
import { envConstants } from './constants';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) {}

    // TODO: i am getting a access token even with incorrect password!
    async signIn(
        emailAddress: string,
        pass: string,
        res: Response,
        req: Request,
    ): Promise<Omit<EmployeeSchemaType, 'password'>> {

        // finds the user
        const user = await this.usersService.findUser(emailAddress);
        // user does not exist, sends 404
        if (!user) {
            throw new NotFoundException();
        }
        // user found, checks if the password matches
        const isOk = await this.usersService.loginUser( pass, user.password);
        // password does not match
        if (!isOk) {
            throw new UnauthorizedException();
        }
        // password matches, creates a jwt token
        const payload = { sub: user._id, email: user.email, name: user.name, age: user.age, joinDate: user.joinDate, _id: user._id };
        const jwt = await this.jwtService.signAsync(payload)
        // created token saved as http-only cookie
        res.cookie('jwt', jwt, {httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000})
        
        // returns the passwordless data to user
        // NOTE: const { password, ...userData } = user
        // this does not work, mongodb will send you a bounch of data
        const { email, name, age, joinDate, _id } = user
        return {email, name,age, joinDate, _id};
    }

    signOut(res:Response) {
        res.clearCookie("jwt")
    }

    extractTokenFromHeader(request: Request): string | undefined {
        return request.cookies.jwt
    }

    getTokenData(accessToken: string): { sub: ObjectId; email: string } {
        return this.jwtService.decode<{
            sub: ObjectId;
            email: string;
            [key: string]: any;
        }>(accessToken);
    }
}
