import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res
} from '@nestjs/common'
import {
  ApiCreatedResponse,
  ApiHeader,
  ApiOkResponse,
  ApiTags
} from '@nestjs/swagger'
import { Response } from 'express'
import { Message } from 'src/common'
import { LoginDto, LoginResponse, ResetPasswordDto } from './auth'
import { AuthService } from './auth.service'

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: LoginResponse })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response
  ): Promise<LoginResponse> {
    return this.authService.login(loginDto, res)
  }

  @Post('reset-password')
  @ApiCreatedResponse({ type: Message })
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto
  ): Promise<Message> {
    return this.authService.resetPassword(resetPasswordDto)
  }
}
