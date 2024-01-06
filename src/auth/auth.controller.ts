import {
    Body,
    Controller,
    Post,
    HttpCode,
    HttpStatus,
    UsePipes,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ZodValidationPipe } from 'src/db/validation/schema.pipe';
import { signInSchema } from 'src/types/models';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @HttpCode(HttpStatus.OK)
    @Post('login')
    @UsePipes(new ZodValidationPipe(signInSchema))
    async signIn(
        @Body() { email, password }: { email: string; password: string },
    ): Promise<{ access_token: string }> {
        const token = this.authService.signIn(email, password);
        return token;
    }
}
