import { Body, Controller, Post } from '@nestjs/common';
import { VerificationDto } from './verification';
import { VerificationService } from './verification.service';

@Controller('verification')
export class VerificationController {

  constructor(private verificationService: VerificationService) {}

  @Post('generate-code')
  async generateCode(@Body() verificationDto: VerificationDto) {
    return this.verificationService.sendVerificationEmail(
      verificationDto.email,
    );
  }

  @Post('verify')
  async verify(@Body() verificationDto: VerificationDto) {
    // return await this.userService.verifyUser(verificationDto);
  } 

}
