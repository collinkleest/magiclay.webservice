import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, MaxLength, MinLength } from 'class-validator'
import mongoose, { HydratedDocument } from 'mongoose'
import { User } from 'src/user/user'

export type GroupDocument = HydratedDocument<Group>

export class DeleteGroupDto {
  userId: string

  email: string

  @IsNotEmpty()
  @ApiProperty()
  groupId: string
}

export class JoinGroupDto {
  userId: string

  email: string

  @IsNotEmpty()
  @ApiProperty()
  groupName: string
}

export class GroupDto {
  userId: string

  email: string

  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(16)
  @ApiProperty({ minLength: 3, maxLength: 16 })
  name: string
}

@Schema()
export class Group {
  _id: mongoose.Types.ObjectId

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  creator: User

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false })
  admin: User

  @Prop({ required: true, unique: true })
  name: string

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    required: true
  })
  members: User[]

  @Prop({ required: true, immutable: true })
  createdTimestamp: number
}

export const GroupSchema = SchemaFactory.createForClass(Group)
