import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { VerificationController } from './verification/verification.controller';
import { VerificationService } from './verification/verification.service';
import { VerificationModule } from './verification/verification.module';

@Module({
  imports: [
    UserModule,
    MongooseModule.forRoot('mongodb://localhost/magiclay'),
    VerificationModule,
  ],
  controllers: [AppController, VerificationController],
  providers: [AppService, VerificationService],
})
export class AppModule {}
