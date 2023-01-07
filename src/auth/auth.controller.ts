import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Logger,
  Post,
  Req,
  Res
} from '@nestjs/common'
import {
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags
} from '@nestjs/swagger'
import { Request, Response } from 'express'
import { Message } from 'src/common'
import { LoginDto, LoginResponse, ResetPasswordDto } from './auth'
import { AuthService } from './auth.service'

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  private logger = new Logger('AuthController')

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

  @Post('refresh')
  @ApiCreatedResponse({ type: LoginResponse })
  @ApiCookieAuth('jid')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ): Promise<LoginResponse> {
    const jid = req.cookies.jid
    if (!jid) {
      this.logger.error('No refresh token found in cookie')
      throw new HttpException(
        'No refresh token attached to request',
        HttpStatus.FORBIDDEN
      )
    }
    return await this.authService.refresh(jid, res)
  }
}
