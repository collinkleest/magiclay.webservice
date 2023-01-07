import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { HydratedDocument } from 'mongoose'
import { IsEmail, IsNotEmpty, MaxLength, MinLength } from 'class-validator'
import { Verification } from '../verification/verification'
import { ApiProperty } from '@nestjs/swagger'

export type UserDocument = HydratedDocument<User>

export class UserDetails {
  @ApiProperty()
  firstName: string

  @ApiProperty()
  lastName: string

  @ApiProperty()
  email: string

  @ApiProperty()
  createdTimestamp: number

  @ApiProperty()
  lastLoginTimestamp: number
}

export class UserDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string

  @ApiProperty({ minLength: 8, maxLength: 16 })
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(16)
  password: string

  @ApiProperty({ maxLength: 35 })
  @IsNotEmpty()
  @MaxLength(35)
  firstName: string

  @ApiProperty({ maxLength: 35 })
  @IsNotEmpty()
  @MaxLength(35)
  lastName: string
}

export class GetVerificationDto {
  @IsNotEmpty()
  @IsEmail()
  email: string
}

@Schema()
export class User {
  _id: mongoose.Types.ObjectId

  @Prop({ required: true })
  firstName: string

  @Prop({ required: true })
  lastName: string

  @Prop({ required: true, unique: true })
  email: string

  @Prop({ required: true })
  password: string

  @Prop({ type: Verification, required: false })
  verification: Verification

  @Prop({ default: false })
  active: boolean

  @Prop({ required: false, immutable: true })
  createdTimestamp: number

  @Prop({ required: false })
  lastLogin: number
}

export const UserSchema = SchemaFactory.createForClass(User)
