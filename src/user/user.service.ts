import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LoginDto, User, UserDocument, UserDto, Verification, VerificationDto, VerificationType } from './user';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';
import { Exception, NoUserException, NoVerificationCodes, VerificationCodeExpired, VerificationCodeMismatch, VerificationTypeMismatch } from 'src/exceptions';

@Injectable()
export class UserService {

    logger = new Logger('UserService');
    
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
    ) {
    }

    async checkUserExistsByEmail(email: string): Promise<boolean> {
        const user = await this.userModel.findOne({ email });
        return !!user;
    }

    async getUser(userId: string): Promise<UserDocument> {
        return await this.userModel.findById(userId);
    }

    private async generatePasswordHash(password: string): Promise<string> {
        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds)
        return await bcrypt.hash(password, salt);
    }

    private async checkPassword(password: string, hash: string): Promise<boolean> {
        return await bcrypt.compare(password, hash);
    }

    async login({email, password}: LoginDto): Promise<boolean | Exception> {
        const user = await this.userModel.findOne({ email });
        if (!user) {
            return NoUserException;
        }
        const passwordMatches = this.checkPassword(password, user.password);
        return passwordMatches;
    }

    async createNewUser({ firstName, lastName, email, password}: UserDto): Promise<UserDocument> {
        this.logger.log(`Creating new user with first name: ${firstName}, last name: ${lastName}, email: ${email}`)
        const passwordHash = await this.generatePasswordHash(password);
        const userModel = new this.userModel({
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: passwordHash
        });
        return userModel.save();
    }

    private isTimestampExpired(timestamp: number): boolean {
        return Date.now() >= timestamp;
    }
    
    private getValidVerifications(verifications: Verification[]): Verification[]{
        return verifications.filter((verification) => {
            if (!this.isTimestampExpired(verification.timestamp)){
                return verification;
            }
        })
    }

    private async addVerificationCode(code: number, timestamp: number, email: string) {
        let user = await this.userModel.findOne({ email });
        let validVerifications = this.getValidVerifications(user.verifications);
        let newVerification: Verification = {
            code: code,
            type: VerificationType.REGISTRATION,
            timestamp: timestamp
        }
        await user.updateOne({
            verifications: [...validVerifications, newVerification]
        })
    }

    private async confirmEmail(user: UserDocument) {
        return user.updateOne({
            active: true,
            verifications: []
        })
    }

    async verifyUser({code, type, email}: VerificationDto) {
        let user = await this.userModel.findOne({ email });
        let foundException;
        if (user.verifications.length){
            user.verifications.forEach((verification) => {
                
                if (verification.code === code) {
                    if (!this.isTimestampExpired(verification.timestamp)){
                        if (verification.type === type) {
                            if (verification.type === VerificationType.REGISTRATION){
                                foundException = this.confirmEmail(user);
                            }
                        } else {
                            throw new HttpException('Verification code does not match given type', HttpStatus.UNAUTHORIZED)
                            foundException = VerificationTypeMismatch;
                        }
                    } else {
                        throw new HttpException('Verification code has expired', HttpStatus.UNAUTHORIZED)
                        foundException = VerificationCodeExpired;
                    }
                }

            })
            throw new HttpException('Verification code is invalid', HttpStatus.UNAUTHORIZED)
        } else {
            return NoVerificationCodes;
        }
    }

    async sendVerificationEmail(emailAddress: string){
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            },
          });
        
        const verificationCode = Math.floor(100000 + Math.random() * 900000);
        const timeStamp = Date.now() + (15 * 60000);
        
        let mailDetails = {
            from: 'magiclay@gmail.com',
            to: emailAddress,
            subject: 'MagicLay Verification',
            text: `Your verification code is ${verificationCode}, this code will expire in 15 minutes`
        };
         
        transporter.sendMail(mailDetails, function(err, data) {
            if (err) {
                console.log('Error Occurs');
            } else {
                console.log('Email sent successfully');
            }
        });

        await this.addVerificationCode(verificationCode, timeStamp, emailAddress);
    }

}
