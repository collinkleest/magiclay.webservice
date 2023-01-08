import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Message } from 'src/common'
import { UserService } from 'src/user/user.service'
import { Group, GroupDocument, GroupDto } from './group'

@Injectable()
export class GroupService {
  private logger = new Logger('GroupService')

  constructor(
    @InjectModel(Group.name) private groupModel: Model<GroupDocument>,
    private userService: UserService
  ) {}

  private async doesGroupExistByName(groupName: string) {
    const group = await this.groupModel.findOne({ name: groupName })
    return !!group
  }

  async getGroupById(groupId: string) {
    return await this.groupModel.findById(groupId)
  }

  async isUserInGroup(userId: string, groupId: string): Promise<boolean> {
    const group = await this.getGroupById(groupId)
    for (const member of group.members){ 
      if (member._id.toString() == userId) {
        return true
      }
    }
    return false
  }

  private async getGroupByName(groupName: string) {
    return await this.groupModel.findOne({ name: groupName })
  }

  private async removeGroupFromMemebers(group: GroupDocument): Promise<void> {
    if (!(group.members.length === 0)) {
      group.members.forEach(async (member) => {
        const user = await this.userService.getUserById(member._id.toString())
        const groupsWithRemovedGroup = user.groups.filter(
          (memberGroup) => !(memberGroup._id == group.id)
        )
        user.groups = groupsWithRemovedGroup
        await user.save()
        this.logger.log(`Removed ${group.name} from user ${user.userName}`)
      })
    }
  }

  async createGroup({ userId, name }: GroupDto): Promise<GroupDocument> {
    const doesGroupExist = await this.doesGroupExistByName(name)
    if (doesGroupExist) {
      this.logger.error(`Group: ${name} already exists`)
      throw new HttpException('Group already exists', HttpStatus.BAD_REQUEST)
    }

    const currentTimestamp = new Date().getTime()
    const groupModel = new this.groupModel({
      creator: userId,
      name: name,
      createdTimestamp: currentTimestamp,
      members: [userId]
    })

    const group = await groupModel.save()
    const user = await this.userService.getUserById(userId)
    user.groups.push(group.id)
    user.save()
    this.logger.log(
      `User: ${user.userName} successfully created group: ${group.name} with id ${group.id}`
    )
    return group
  }

  async getGroup(groupId: string): Promise<GroupDocument> {
    return await this.getGroupById(groupId)
  }

  async joinGroup(userId: string, groupName: string): Promise<GroupDocument> {
    const group = await this.getGroupByName(groupName)
    if (!group) {
      this.logger.error(`Group with name: ${groupName} does not exist`)
      throw new HttpException('Group not found', HttpStatus.NOT_FOUND)
    }
    const user = await this.userService.getUserById(userId)
    user.groups.push(group.id)
    group.members.push(user.id)
    await user.save()
    await group.save()
    return group
  }

  async deleteGroup(userId: string, groupId: string): Promise<Message> {
    const group = await this.getGroupById(groupId)
    if (!group) {
      this.logger.error(`Group with id: ${groupId} does not exist`)
      throw new HttpException('Group not found', HttpStatus.NOT_FOUND)
    }

    if (group.creator._id.toString() === userId) {
      this.removeGroupFromMemebers(group)
      group.delete()
      this.logger.log(`Owner: ${userId} has deleted group ${group.name}`)
      return {
        status: HttpStatus.ACCEPTED,
        message: 'Group deleted'
      }
    } else {
      this.logger.error(
        `User: ${userId} cannot delete group: ${groupId} without ownership`
      )
      throw new HttpException('Cannot delete', HttpStatus.UNAUTHORIZED)
    }
  }
}
