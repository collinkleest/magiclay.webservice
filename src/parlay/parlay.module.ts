import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { InjectModel, MongooseModule } from '@nestjs/mongoose'
import { Group, GroupSchema } from 'src/group/group'
import { GroupService } from 'src/group/group.service'
import { AccessTokenMiddleware } from 'src/middlewares/access-token.middleware'
import { User, UserSchema } from 'src/user/user'
import { UserService } from 'src/user/user.service'
import { Leg, LegSchema, Parlay, ParlaySchema } from './parlay'
import { ParlayController } from './parlay.controller'
import { ParlayService } from './parlay.service'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Parlay.name, schema: ParlaySchema },
      { name: Leg.name, schema: LegSchema },
      { name: Group.name, schema: GroupSchema },
      { name: User.name, schema: UserSchema }
    ])
  ],
  controllers: [ParlayController],
  providers: [ParlayService, GroupService, UserService]
})
export class ParlayModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AccessTokenMiddleware).forRoutes('parlay')
  }
}
