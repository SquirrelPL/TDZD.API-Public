import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { VacationService } from './vacation.service';
import { GetUser, Permission } from 'src/auth/decorator';
import { UserEntity } from 'src/auth/dto/user.dto';
import { VacationDto } from './dto';
import { JwtGuard, RolesGuard } from 'src/auth/guard';
//
@Controller('vacation')
@UseGuards(JwtGuard, RolesGuard)
export class VacationController {
  constructor(private readonly vacationService: VacationService) {}

  @Permission(false, "vacation.getAdminVacations")
  @Get('admin')
  getAdminVacations(@GetUser() user: UserEntity){
    return this.vacationService.getAdminVacations(user)
  }

  @Permission(false, "vacation.myVacations")
  @Get('/myVacations')
  getMyVacations(@GetUser() user: UserEntity){
      return this.vacationService.getMyVacations(user)
  }

  @Permission(false, "vacations.getUserVacations")
  @Get('userVacations/Id/:id')
  getUserVacationsById(@Param('id', ParseIntPipe) id, @GetUser() user: UserEntity){
      return this.vacationService.getUserVacationsById(id, user)
  }

  @Permission(false, "vacations.getUserVacations")
  @Get('userVacations/DiscordId/:id')
  getUserVacationsByDiscordId(@Param('id') id: string, @GetUser() user: UserEntity){
      return this.vacationService.getUserVacationsByDiscordId(id, user)
  }

  @Permission(false, "vacations.vacationUser")
  @Post('/Id/:id')
  vacationUserById(@Param('id', ParseIntPipe) id, @GetUser() user: UserEntity, @Body() dto: VacationDto){
      return this.vacationService.vacationUserById(id, user, dto)
  }

  @Permission(false, "vacations.vacationUser")
  @Post('/DiscordId/:id')
  vacationUserByDiscordId(@Param('id') id: string, @GetUser() user: UserEntity, @Body() dto: VacationDto){
      return this.vacationService.vacationUserByDiscordId(id, user, dto)
  }

  @Permission(false, "vacations.deleteVacation")
  @Delete('/Id/:id')
  vacationDelete(@Param('id', ParseIntPipe) id, @GetUser() user: UserEntity){
      return this.vacationService.vacationDelete(id, user)
  }
}
