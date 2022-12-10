import { Body, Controller, Post } from '@nestjs/common'
import { IsEmail, IsNotEmpty } from 'class-validator'
import { GenerateVerificationDto, VerificationDto } from './verification'
import { VerificationService } from './verification.service'

@Controller('verification')
export class VerificationController {
  constructor(private verificationService: VerificationService) {}

  @Post('generate-code')
  async generateCode(@Body() { email }: GenerateVerificationDto) {
    return this.verificationService.sendVerificationEmail(email)
  }

  @Post('verify')
  async verify(@Body() verificationDto: VerificationDto) {
    return await this.verificationService.verifyUser(verificationDto)
  }
}
