import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { UserModule } from './user/user.module'
import { VerificationModule } from './verification/verification.module'
import { AuthModule } from './auth/auth.module'
import { GroupModule } from './group/group.module'
import { ParlayModule } from './parlay/parlay.module'

@Module({
  imports: [
    UserModule,
    MongooseModule.forRoot('mongodb://localhost/magiclay'),
    VerificationModule,
    AuthModule,
    GroupModule,
    ParlayModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
