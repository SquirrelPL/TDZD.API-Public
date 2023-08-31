import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { PermissionModule } from './permission/permission.module';
import { RoleModule } from './role/role.module';
import { AdminTimeTableModule } from './adminTimeTable/adminTimeTable.module';
import { ServerModule } from './server/server.module';
import { AnnouncmentModule } from './announcment/announcment.module';
import { LogModule } from './log/log.module';
import { SystemModule } from './system/system.module';
import { TempRoleModule } from './tempRole/tempRole.module';
import { BrandModule } from './brand/brand.module';
import { WarnModule } from './warn/warn.module';
import { StrikeModule } from './strike/strike.module';
import { VacationModule } from './vacation/vacation.module';
import { UserGameTimeModule } from './user-game-time/user-game-time.module';
import { ScheduleModule } from '@nestjs/schedule';
import { SchedulesModule } from './schedules/schedules.module';

@Module({
  imports: [
      ConfigModule.forRoot({isGlobal: true}),
      ScheduleModule.forRoot(),
      AuthModule,
      PrismaModule,
      UserModule,
      PermissionModule, 
      RoleModule,
      AdminTimeTableModule,
      ServerModule,
      AnnouncmentModule,
      LogModule,
      SystemModule,
      TempRoleModule,
      BrandModule,
      WarnModule,
      StrikeModule,
      VacationModule,
      UserGameTimeModule,
      ScheduleModule,
      SchedulesModule, 
  ],
})
export class AppModule {}
//