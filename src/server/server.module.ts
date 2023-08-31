import { Module } from '@nestjs/common';
import { ServerController } from './server.controller';
import { ServerService } from './server.service';
import { Gateway } from './server.socket.controller';
import { ServerSocketService } from './server.socket.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [ServerController],
  providers: [ServerService, Gateway, ServerSocketService]
})
export class ServerModule {}
//