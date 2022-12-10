import { Body, Controller, Post } from '@nestjs/common';
import { IMessage } from 'src/common';
import { LoginDto } from './auth';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {

    constructor(private authService: AuthService) {}

    @Post('login')
    async login(@Body() loginDto: LoginDto): Promise<IMessage> {
        return this.authService.login(loginDto);
    }

}
