import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  MaxLength,
} from 'class-validator';
import { Verification } from '../verification/verification';

export type UserDocument = HydratedDocument<User>;

export class UserDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MaxLength(16)
  password: string;

  @IsNotEmpty()
  @MaxLength(35)
  firstName: string;

  @IsNotEmpty()
  @MaxLength(35)
  lastName: string;
}

export class LoginDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MaxLength(16)
  password: string;
}

export class GetVerificationDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;
}

@Schema()
export class User {
  _id: mongoose.Types.ObjectId;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ type: Verification, required: false })
  verification: Verification;

  @Prop({ default: false })
  active: boolean;

  @Prop({ required: false, immutable: true })
  createdTimestamp: number;

  @Prop({ required: false })
  lastLogin: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
