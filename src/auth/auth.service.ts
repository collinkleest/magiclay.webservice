import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { IMessage } from 'src/common'
import { UserService } from 'src/user/user.service'
import { LoginDto, ResetPasswordDto } from './auth'
import * as jwt from 'jsonwebtoken'
import { Response } from 'express'
import { InjectModel } from '@nestjs/mongoose'
import {
  Verification,
  VerificationDocument
} from 'src/verification/verification'
import { Model } from 'mongoose'
import { generatePasswordHash, isTimestampExpired } from 'src/utils'
import { UserDocument } from 'src/user/user'

@Injectable()
export class AuthService {
  private logger = new Logger('AuthService')

  constructor(
    @InjectModel(Verification.name)
    private verificationModel: Model<VerificationDocument>,
    private userService: UserService
  ) {}

  private async checkPassword(
    password: string,
    hash: string
  ): Promise<boolean> {
    return await bcrypt.compare(password, hash)
  }

  private getAccessToken(email: string, userId: string): string {
    return jwt.sign(
      {
        email: email,
        userId: userId
      },
      process.env.ACCESS_JWT_SECRET,
      {
        algorithm: 'HS256',
        expiresIn: process.env.ACCESS_JWT_EXPIRATION_TIME
      }
    )
  }

  private getRefreshToken(userId: string): string {
    return jwt.sign(
      {
        userId: userId
      },
      process.env.REFRESH_JWT_SECRET,
      {
        algorithm: 'HS256',
        expiresIn: process.env.REFRESH_EXPIRATION_TIME
      }
    )
  }

  private async resetPassDeleteVerification(
    user: UserDocument,
    verification: VerificationDocument,
    newPassword: string
  ) {
    try {
      await verification.delete()
      await user.updateOne({
        password: await generatePasswordHash(newPassword)
      })
    } catch (error) {
      this.logger.error(`Error reseting password for email: ${error}`)
      throw new HttpException('Reset error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async validateResetPassword(
    verification: VerificationDocument,
    resetPasswordDto: ResetPasswordDto,
    user: UserDocument
  ) {
    if (verification.code === resetPasswordDto.code) {
      if (!isTimestampExpired(verification.timestamp)) {
        if (
          await this.checkPassword(resetPasswordDto.newPassword, user.password)
        ) {
          this.logger.error(`Passwords match for ${user.id}, cannot reset`)
          throw new HttpException('Verification error', HttpStatus.FORBIDDEN)
        } else {
          this.resetPassDeleteVerification(
            user,
            verification,
            resetPasswordDto.newPassword
          )
          this.logger.log(`Successfully reset password for ${user.email}`)
          return {
            message: 'Successfully reset password',
            status: HttpStatus.RESET_CONTENT
          }
        }
      } else {
        this.logger.error(
          `Reset error for email: ${resetPasswordDto.email}, code has expired`
        )
        throw new HttpException('Reset error', HttpStatus.UNAUTHORIZED)
      }
    } else {
      this.logger.error(
        `Reset error for email: ${resetPasswordDto.email}, code is invalid`
      )
      throw new HttpException('Reset error', HttpStatus.BAD_REQUEST)
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<IMessage> {
    let user = null
    let verification = null
    try {
      user = await this.userService.getUserByEmail(resetPasswordDto.email)
    } catch (error) {
      this.logger.error(`Reset error: ${error}`)
      throw new HttpException('Reset error', HttpStatus.BAD_REQUEST)
    }
    if (!user) {
      this.logger.error(`No user found with email: ${resetPasswordDto.email}`)
      throw new HttpException('Reset error', HttpStatus.BAD_REQUEST)
    }
    try {
      verification = await this.verificationModel.findOne({
        userId: user.id
      })
    } catch (error) {
      this.logger.error(`Reset error: ${error}`)
      throw new HttpException('Reset error', HttpStatus.BAD_REQUEST)
    }
    if (!verification) {
      this.logger.error(
        `No verification found with email: ${resetPasswordDto.email}`
      )
      throw new HttpException('Reset error', HttpStatus.BAD_REQUEST)
    }
    return this.validateResetPassword(verification, resetPasswordDto, user)
  }

  async login({ email, password }: LoginDto, res: Response): Promise<IMessage> {
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
        const accessToken = this.getAccessToken(user.email, user.id)
        const refreshToken = this.getRefreshToken(user.id)
        res.cookie('jid', refreshToken, {
          httpOnly: true
        })
        return {
          message: 'Authentication successful',
          token: accessToken,
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
