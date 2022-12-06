import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from 'mongoose';
import { IsEmail, IsEnum, IsNotEmpty, IsNumber, MaxLength } from 'class-validator';

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

export enum VerificationType {
    REGISTRATION = 'registration',
    RESET = 'reset'
}

export interface Verification {
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
export class User {

    @Prop({ required: true })
    firstName: string;

    @Prop({ required: true })
    lastName: string;

    @Prop({ required: true })
    email: string;

    @Prop({ required: true })
    password: string;

    @Prop({ required: false })
    verifications: Verification[];

    @Prop({ default: false })
    active: boolean;

    @Prop({ required: false, immutable: true })
    createdTimestamp: number;

    @Prop({ required: false })
    lastLogin: number;

}

export const UserSchema = SchemaFactory.createForClass(User);
