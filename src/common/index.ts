import { HttpStatus } from '@nestjs/common'

export interface IMessage {
  message: string
  status: HttpStatus
  token?: string
}
