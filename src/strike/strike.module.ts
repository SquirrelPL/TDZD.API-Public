import { Module } from '@nestjs/common';
import { StrikeService } from './strike.service';
import { StrikeController } from './strike.controller';

@Module({
  controllers: [StrikeController],
  providers: [StrikeService]
})
export class StrikeModule {}
//