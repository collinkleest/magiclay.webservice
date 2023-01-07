import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, IsNumber, Max, Min } from 'class-validator'
import mongoose, { HydratedDocument } from 'mongoose'

export type VerificationDocument = HydratedDocument<Verification>

export interface IVerification {
  userid: string
  timestamp: number
  code: number
}

export class GenerateVerificationDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string
}

export class VerificationDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  code: number

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string
}

@Schema()
export class Verification {
  @Prop({
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: true
  })
  userId: mongoose.Types.ObjectId

  @Prop({ required: false })
  timestamp: number

  @Prop({ required: false })
  code: number
}

export const VerificationSchema = SchemaFactory.createForClass(Verification)
