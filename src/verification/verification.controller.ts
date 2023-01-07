import { Body, Controller, Post } from '@nestjs/common'
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty } from 'class-validator'
import { Message } from 'src/common'
import { GenerateVerificationDto, VerificationDto } from './verification'
import { VerificationService } from './verification.service'

@ApiTags('verification')
@Controller('verification')
export class VerificationController {
  constructor(private verificationService: VerificationService) {}

  @Post('generate-code')
  @ApiCreatedResponse({ type: Message })
  async generateCode(@Body() { email }: GenerateVerificationDto) {
    return this.verificationService.sendVerificationEmail(email)
  }

  @Post('verify')
  @ApiCreatedResponse({ type: Message })
  async verify(@Body() verificationDto: VerificationDto): Promise<Message> {
    return await this.verificationService.verifyUser(verificationDto)
  }
}
