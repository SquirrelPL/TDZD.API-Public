import { Module } from '@nestjs/common';
import { AnnouncmentController } from './announcment.controller';
import { AnnouncmentService } from './announcment.service';


@Module({
  controllers: [AnnouncmentController],
  providers: [AnnouncmentService]
})
export class AnnouncmentModule {}
//