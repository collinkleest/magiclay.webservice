import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { GroupService } from 'src/group/group.service'
import { User } from 'src/user/user'
import { UserService } from 'src/user/user.service'
import {
  Leg,
  LegDocument,
  Parlay,
  ParlayDocument,
  UpdateLegDto,
  VoteLegDto
} from './parlay'

@Injectable()
export class ParlayService {
  private logger = new Logger('ParlayService')

  constructor(
    @InjectModel(Parlay.name) private parlayModel: Model<ParlayDocument>,
    @InjectModel(Leg.name) private legModel: Model<LegDocument>,
    private groupService: GroupService,
    private userService: UserService
  ) {}

  validateParlay(parlay: ParlayDocument, parlayId: string): void {
    if (!parlay) {
      this.logger.error(`No parlay found with id: ${parlayId}`)
      throw new HttpException('No parlay found', HttpStatus.NOT_FOUND)
    }
  }

  validateLeg(leg: Leg, legId: string): void {
    if (!leg) {
      this.logger.error(`No leg found with id: ${legId}`)
      throw new HttpException('No leg found', HttpStatus.NOT_FOUND)
    }
  }

  validateUserInGroup(userId: string, parlay: ParlayDocument): void {
    if (!this.groupService.isUserInGroup(userId, parlay.group._id.toString())) {
      this.logger.error(
        `User: ${userId} is not in parlay group: ${parlay.name}`
      )
      throw new HttpException('User not in parlay', HttpStatus.BAD_REQUEST)
    }
  }

  async getParlayById(parlayId: string): Promise<ParlayDocument> {
    return await this.parlayModel.findById(parlayId)
  }

  hasUserVoted(userList: User[], user: User): boolean {
    for (let votedUser of userList) {
      if (votedUser._id.toString() === user._id.toString()) {
        return true
      }
    }
    return false
  }

  getLegById(parlay: Parlay, legId: string): Leg {
    return parlay.legs.find((leg) => leg._id.toString() == legId)
  }

  doesUserHaveLeg(parlay: ParlayDocument, userId: string): boolean {
    for (let leg of parlay.legs) {
      if (leg.user._id.toString() === userId) {
        return true
      }
    }
    return false
  }

  getOriginalLegs(parlay: Parlay, legId: string): Leg[] {
    return parlay.legs.filter((leg) => !(leg._id.toString() == legId))
  }

  resetVotes(leg: Leg, userId: string): void {
    leg.vetos = []
    leg.approvals = leg.approvals.filter(
      (user) => user._id.toString() === userId
    )
  }

  async createParlay(
    userId: string,
    name: string,
    groupId: string
  ): Promise<ParlayDocument> {
    const group = await this.groupService.getGroupById(groupId)

    if (!(group.creator._id.toString() === userId)) {
      this.logger.error(
        `UserID: ${userId} does not have permissions to create parlay for group: ${group.name}`
      )
      throw new HttpException(
        'Not authorized to create parlay',
        HttpStatus.UNAUTHORIZED
      )
    }

    const parlayModel = new this.parlayModel({
      userId: userId,
      name: name,
      group: groupId
    })
    parlayModel.save()
    return parlayModel
  }

  async addLeg(
    userId: string,
    parlayId: string,
    prop: string
  ): Promise<ParlayDocument> {
    const parlay = await this.getParlayById(parlayId)
    this.validateParlay(parlay, parlayId)
    this.validateUserInGroup(userId, parlay)

    if (this.doesUserHaveLeg(parlay, userId)) {
      this.logger.error(`User: ${userId} already has a leg in: ${parlay.name}`)
      throw new HttpException(
        'User has a leg in parlay already',
        HttpStatus.BAD_REQUEST
      )
    }

    const user = await this.userService.getUserById(userId)

    const legModel = new this.legModel({
      prop: prop,
      userName: user.userName,
      user: user._id,
      approvals: [user._id]
    })

    parlay.legs.push(legModel)

    await parlay.save()

    return parlay
  }

  async voteLeg({ userId, parlayId, legId, vote }: VoteLegDto): Promise<Leg[]> {
    const parlay = await this.getParlayById(parlayId)
    this.validateParlay(parlay, parlayId)
    this.validateUserInGroup(userId, parlay)

    const leg = this.getLegById(parlay, legId)

    this.validateLeg(leg, legId)

    if (leg.user._id.toString() == userId) {
      this.logger.error(
        `User: ${leg.user._id} cannot vote on its own leg: ${legId}`
      )
      throw new HttpException('Cannot vote on own leg', HttpStatus.NOT_FOUND)
    }

    const user = await this.userService.getUserById(userId)
    if (vote === true) {
      // votes yes
      if (!this.hasUserVoted(leg.approvals, user)) {
        leg.approvals.push(user.id)
      }
      leg.vetos = leg.vetos.filter(
        (vetoUser) => !(vetoUser._id.toString() === user.id)
      )
    } else {
      // votes no
      if (!this.hasUserVoted(leg.vetos, user)) {
        leg.vetos.push(user.id)
      }
      leg.approvals = leg.approvals.filter(
        (approvalUser) => !(approvalUser._id.toString() === user.id)
      )
    }
    const originalLegs = this.getOriginalLegs(parlay, legId)
    originalLegs.push(leg)
    parlay.legs = originalLegs
    await parlay.save()
    return parlay.legs
  }

  async updateLeg({
    userId,
    parlayId,
    legId,
    prop,
    hasHit
  }: UpdateLegDto): Promise<Leg[]> {
    const parlay = await this.getParlayById(parlayId)
    this.validateParlay(parlay, parlayId)
    this.validateUserInGroup(userId, parlay)

    const leg = this.getLegById(parlay, legId)
    this.validateLeg(leg, legId)

    if (prop !== undefined) {
      if (userId === leg.user._id.toString()) {
        leg.prop = prop
        this.resetVotes(leg, userId)
      } else {
        this.logger.error(`${userId} is not owner of ${leg.prop}`)
        throw new HttpException(
          'User not owner of leg',
          HttpStatus.UNAUTHORIZED
        )
      }
    }

    if (hasHit !== undefined) {
      const group = await this.groupService.getGroupById(
        parlay.group._id.toString()
      )
      if (group.creator._id.toString() === userId) {
        leg.hasHit = hasHit
      } else {
        this.logger.error(`${userId} is not owner or admin of ${group.name}`)
        throw new HttpException(
          'User is not the owner or admin of group',
          HttpStatus.UNAUTHORIZED
        )
      }
    }

    const originalLegs = this.getOriginalLegs(parlay, legId)
    originalLegs.push(leg)
    parlay.legs = originalLegs
    await parlay.save()
    return parlay.legs
  }
}
