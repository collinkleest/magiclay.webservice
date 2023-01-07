import { ApiProperty } from '@nestjs/swagger'
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  MaxLength,
  MinLength
} from 'class-validator'

export class LoginDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string

  @ApiProperty({
    minLength: 8,
    maxLength: 16
  })
  @IsNotEmpty()
  @MaxLength(16)
  @MinLength(8)
  password: string
}

export class ResetPasswordDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  code: number

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string

  @ApiProperty({
    minLength: 8,
    maxLength: 16
  })
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(16)
  newPassword: string
}

export class LoginResponse {
  @ApiProperty()
  token: string
}
