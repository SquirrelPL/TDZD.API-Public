import { Module } from '@nestjs/common';
import { AdminTimeTableController } from './adminTimeTable.controller';
import { AdminTimeTableService } from './adminTimeTable.service';

//
@Module({
  controllers: [AdminTimeTableController],
  providers: [AdminTimeTableService]
})
export class AdminTimeTableModule {}
