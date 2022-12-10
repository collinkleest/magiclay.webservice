import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { User, UserSchema } from 'src/user/user'
import { UserService } from 'src/user/user.service'
import { Verification, VerificationSchema } from './verification'
import { VerificationController } from './verification.controller'
import { VerificationService } from './verification.service'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Verification.name, schema: VerificationSchema }
    ])
  ],
  controllers: [VerificationController],
  providers: [VerificationService, UserService]
})
export class VerificationModule {}
