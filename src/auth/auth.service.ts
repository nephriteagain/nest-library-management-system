import {
    Injectable,
    UnauthorizedException,
    NotFoundException,
    HttpStatus,
    HttpException,
    BadRequestException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { ObjectId, startSession } from 'mongoose';
import {
    EmployeeArgs,
    EmployeeArgsSchema,
    EmployeeSchemaType,
    P,
} from '../types/models';
import { envConstants } from './constants';
import MembersShema from '../db/schemas/members.shema';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) {}

    // TODO: make a transaction that will auto add employee as a member
    async newEmployee(user: EmployeeArgs, secret: string) {
        if (secret !== envConstants.secret) {
            throw new HttpException('secret incorrect', HttpStatus.UNAUTHORIZED);
        }
        EmployeeArgsSchema.parse(user);
        let session = null;
        try {
            const userSession = await startSession();
            session = userSession;
            userSession.startTransaction();
            const newEmployee = await this.usersService.createUser(user);
            const newMember = await MembersShema.create({
                _id: newEmployee._id,
                name: user.name,
                age: user.age,
                email: user.email,
                approvedBy: newEmployee._id,
            });
            userSession.commitTransaction();
            userSession.endSession();
            return newEmployee;
        } catch (error) {
            console.error(`session aborted, ${error}`);
            if (session) {
                session.abortTransaction();
                session.endSession();
                throw new BadRequestException()
            }
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
        return request.cookies?.jwt || undefined;
    }

    getTokenData(
        accessToken: string,
    ): Omit<EmployeeSchemaType, 'password'> & { sub: ObjectId } {
        return this.jwtService.decode(accessToken);
    }
}
