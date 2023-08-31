import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { WarnService } from './warn.service';
import { JwtGuard, RolesGuard } from 'src/auth/guard';
import { GetBrand, GetUser, Permission } from 'src/auth/decorator';
import { UserEntity } from 'src/auth/dto/user.dto';
import { WarnDto } from './dto';

//
@Controller('warn')
@UseGuards(JwtGuard, RolesGuard)
export class WarnController {
  constructor(private readonly warnService: WarnService) {}

  @Permission(false, "warn.getAdminWarns")
  @Get('admin')
  getAdminWarns(@GetUser() user: UserEntity){
    return this.warnService.getAdminWarns(user)
  }

  @Permission(false, "warn.myWarns")
  @Get('/myWarns')
  getMyWarns(@GetUser() user: UserEntity){
      return this.warnService.getMyWarns(user)
  }

  @Permission(false, "warns.getUserWarns")
  @Get('userWarns/Id/:id')
  getUserWarnsById(@Param('id', ParseIntPipe) id, @GetUser() user: UserEntity){
      return this.warnService.getUserWarnsById(id, user)
  }

  @Permission(false, "warns.getUserWarns")
  @Get('userWarns/DiscordId/:id')
  getUserWarnsByDiscordId(@Param('id') id: string, @GetUser() user: UserEntity){
      return this.warnService.getUserWarnsByDiscordId(id, user)
  }

  @Permission(false, "warns.warnUser")
  @Post('/Id/:id')
  warnUserById(@Param('id', ParseIntPipe) id, @GetUser() user: UserEntity, @Body() dto: WarnDto){
      return this.warnService.warnUserById(id, user, dto)
  }

  @Permission(false, "warns.warnUser")
  @Post('/DiscordId/:id')
  warnUserByDiscordId(@Param('id') id: string, @GetUser() user: UserEntity, @Body() dto: WarnDto){
      return this.warnService.warnUserByDiscordId(id, user, dto)
  }

  @Permission(false, "warns.deleteWarn")
  @Delete('/Id/:id')
  warnDelete(@Param('id', ParseIntPipe) id, @GetUser() user: UserEntity){
      return this.warnService.warnDelete(id, user)
  }
}


