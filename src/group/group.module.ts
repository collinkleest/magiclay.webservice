import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { AccessTokenMiddleware } from 'src/middlewares/access-token.middleware'
import { User, UserSchema } from 'src/user/user'
import { UserService } from 'src/user/user.service'
import { Group, GroupSchema } from './group'
import { GroupController } from './group.controller'
import { GroupService } from './group.service'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Group.name, schema: GroupSchema },
      { name: User.name, schema: UserSchema }
    ])
  ],
  controllers: [GroupController],
  providers: [GroupService, UserService]
})
export class GroupModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AccessTokenMiddleware).forRoutes('group')
  }
}
