import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { IMessage } from 'src/common';
import { UserDocument } from 'src/user/user';
import { UserService } from 'src/user/user.service';
import {
  Verification,
  VerificationDocument,
  VerificationDto,
} from './verification';

@Injectable()
export class VerificationService {
  private logger = new Logger('VerificationService');

  constructor(
    @InjectModel(Verification.name)
    private verificationModel: Model<VerificationDocument>,
    private userService: UserService,
  ) {}

  async verifyUser({ code, email }: VerificationDto): Promise<IMessage> {
    try {
        const user = await this.userService.getUserByEmail(email);
        try {
            const verification = await this.verificationModel.findOne({ userId: user.id });
            if (verification.code === code) {
                if (!this.isTimestampExpired(verification.timestamp)) {
                    await this.confirmEmail(user, verification);
                    this.logger.log(`Successfully verified email: ${email}`)
                    return {
                        message: 'Verification successful',
                        status: HttpStatus.CREATED
                    } as IMessage
                } else {
                    this.logger.error(`Verification error for email: ${email}, code has expired`);
                    throw new HttpException("Verification error", HttpStatus.BAD_REQUEST);
                }
            } else {
                this.logger.error(`Verification error for email: ${email}, code is invalid`);
                throw new HttpException("Verification error", HttpStatus.BAD_REQUEST);
            }
        } catch (error) {
            this.logger.error(`Verification error: ${error}`);
            throw new HttpException("Verification error", HttpStatus.BAD_REQUEST);
        }
    } catch(error) {
        this.logger.error(`Verification error: ${error}`);
        throw new HttpException("Verification error", HttpStatus.BAD_REQUEST)
    }
  }

  private async addVerificationCode(code: number, timestamp: number, email: string): Promise<IMessage> {
    try {
        const user = await this.userService.getUserByEmail(email);
        try {
            // look for a current verification code in the database, if found delete it
            await this.verificationModel.findOneAndDelete({
                userId: user.id
            });
            const verification = new this.verificationModel({
                userId: user.id,
                timestamp: timestamp,
                code: code
            });
            await verification.save();
            this.logger.log(`Successfully saved new verification: ${verification}`);
            return {
                message: 'Verifiction sucessful',
                status: HttpStatus.CREATED
            }
        } catch (error) {
            this.logger.error(`Could not save verification code for ${email}`);
            throw new HttpException('Could not save verification code', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    } catch (error) {
        this.logger.error(`Could not find user by email: ${email}, with error: ${error}`);
        throw new HttpException('There was an error producing the verification code.', HttpStatus.BAD_REQUEST);
    }
  }

  private async confirmEmail(user: UserDocument, verification: VerificationDocument) {
    try {
        await verification.delete();
        await user.updateOne({
                active: true,
            }
        );
    } catch (error) {
        this.logger.error(`Error confirming email: ${error}`);
        throw new HttpException("Verification error", HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  private isTimestampExpired(timestamp: number): boolean {
    return Date.now() >= timestamp;
  }

  private getNodemailerTransport(): Transporter<SMTPTransport.SentMessageInfo> {
    return nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
  }

  private getMailDetails(email: string, code: number): Mail.Options {
    return {
        from: 'magiclay@gmail.com',
        to: email,
        subject: 'MagicLay Verification',
        text: `Your verification code is ${code}, this code will expire in 15 minutes`,
      }
  }

  async sendVerificationEmail(emailAddress: string): Promise<IMessage> {
    const transporter = this.getNodemailerTransport();
    const verificationCode = Math.floor(100000 + Math.random() * 900000);
    const timeStamp = Date.now() + 15 * 60000;
    const mailDetails = this.getMailDetails(emailAddress, verificationCode);

    try {
      await transporter.sendMail(mailDetails);
      try {
        this.logger.log(`Successfully sent email to ${emailAddress}`);
        return await this.addVerificationCode(
          verificationCode,
          timeStamp,
          emailAddress,
        );
      } catch (error) {
        this.logger.error(
          `There was an error adding the verification to the database: ${error}`,
        );
        throw new HttpException(
          "There was an error processing the code verification",
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    } catch (error) {
      this.logger.error(`There was an error sending an email: ${error}`);
      throw new HttpException(
        "There was an error sending the verification code",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
    