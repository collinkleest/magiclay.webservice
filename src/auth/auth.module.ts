import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { User, UserSchema } from 'src/user/user'
import { UserService } from 'src/user/user.service'
import { Verification, VerificationSchema } from 'src/verification/verification'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Verification.name, schema: VerificationSchema }
    ])
  ],
  controllers: [AuthController],
  providers: [AuthService, UserService]
})
export class AuthModule {}
