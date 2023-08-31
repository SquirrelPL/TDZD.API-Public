import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { UserGameTimeService } from './user-game-time.service';
import { JwtGuard, RolesGuard } from 'src/auth/guard';
import { GetUser, Permission } from 'src/auth/decorator';
import { UserEntity } from 'src/auth/dto/user.dto';
import { UserTimeTableDto, GetByDateDto } from './dto';

@Controller('userGameTime')
export class UserGameTimeController {
  constructor(private readonly userGameTimeService: UserGameTimeService) {}

      @UseGuards(JwtGuard, RolesGuard)
      @Permission(true, "userGameTime.&.#.getUserTime")
      @Get('id/:id/:serverId')
      getUserTimeById(@GetUser() user: UserEntity, @Param('id', ParseIntPipe) id: number, @Param('serverId', ParseIntPipe) serverId: number){
          return this.userGameTimeService.getUserTimeById(user, id, serverId) 
      }
  
      @UseGuards(JwtGuard, RolesGuard)
      @Permission(true, "userGameTime.&.#.getAdministrationTime")
      @Post('/administrationTime/:id')
      getAdministrationTime(@GetUser() user: UserEntity,  @Param('id', ParseIntPipe) serverId: number, @Body() dto: GetByDateDto){
          return this.userGameTimeService.getAdministrationTime(user, serverId, dto)
      }
  
      @UseGuards(JwtGuard, RolesGuard)
      @Permission(true, "userGameTime.&.#.addUserTime")
      @Post('addUserTime/Id/:id')
      addUserTime(@GetUser() user: UserEntity ,@Body() dto: UserTimeTableDto,  @Param('id', ParseIntPipe) serverId: number){
        return this.userGameTimeService.addUserTime(user, dto, serverId)
      }
}
//