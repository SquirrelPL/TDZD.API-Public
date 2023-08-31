import { Body, Controller, Get, Logger, ParseIntPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { Delete, Param, UseInterceptors } from '@nestjs/common/decorators';
import { AuthGuard } from '@nestjs/passport';
import { User } from '@prisma/client';
import { Request } from 'express';
import { GetUser, Permission } from 'src/auth/decorator';
import { JwtGuard } from 'src/auth/guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { MyLogger } from 'src/auth/logger/logger.middleware';
import { CreateLogDto, GetLogsByDateDto, GetMultipleLogsByIdSpanDto } from './dto';
import { LogService } from './log.service';
import { UserEntity } from 'src/auth/dto/user.dto';
//

@UseGuards(JwtGuard, RolesGuard)
@Controller('log')
export class LogController {

    constructor(private logService: LogService){}

    @Permission(false, 'log.getLogs')
    @Get()
    getLogs(@GetUser() user: UserEntity){
        return this.logService.getLogs(user);
    }

    @Permission(false, 'log.getLogById')
    @Get('id/:id')
    getLogById(@Param('id', ParseIntPipe) id: number, @GetUser() user: UserEntity){
        return this.logService.getLogById(id, user);
    }

    @Permission(false, 'log.getLogByDate')
    @Get('byDate')
    getLogByDate(@Body() dto: GetLogsByDateDto, @GetUser() user: UserEntity){
        return this.logService.getLogByDate(dto, user);
    }

    @Permission(false, 'log.getMultipleLogsByIdSpan')
    @Get('byIdSpan')
    getMultipleLogsByIdSpan(@Body() dto: GetMultipleLogsByIdSpanDto, @GetUser() user: UserEntity){
        return this.logService.getMultipleLogsByIdSpan(dto, user);
    }

    @Permission(false, 'log.postLog')
    @Post()
    postLog(@Body() dto: CreateLogDto, @GetUser() user: UserEntity){
        return this.logService.postLog(dto, user);
    }

 
    @Permission(false, 'Squirrels.SuperPermission')
    @Delete(':id')
    deleteLog(@Param('id', ParseIntPipe) id: number, @GetUser() user: UserEntity){
        return this.logService.deleteLog(id, user);
    }
}