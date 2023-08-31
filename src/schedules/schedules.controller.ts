import { Controller } from '@nestjs/common';
import { SchedulesService } from './schedules.service';
import { Cron } from '@nestjs/schedule';

@Controller('schedules')
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Cron('0 1 * * *')
  upadateProfPicsOfEveryAdmin() {
    this.schedulesService.upadateProfPicsOfEveryAdmin()
  }
}
//