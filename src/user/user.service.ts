import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LoginDto, User, UserDocument, UserDto } from './user';
import * as bcrypt from 'bcrypt';
import { Exception, NoUserException, NoVerificationCodes, VerificationCodeExpired, VerificationCodeMismatch, VerificationTypeMismatch } from 'src/exceptions';
import { IVerification, Verification, VerificationDocument, VerificationDto, VerificationType } from '../verification/verification';

@Injectable()
export class UserService {

    logger = new Logger('UserService');
    
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        @InjectModel(Verification.name) private verificationModel: Model<VerificationDocument>
    ) {
    }

    async testMethod() {
        const user = await this.userModel.findOne({ eamil: 'collinkleest@gmail.com' });
        user.updateOne({
            verification: new this.verificationModel({
                code: '123456',
                timestamp: '21341241414',
                type: 'registration'
            })
            
        }).then(() => {console.log('sucess')})
        .catch((err) => {console.log(err)})
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
        const currentTimestamp = new Date().getTime();
        const userModel = new this.userModel({
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: passwordHash,
            createdTimestamp: currentTimestamp
        });
        return userModel.save();
    }

}
