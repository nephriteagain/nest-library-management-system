import {
    Body,
    Controller,
    Post,
    HttpCode,
    HttpStatus,
    UsePipes,        
    Res,
    Req
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response, Request } from 'express';
import { ZodValidationPipe } from 'src/db/validation/schema.pipe';
import { EmployeeSchemaType, signInSchema } from 'src/types/models';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @HttpCode(HttpStatus.OK)
    @Post('login')
    @UsePipes(new ZodValidationPipe(signInSchema))
    async signIn (
        @Body() { email, password }: { email: string; password: string },
        @Res() res: Response,
        @Req() req: Request
    ) : Promise<Response<Omit<EmployeeSchemaType,'password'>>>
    {
        const userData = await this.authService.signIn(email, password, res, req);
        return res.send(userData);
    }

    @HttpCode(HttpStatus.OK)
    @Post('logout')
    logout(@Res() res : Response) {
        this.authService.signOut(res)
        return res.sendStatus(200)
    }
}
