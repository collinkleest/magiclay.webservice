import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'
import mongoose, { HydratedDocument } from 'mongoose'
import { Group } from 'src/group/group'
import { User } from 'src/user/user'

export type ParlayDocument = HydratedDocument<Parlay>
export type LegDocument = HydratedDocument<Leg>

export class UpdateLegDto {
  userId: string

  @IsNotEmpty()
  @ApiProperty()
  parlayId: string

  @IsNotEmpty()
  @ApiProperty()
  legId: string

  @ApiProperty({ required: false })
  prop?: string

  @ApiProperty({ required: false })
  hasHit?: boolean
}

export class AddLegDto {
  email: string
  userId: string

  @IsNotEmpty()
  @ApiProperty()
  prop: string

  @ApiProperty()
  @IsNotEmpty()
  parlayId: string
}

export class VoteLegDto {
  email: string
  userId: string

  @IsNotEmpty()
  @ApiProperty()
  parlayId: string

  @IsNotEmpty()
  @ApiProperty()
  legId: string

  @IsNotEmpty()
  @ApiProperty()
  vote: boolean
}

export class CreateParlayDto {
  email: string
  userId: string

  @IsNotEmpty()
  @ApiProperty()
  name: string

  @ApiProperty()
  @IsNotEmpty()
  groupId: string
}

@Schema()
export class Leg {
  _id: mongoose.Types.ObjectId

  @Prop({ required: true })
  prop: string

  @Prop({ default: false })
  hasHit: boolean

  @Prop({ required: true })
  userName: string

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  user: User

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    required: true
  })
  approvals: User[]

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    required: false
  })
  vetos: User[]
}

export const LegSchema = SchemaFactory.createForClass(Leg)

@Schema()
export class Parlay {
  _id: mongoose.Types.ObjectId

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true })
  group: Group

  @Prop({ required: true, default: true })
  isOpen: boolean

  @Prop({ required: true })
  name: string

  @Prop({ required: false, default: false })
  hasHit: boolean

  @Prop({ type: [LegSchema], default: [] })
  legs: Leg[]
}

export const ParlaySchema = SchemaFactory.createForClass(Parlay)
