import { Module } from '@nestjs/common';
import { TempRoleController } from './tempRole.controller';
import { TempRoleService } from './tempRole.service';

@Module({
  controllers: [TempRoleController],
  providers: [TempRoleService]
})
export class TempRoleModule {}
//