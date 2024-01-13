import {
    Body,
    Controller,
    Post,
    HttpCode,
    HttpStatus,
    UsePipes,
    Res,
    Req,
    Query,
    Param,
    Get,
    HttpException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { Response, Request } from 'express';
import { ZodValidationPipe } from 'src/db/validation/schema.pipe';
import {
    EmployeeArgs,
    EmployeeSchemaType,
    signInSchema,
    zodOIDValidator,
} from 'src/types/models';
import { ObjectId } from 'mongoose';

@Controller('api/auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private userService: UsersService,
    ) {}

    @Get('find/:data')
    async getData(
        @Param('data') data: keyof EmployeeSchemaType,
        @Query('_id', new ZodValidationPipe(zodOIDValidator)) _id: ObjectId,
    ): Promise<404 | { data: EmployeeSchemaType[keyof EmployeeSchemaType] }> {
        if (data === 'password') {
            throw new HttpException(
                'cannot send password field to the client!',
                HttpStatus.UNAUTHORIZED,
            );
        }

        const borrow = await this.userService.getUser(_id);
        if (!borrow) {
            return HttpStatus.NOT_FOUND;
        }
        return {
            data: borrow[data],
        };
    }

    @Post('register')
    async register(
        @Body() { user, secret }: { user: EmployeeArgs; secret: string },
    ): Promise<any> {
        const newEmployee = await this.authService.newEmployee(user, secret);
        if (!newEmployee) {
            return HttpStatus.BAD_REQUEST;
        }
        return newEmployee;
    }

    @HttpCode(HttpStatus.OK)
    @Post('login')
    @UsePipes(new ZodValidationPipe(signInSchema))
    async signIn(
        @Body() { email, password }: { email: string; password: string },
        @Res() res: Response,
        @Req() req: Request,
    ): Promise<Response<Omit<EmployeeSchemaType, 'password'>>> {
        const userData = await this.authService.signIn(
            email,
            password,
            res,
            req,
        );
        return res.send(userData);
    }

    @HttpCode(HttpStatus.OK)
    @Post('logout')
    logout(@Res() res: Response) {
        this.authService.signOut(res);
        return res.sendStatus(200);
    }

    @HttpCode(HttpStatus.OK)
    @Post('credentials')
    async autoSignin(
        @Req() req: Request,
        @Res() res: Response,
    ): Promise<
        Response<
            204 | (Omit<EmployeeSchemaType, 'password'> & { sub: ObjectId })
        >
    > {
        const userData = await this.authService.autoSignin(req, res);
        if (!userData) {
            return res.sendStatus(204);
        }
        return res.send(userData);
    }
}
