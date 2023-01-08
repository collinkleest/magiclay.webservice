import { Body, Controller, Logger, Post, Put } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import {
  AddLegDto,
  CreateParlayDto,
  Leg,
  ParlayDocument,
  UpdateLegDto,
  VoteLegDto
} from './parlay'
import { ParlayService } from './parlay.service'

@ApiTags('parlay')
@Controller('parlay')
export class ParlayController {
  constructor(private parlayService: ParlayService) {}
  private logger = new Logger('ParlayController')

  @Post()
  async createParlay(
    @Body() { userId, name, groupId }: CreateParlayDto
  ): Promise<ParlayDocument> {
    return await this.parlayService.createParlay(userId, name, groupId)
  }

  @Post('leg/vote')
  async voteLeg(
    @Body() { userId, parlayId, legId, vote }: VoteLegDto
  ): Promise<Leg[]> {
    return await this.parlayService.voteLeg({
      userId,
      parlayId,
      legId,
      vote
    } as VoteLegDto)
  }

  @Put('leg')
  async updateLeg(@Body() updateLegDto: UpdateLegDto): Promise<Leg[]> {
    return await this.parlayService.updateLeg(updateLegDto)
  }

  @Post('leg')
  async addLeg(
    @Body() { userId, parlayId, prop }: AddLegDto
  ): Promise<ParlayDocument> {
    return await this.parlayService.addLeg(userId, parlayId, prop)
  }
}
