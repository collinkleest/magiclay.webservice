import { Body, Controller, Delete, Get, Post } from '@nestjs/common';
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
    async createUser(@Body() userDto: UserDto): Promise<UserDocument | Exception> {
        let isExistingUser = await this.userService.checkUserExistsByEmail(userDto.email);
        
        if (isExistingUser) {
            return UserExistsException;
        }

        let newUser = await this.userService.createNewUser(userDto);
        
        await this.userService.sendVerificationEmail(userDto.email);

        return newUser;
    }

    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        return this.userService.login(loginDto);
    }
    
    @Post('verify')
    async verify(@Body() verificationDto: VerificationDto) {
        return await this.userService.verifyUser(verificationDto);
    }


}
 