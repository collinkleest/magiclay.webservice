import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { UserDetails, User, UserDocument, UserDto } from './user'
import { Message } from 'src/common'
import { generatePasswordHash } from 'src/utils'

@Injectable()
export class UserService {
  private logger = new Logger('UserService')

  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async checkUserExistsByEmail(email: string): Promise<boolean> {
    const user = await this.userModel.findOne({ email })
    return !!user
  }

  async getUserByEmail(email: string): Promise<UserDocument> {
    return await this.userModel.findOne({ email })
  }

  async getUserById(userId: string): Promise<UserDocument> {
    return await this.userModel.findById(userId)
  }

  async getUserDetails(userId: string): Promise<UserDetails> {
    let user: UserDocument = null
    try {
      user = await this.getUserById(userId)
    } catch (error) {
      this.logger.error(
        `Was unable to find user by id ${userId} with error: ${error}`
      )
      throw new HttpException(
        'Failed to get user',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }

    return {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      createdTimestamp: user.createdTimestamp,
      lastLoginTimestamp: user.lastLogin
    }
  }

  async createNewUser({
    firstName,
    lastName,
    email,
    password
  }: UserDto): Promise<Message> {
    this.logger.log(
      `Creating new user with first name: ${firstName}, last name: ${lastName}, email: ${email}`
    )
    let passwordHash = null
    try {
      passwordHash = await generatePasswordHash(password)
    } catch (error) {
      this.logger.error(`Failed to generate password hash`)
      throw new HttpException(
        'Registration error',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
    if (!passwordHash) {
      this.logger.error(`Failed to generate password hash`)
      throw new HttpException(
        'Registration error',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
    const currentTimestamp = new Date().getTime()
    const userModel = new this.userModel({
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: passwordHash,
      createdTimestamp: currentTimestamp
    })
    try {
      await userModel.save()
      this.logger.log(`Successfully created new user: ${userModel}`)
      return {
        message: 'Successfully created user',
        status: HttpStatus.CREATED
      }
    } catch (error) {
      this.logger.error(`Failed to save user: ${userModel}`)
      throw new HttpException(
        'Registration error',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }
}
