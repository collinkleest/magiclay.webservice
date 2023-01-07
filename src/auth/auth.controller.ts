import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res
} from '@nestjs/common'
import { Response } from 'express'
import { IMessage } from 'src/common'
import { LoginDto, ResetPasswordDto } from './auth'
import { AuthService } from './auth.service'

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response
  ): Promise<IMessage> {
    return this.authService.login(loginDto, res)
  }

  @Post('reset-password')
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto
  ): Promise<IMessage> {
    return this.authService.resetPassword(resetPasswordDto)
  }
}
