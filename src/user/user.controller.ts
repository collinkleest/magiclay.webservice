import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  Post,
  Req
} from '@nestjs/common'
import { Request } from 'express'
import { IMessage } from 'src/common'
import { IUserDetails, UserDto } from './user'
import { UserService } from './user.service'

@Controller('user')
export class UserController {
  private logger = new Logger('UserService')

  constructor(private userService: UserService) {}

  @Get('details')
  getUserDetails(@Req() request: Request): Promise<IUserDetails> {
    return this.userService.getUserDetails(request.body.userId)
  }

  @Post()
  async createUser(@Body() userDto: UserDto): Promise<IMessage> {
    const isExistingUser = await this.userService.checkUserExistsByEmail(
      userDto.email
    )

    if (isExistingUser) {
      this.logger.log(`User already exists for email ${userDto.email}`)
      throw new HttpException(
        'Email already exists please sign in',
        HttpStatus.BAD_REQUEST
      )
    }

    return await this.userService.createNewUser(userDto)
  }
}
