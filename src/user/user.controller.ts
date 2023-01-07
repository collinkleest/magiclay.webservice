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
import {
  ApiCreatedResponse,
  ApiHeader,
  ApiOkResponse,
  ApiTags
} from '@nestjs/swagger'
import { Request } from 'express'
import { Message } from 'src/common'
import { UserDetails, UserDto } from './user'
import { UserService } from './user.service'

@ApiTags('user')
@Controller('user')
export class UserController {
  private logger = new Logger('UserService')

  constructor(private userService: UserService) {}

  @Get('details')
  @ApiHeader({
    name: 'authorization',
    description: 'Authorization Access JWT'
  })
  @ApiOkResponse({ type: UserDetails })
  getUserDetails(@Req() request: Request): Promise<UserDetails> {
    return this.userService.getUserDetails(request.body.userId)
  }

  @Post()
  @ApiCreatedResponse({ type: Message })
  async createUser(@Body() userDto: UserDto): Promise<Message> {
    const isExistingEmail = await this.userService.checkUserExistsByEmail(
      userDto.email
    )

    const isExistingUserName = await this.userService.checkUserExistsByUserName(
      userDto.userName
    )

    if (isExistingEmail) {
      this.logger.log(`User already exists for email ${userDto.email}`)
      throw new HttpException(
        'Email already exists please sign in',
        HttpStatus.BAD_REQUEST
      )
    }

    if (isExistingUserName) {
      this.logger.log(`Username already exists: ${userDto.userName}`)
      throw new HttpException(
        'Username already exists please choose another username',
        HttpStatus.BAD_REQUEST
      )
    }

    return await this.userService.createNewUser(userDto)
  }
}
