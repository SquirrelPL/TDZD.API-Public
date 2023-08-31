import { Module } from '@nestjs/common';
import { WarnService } from './warn.service';
import { WarnController } from './warn.controller';

@Module({
  controllers: [WarnController],
  providers: [WarnService]
})
export class WarnModule {}
//