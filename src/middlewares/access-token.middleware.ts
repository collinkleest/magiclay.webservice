import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NestMiddleware
} from '@nestjs/common'
import * as jwt from 'jsonwebtoken'

@Injectable()
export class AccessTokenMiddleware implements NestMiddleware {
  private logger = new Logger('UserService')
  async use(req: any, res: any, next: () => void) {
    const authHeader = req.headers.authorization
    if (authHeader) {
      const token = authHeader.split(' ')[1]
      try {
        const decoded = jwt.verify(token, process.env.ACCESS_JWT_SECRET)
        req.body = decoded
      } catch (error) {
        this.logger.error(`Access token is invalid because: ${error}`)
        throw new HttpException(
          'Access token is invalid',
          HttpStatus.UNAUTHORIZED
        )
      }
    } else {
      this.logger.error('No token provided in the request')
      throw new HttpException(
        'No access token provided',
        HttpStatus.UNAUTHORIZED
      )
    }
    next()
  }
}
