import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { UserDetails, User, UserDocument, UserDto, UserDetail } from './user'
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

  async checkUserExistsByUserName(userName: string): Promise<boolean> {
    const user = await this.userModel.findOne({ userName })
    return !!user
  }

  async getUserByEmail(email: string): Promise<UserDocument> {
    return await this.userModel.findOne({ email })
  }

  async getUserById(userId: string): Promise<UserDocument> {
    return await this.userModel.findById(userId)
  }

  async getUser(userId: string): Promise<UserDetail> {
    const user = await this.getUserById(userId)
    return {
      userName: user.userName,
      firstName: user.firstName,
      lastName: user.lastName
    }
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
      userName: user.userName,
      email: user.email,
      createdTimestamp: user.createdTimestamp,
      lastLoginTimestamp: user.lastLogin
    }
  }

  async createNewUser({
    firstName,
    lastName,
    userName,
    email,
    password
  }: UserDto): Promise<Message> {
    this.logger.log(
      `Creating new user with first name: ${firstName}, last name: ${lastName}, email: ${email}, userName: ${userName}`
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
      userName: userName,
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
      this.logger.error(
        `Failed to save user: ${userModel} with error: ${error}`
      )
      throw new HttpException(
        'Registration error',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }
}
