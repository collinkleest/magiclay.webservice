import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { IMessage } from 'src/common'
import { UserService } from 'src/user/user.service'
import { LoginDto } from './auth'
import * as jwt from 'jsonwebtoken'

@Injectable()
export class AuthService {
  private logger = new Logger('AuthService')

  constructor(private userService: UserService) {}

  private async checkPassword(
    password: string,
    hash: string
  ): Promise<boolean> {
    return await bcrypt.compare(password, hash)
  }

  private getJWT(email: string, userId: string): string {
    return jwt.sign(
      {
        email: email,
        userId: userId
      },
      process.env.JWT_SECRET,
      {
        algorithm: 'HS256',
        expiresIn: process.env.JWT_EXPIRATION_TIME
      }
    )
  }

  async login({ email, password }: LoginDto): Promise<IMessage> {
    const user = await this.userService.getUserByEmail(email)
    if (!user) {
      throw new HttpException('Authentication error', HttpStatus.UNAUTHORIZED)
    }
    if (user.active) {
      const passwordMatches = await this.checkPassword(password, user.password)
      if (passwordMatches) {
        this.logger.log(`User: ${user} successfully signed in`)
        const currentTimestamp = new Date().getTime()
        await user.updateOne({
          lastLogin: currentTimestamp
        })
        const token = this.getJWT(user.email, user.id)
        return {
          message: 'Authentication successful',
          token: token,
          status: HttpStatus.OK
        }
      } else {
        this.logger.error(`Passwords do not match for user: ${user}`)
        throw new HttpException('Authentication error', HttpStatus.UNAUTHORIZED)
      }
    } else {
      this.logger.error(`Account is inactive for user: ${user}`)
      throw new HttpException(
        'Authentication error, inactivated',
        HttpStatus.FORBIDDEN
      )
    }
  }
}
