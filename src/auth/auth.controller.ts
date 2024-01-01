import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @HttpCode(HttpStatus.OK)
    @Post('login')
    async signIn(@Body() { email, password }: { email: string; password: string }) : Promise<{access_token: string;}> {
        const token = this.authService.signIn(email, password);
        return token
    }
}
