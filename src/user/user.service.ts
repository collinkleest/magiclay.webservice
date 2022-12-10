import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, UserDto } from './user';
import * as bcrypt from 'bcrypt';
import { IMessage } from 'src/common';

@Injectable()
export class UserService {
  private logger = new Logger('UserService');

  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async checkUserExistsByEmail(email: string): Promise<boolean> {
    const user = await this.userModel.findOne({ email });
    return !!user;
  }

  async getUserByEmail(email: string): Promise<UserDocument> {
    return await this.userModel.findOne({ email });
  }

  async getUserById(userId: string): Promise<UserDocument> {
    return await this.userModel.findById(userId);
  }

  private async generatePasswordHash(password: string): Promise<string> {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    return await bcrypt.hash(password, salt);
  }

  async createNewUser({
    firstName,
    lastName,
    email,
    password,
  }: UserDto): Promise<IMessage> {
    this.logger.log(
      `Creating new user with first name: ${firstName}, last name: ${lastName}, email: ${email}`,
    );
    try {
        const passwordHash = await this.generatePasswordHash(password);
        const currentTimestamp = new Date().getTime();
        const userModel = new this.userModel({
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: passwordHash,
            createdTimestamp: currentTimestamp,
        });
        try {
            await userModel.save();
            this.logger.log(`Successfully created new user: ${userModel}`);
            return {
                message: "Successfully created user",
                status: HttpStatus.CREATED
            }
        } catch (error) {
            this.logger.error(`Failed to save user: ${userModel}`);
            throw new HttpException('Registration error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    } catch (error) {
        this.logger.error(`Failed to generate password hash`);
        throw new HttpException('Registration error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

}
