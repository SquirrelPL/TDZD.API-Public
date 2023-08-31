import { Module } from '@nestjs/common';
import { UserGameTimeService } from './user-game-time.service';
import { UserGameTimeController } from './user-game-time.controller';

@Module({
  controllers: [UserGameTimeController],
  providers: [UserGameTimeService]
})
export class UserGameTimeModule {}
//