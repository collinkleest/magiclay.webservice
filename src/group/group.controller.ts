import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post
} from '@nestjs/common'
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger'
import { Message } from 'src/common'
import { DeleteGroupDto, GroupDocument, GroupDto, JoinGroupDto } from './group'
import { GroupService } from './group.service'

@ApiTags('group')
@Controller('group')
export class GroupController {
  constructor(private groupService: GroupService) {}
  private logger = new Logger('GroupController')

  @Get(':groupId')
  async getGroup(@Param('groupId') groupId: string) {
    return await this.groupService.getGroup(groupId)
  }

  @Post()
  @ApiCreatedResponse()
  async createGroup(@Body() groupDto: GroupDto): Promise<GroupDocument> {
    return await this.groupService.createGroup(groupDto)
  }

  @Delete()
  async deleteGroup(
    @Body() { userId, groupId }: DeleteGroupDto
  ): Promise<Message> {
    return await this.groupService.deleteGroup(userId, groupId)
  }

  @Post('join')
  async joinGroup(
    @Body() { userId, groupName }: JoinGroupDto
  ): Promise<GroupDocument> {
    return await this.groupService.joinGroup(userId, groupName)
  }
}
