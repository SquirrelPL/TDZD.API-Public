import { StrikeService } from './strike.service';
import { GetUser, Permission } from 'src/auth/decorator';
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { UserEntity } from 'src/auth/dto/user.dto';
import { JwtGuard, RolesGuard } from 'src/auth/guard';
import { StrikeDto } from './dto';

@Controller('strike')
@UseGuards(JwtGuard, RolesGuard)
export class StrikeController {
  constructor(private readonly strikeService: StrikeService) {}
//
  @Permission(false, "strike.getAdminStrikes")
  @Get('admin')
  getAdminStrikes(@GetUser() user: UserEntity){
    return this.strikeService.getAdminStrikes(user)
  }

  @Permission(false, "strike.myStrikes")
  @Get('/myStrikes')
  getMyStrikes(@GetUser() user: UserEntity){
      return this.strikeService.getMyStrikes(user)
  }

  @Permission(false, "strikes.getUserStrikes")
  @Get('userStrikes/Id/:id')
  getUserStrikesById(@Param('id', ParseIntPipe) id, @GetUser() user: UserEntity){
      return this.strikeService.getUserStrikesById(id, user)
  }

  @Permission(false, "strikes.getUserStrikes")
  @Get('userStrikes/DiscordId/:id')
  getUserStrikesByDiscordId(@Param('id') id: string, @GetUser() user: UserEntity){
      return this.strikeService.getUserStrikesByDiscordId(id, user)
  }

  @Permission(false, "strikes.strikeUser")
  @Post('/Id/:id')
  strikeUserById(@Param('id', ParseIntPipe) id, @GetUser() user: UserEntity, @Body() dto: StrikeDto){
      return this.strikeService.strikeUserById(id, user, dto)
  }

  @Permission(false, "strikes.strikeUser")
  @Post('/DiscordId/:id')
  strikeUserByDiscordId(@Param('id') id: string, @GetUser() user: UserEntity, @Body() dto: StrikeDto){
      return this.strikeService.strikeUserByDiscordId(id, user, dto)
  }

  @Permission(false, "strikes.deleteStrike")
  @Delete('/Id/:id')
  strikeDelete(@Param('id', ParseIntPipe) id, @GetUser() user: UserEntity){
      return this.strikeService.strikeDelete(id, user)
  }
}
