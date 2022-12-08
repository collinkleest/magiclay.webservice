import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { IsEmail, IsEnum, IsNotEmpty, IsNumber } from "class-validator";
import mongoose, { HydratedDocument } from "mongoose";

export type VerificationDocument = HydratedDocument<Verification>;

export enum VerificationType {
    REGISTRATION = 'registration',
    RESET = 'reset'
}

export interface IVerification {
    type: VerificationType;
    timestamp: number;
    code: number;
}

export class VerificationDto {

    @IsNotEmpty()
    @IsNumber()
    code: number;

    @IsEnum(VerificationType)
    type: VerificationType;

    @IsNotEmpty()
    @IsEmail()
    email: string;

}

@Schema()
export class Verification {

    @Prop({
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true
    })
    userId: mongoose.Types.ObjectId;

    @Prop({ enum: VerificationType, required: false })
    type: VerificationType;

    @Prop({ required: false })
    timestamp: number;

    @Prop({ required: false })
    code: number;

}

export const VerificationSchema = SchemaFactory.createForClass(Verification);