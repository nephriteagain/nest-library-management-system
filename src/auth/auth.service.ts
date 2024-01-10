import {
    Injectable,
    UnauthorizedException,
    NotFoundException,
    HttpStatus,
    HttpException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { ObjectId } from 'mongoose';
import {
    EmployeeArgs,
    EmployeeArgsSchema,
    EmployeeSchemaType,
    P,
} from 'src/types/models';
import { envConstants } from './constants';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) {}

    async newEmployee(user: EmployeeArgs, secret: string) {
        if (secret !== envConstants.secret) {
            throw new HttpException('unauthorzed', HttpStatus.UNAUTHORIZED);
        }
        EmployeeArgsSchema.parse(user);
        try {
            const newEmployee = await this.usersService.createUser(user);
            return newEmployee;
        } catch (error) {
            throw new HttpException(
                'email already in used',
                HttpStatus.CONFLICT,
            );
        }
    }

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
        const isOk = await this.usersService.loginUser(pass, user.password);
        // password does not match
        if (!isOk) {
            throw new UnauthorizedException();
        }
        // password matches, creates a jwt token
        const payload = {
            sub: user._id,
            email: user.email,
            name: user.name,
            age: user.age,
            joinDate: user.joinDate,
            _id: user._id,
        };
        const jwt = await this.jwtService.signAsync(payload);
        // created token saved as http-only cookie
        res.cookie('jwt', jwt, {
            httpOnly: true,
            maxAge: 604_800_000,
            path: '/',
            sameSite: 'none',
            secure: true,
        });
        // returns the passwordless data to user
        // NOTE: const { password, ...userData } = user
        // this does not work, mongodb will send you a bounch of data
        const { email, name, age, joinDate, _id } = user;
        return { email, name, age, joinDate, _id };
    }

    async autoSignin(
        req: Request,
        res: Response,
    ): P<null | (Omit<EmployeeSchemaType, 'password'> & { sub: ObjectId })> {
        try {
            const jwt = this.extractTokenFromHeader(req);
            if (!jwt) {
                console.log('no jwt token');
                return null;
            }
            await this.jwtService.verifyAsync(jwt, {
                secret: envConstants.secret,
            });

            const data = this.getTokenData(jwt);
            console.log('valid token, signing in');
            return data;
        } catch (error) {
            console.error('invalid jwt token');
            res.clearCookie('jwt');
            return null;
        }
    }

    signOut(res: Response) {
        res.clearCookie('jwt');
    }

    extractTokenFromHeader(request: Request): string | undefined {
        return request.cookies.jwt;
    }

    getTokenData(
        accessToken: string,
    ): Omit<EmployeeSchemaType, 'password'> & { sub: ObjectId } {
        return this.jwtService.decode(accessToken);
    }
}
