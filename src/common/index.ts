import { HttpStatus } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'

export class Message {
  @ApiProperty()
  message: string

  @ApiProperty()
  status: HttpStatus
}
