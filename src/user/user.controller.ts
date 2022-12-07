import { Body, Controller, Delete, Get, HttpException, HttpStatus, Post } from '@nestjs/common';
import { Exception, UserExistsException } from 'src/exceptions';
import { LoginDto, UserDocument, UserDto, VerificationDto } from './user';
import { UserService } from './user.service';

@Controller('user')
export class UserController {

    constructor(private userService: UserService){}
    
    @Get()
    async getUser(){
        await this.userService.sendVerificationEmail('collinkleest@gmail.com');
    }

    @Post()
    async createUser(@Body() userDto: UserDto): Promise<UserDocument> {
        let isExistingUser = await this.userService.checkUserExistsByEmail(userDto.email);
        
        if (isExistingUser) {
            throw new HttpException('Email already exists please sign in', HttpStatus.BAD_REQUEST);
        }
        
        return await this.userService.createNewUser(userDto);
    }

    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        return this.userService.login(loginDto);
    }
    
    @Post('verify')
    async verify(@Body() verificationDto: VerificationDto) {
        return await this.userService.verifyUser(verificationDto);
    }

    @Post('verificaiton-code')
    async getVerificationCode(){} 

}
 