import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { LoginDto, UserDocument, UserDto } from './user';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  async getUser() {
    await this.userService.testMethod();
  }

  @Post()
  async createUser(@Body() userDto: UserDto): Promise<UserDocument> {
    const isExistingUser = await this.userService.checkUserExistsByEmail(
      userDto.email,
    );

    if (isExistingUser) {
      throw new HttpException(
        'Email already exists please sign in',
        HttpStatus.BAD_REQUEST,
      );
    }

    return await this.userService.createNewUser(userDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.userService.login(loginDto);
  }
}
