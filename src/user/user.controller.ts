import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Logger,
  Post,
} from '@nestjs/common';
import { IMessage } from 'src/common';
import { UserDto } from './user';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
    private logger = new Logger('UserService');

    constructor(private userService: UserService) {}

  @Post()
  async createUser(@Body() userDto: UserDto): Promise<IMessage> {
    const isExistingUser = await this.userService.checkUserExistsByEmail(
      userDto.email,
    );

    if (isExistingUser) {
        this.logger.log(`User already exists for email ${userDto.email}`)
        throw new HttpException(
            'Email already exists please sign in',
            HttpStatus.BAD_REQUEST,
        );
    }

    return await this.userService.createNewUser(userDto);
  }
}
