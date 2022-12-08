import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { UserDocument } from 'src/user/user';
import { UserService } from 'src/user/user.service';
import { IVerification, Verification, VerificationDocument, VerificationDto } from './verification';

@Injectable()
export class VerificationService {
  private logger = new Logger('VerificationService');

  constructor(
    @InjectModel(Verification.name)
    private verificationModel: Model<VerificationDocument>,
    private userService: UserService,
  );

  async verifyUser({ code, type, email }: VerificationDto) {
    // let user = await this.userModel.findOne({ email });
    let foundException;
    // let verification = user.verification;

    // if (verification.code === code) {
    //     if (!this.isTimestampExpired(verification.timestamp)){
    //         if (verification.type === type) {
    //             if (verification.type === VerificationType.REGISTRATION){
    //                 foundException = this.confirmEmail(user);
    //             }
    //         } else {
    //             throw new HttpException('Verification code does not match given type', HttpStatus.UNAUTHORIZED)
    //             foundException = VerificationTypeMismatch;
    //         }
    //     } else {
    //         throw new HttpException('Verification code has expired', HttpStatus.UNAUTHORIZED)
    //         foundException = VerificationCodeExpired;
    //     }
    // }
  }

  private async addVerificationCode(
    code: number,
    timestamp: number,
    email: string,
  ) {
    // let user = await this.userModel.findOne({ email });
    // let newVerification: IVerification = {
    //     code: code,
    //     type: VerificationType.REGISTRATION,
    //     timestamp: timestamp
    // }
    // await user.updateOne({
    //     verification: new this.verificationModel(newVerification)
    // })
  }

  private async confirmEmail(user: UserDocument) {
    return user.updateOne({
      active: true,
      verifications: [],
    });
  }

  private isTimestampExpired(timestamp: number): boolean {
    return Date.now() >= timestamp;
  }

  private isVerificationValid(verification: IVerification): boolean {
    if (!this.isTimestampExpired(verification.timestamp)) {
      return true;
    }
  }

  async sendVerificationEmail(emailAddress: string) {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const verificationCode = Math.floor(100000 + Math.random() * 900000);
    const timeStamp = Date.now() + 15 * 60000;

    const mailDetails = {
      from: 'magiclay@gmail.com',
      to: emailAddress,
      subject: 'MagicLay Verification',
      text: `Your verification code is ${verificationCode}, this code will expire in 15 minutes`,
    };

    try {
      await transporter.sendMail(mailDetails);
      try {
        await this.addVerificationCode(
          verificationCode,
          timeStamp,
          emailAddress,
        );
      } catch (error) {
        this.logger.error(
          `There was an error adding the verification to the database: ${error}`,
        );
        throw new HttpException(
          `There was an error adding the verification to the database: ${error}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    } catch (error) {
      this.logger.error(`There was an error sending an email: ${error}`);
      throw new HttpException(
        `There was an error sending an email: ${error}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
