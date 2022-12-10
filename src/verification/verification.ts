import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { IsEmail, IsNotEmpty, IsNumber } from 'class-validator'
import mongoose, { HydratedDocument } from 'mongoose'

export type VerificationDocument = HydratedDocument<Verification>

export interface IVerification {
  userid: string
  timestamp: number
  code: number
}

export class GenerateVerificationDto {
  @IsNotEmpty()
  @IsEmail()
  email: string
}

export class VerificationDto {
  @IsNotEmpty()
  @IsNumber()
  code: number

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
