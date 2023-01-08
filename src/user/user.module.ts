import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod
} from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { AccessTokenMiddleware } from 'src/middlewares/access-token.middleware'
import { User, UserSchema } from './user'
import { UserController } from './user.controller'
import { UserService } from './user.service'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])
  ],
  controllers: [UserController],
  providers: [UserService]
})
export class UserModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AccessTokenMiddleware)
      .forRoutes(
        { path: 'user/details', method: RequestMethod.GET },
        { path: 'user', method: RequestMethod.GET }
      )
  }
}
