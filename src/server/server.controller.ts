import { Body, Controller, Get, ParseIntPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { Delete, Param } from '@nestjs/common/decorators';
import { AuthGuard } from '@nestjs/passport';
import { User } from '@prisma/client';
import { Request } from 'express';
import { GetUser, Permission } from 'src/auth/decorator';
import { JwtGuard } from 'src/auth/guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { AddStatisticDTO, CreateServerDto, EditServerDto, GetStatisticByDateDto } from './dto';
import { ServerService } from './server.service';
import { UserEntity } from 'src/auth/dto/user.dto';
import { MessageBody, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';



//
@Controller('server')
export class ServerController {
    constructor(private serverService: ServerService){}

    @UseGuards(JwtGuard, RolesGuard)
    @Permission(false, 'server.getServers')
    @Get()
    getServers(@GetUser() user: UserEntity){
        return this.serverService.getServers(user);
    }

    @UseGuards(JwtGuard, RolesGuard)
    @Permission(false, 'server.getServerById')
    @Get(':id')
    getServerById(@Param('id', ParseIntPipe) id: number, @GetUser() user: UserEntity){
        return this.serverService.getServerById(id, user);
    }

    @UseGuards(JwtGuard, RolesGuard)
    @Permission(true, `server.&.#.getBans`)
    @Get('info/getBans/Id/:id')
    getBans(@Param('id', ParseIntPipe) id: number, @GetUser() user: UserEntity){
        return this.serverService.getBans(id, user);
    }

    @UseGuards(JwtGuard, RolesGuard)
    @Permission(true, `server.&.#.getCurrentPlayers`)
    @Post('currentPlayers/Id/:id')
    getCurrentPlayers(@Param('id', ParseIntPipe) id: number, @GetUser() user: UserEntity){
        return this.serverService.getCurrentPlayers(id, user);
    }

    @UseGuards(JwtGuard, RolesGuard)
    @Permission(true, `server.&.#.sendCommand`)
    @Post('sendCommand/Id/:id')
    sendCommand(@Param('id', ParseIntPipe) id: number, @GetUser() user: UserEntity, @Body() command: any){
        return this.serverService.sendCommand(id, user, command.command);
    }

    @Get('getCurrentPlayersPublic/Id/:id')
    getCurrentPlayersPublic(@Param('id', ParseIntPipe) id: number){
        return this.serverService.getCurrentPlayersPublic(id);
    }

    @UseGuards(JwtGuard, RolesGuard)
    @Permission(true, `server.&.#.start`)
    @Post('powerAction/start/Id/:id')
    startServer(@Param('id', ParseIntPipe) id: number, @GetUser() user: UserEntity){
        return this.serverService.startServer(id, user);
    }

    @UseGuards(JwtGuard, RolesGuard)
    @Permission(true, `server.&.#.stop`)
    @Post('powerAction/stop/Id/:id')
    stopServer(@Param('id', ParseIntPipe) id: number, @GetUser() user: UserEntity){
        return this.serverService.stopServer(id, user);
    }

    @UseGuards(JwtGuard, RolesGuard)
    @Permission(true, `server.&.#.restart`)
    @Post('powerAction/restart/Id/:id')
    restartServer(@Param('id', ParseIntPipe) id: number, @GetUser() user: UserEntity){
        return this.serverService.restartServer(id, user);
    }

    @Get('info/Id/:id')
    serverInfo(@Param('id', ParseIntPipe) id: number){
        return this.serverService.serverInfo(id);
    }

    @UseGuards(JwtGuard, RolesGuard)
    @Permission(false, 'server.createServer')
    @Post()
    createServer(@Body() dto: CreateServerDto, @GetUser() user: UserEntity){
        return this.serverService.createServer(dto, user);
    }

    @UseGuards(JwtGuard, RolesGuard)
    @Permission(false, 'server.editServer')
    @Patch(':id')
    editServer(@Param('id', ParseIntPipe) id: number,@Body() dto: EditServerDto, @GetUser() user: UserEntity){
        return this.serverService.editServer(id ,dto, user);
    }

    @UseGuards(JwtGuard, RolesGuard)
    @Permission(false, 'server.deleteServer')
    @Delete('/:id')
    deleteServer(@Param('id', ParseIntPipe) id: number, @GetUser() user: UserEntity){
        return this.serverService.deleteServer(id, user);
    }

    // only bots can have this permission !
    @UseGuards(JwtGuard, RolesGuard)
    @Permission(false, 'server.statistic.addStatistic')
    @Post('/statistic')
    addStatistic(@Body() dto: AddStatisticDTO){
        return this.serverService.addStatistic(dto);
    }

    
    @Get('/statistic/byId/:id')
    getStatisticById(@Param('id', ParseIntPipe) id: number){
        return this.serverService.getStatisticById(id);
    }

    @Get('/statistic/byDate/:serverId')
    getStatisticByDate(@Param('serverId', ParseIntPipe) serverId: number,@Body() dto: GetStatisticByDateDto){
        return this.serverService.getStatisticByDate(serverId,dto);
    }
    
}


