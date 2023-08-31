import { Body, Controller, Get, ParseIntPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { Delete, Param } from '@nestjs/common/decorators';
import { AuthGuard } from '@nestjs/passport';
import { User } from '@prisma/client';
import { Request } from 'express';
import { GetUser, Permission } from 'src/auth/decorator';
import { JwtGuard } from 'src/auth/guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { AnnouncmentService } from './announcment.service';
import { CreateAnnouncmentDto, EditAnnouncmentDto } from './dto';
import { UserEntity } from 'src/auth/dto/user.dto';


//
@Controller('announcment')
export class AnnouncmentController {
    constructor(private announcmentService: AnnouncmentService){}

    @UseGuards(JwtGuard, RolesGuard)
    @Permission(false, 'announcment.getAll')
    @Get()
    getAnnouncment(@GetUser() user: UserEntity) {
        return this.announcmentService.getAnnouncment(user);
    }

    @UseGuards(JwtGuard, RolesGuard)
    @Permission(false, 'announcment.ById')
    @Get('id/:id')
    getAnnouncmentById(@Param('id', ParseIntPipe) id: number, @GetUser() user: UserEntity){
        return this.announcmentService.getAnnouncmentById(id, user);
    }

    @Get('latest/:id')
    getAnnouncmentLatests(@Param('id', ParseIntPipe) id: number){
        return this.announcmentService.getAnnouncmentLatests(id);
    }

    @UseGuards(JwtGuard, RolesGuard)
    @Permission(false, 'announcment.createAnnouncment')
    @Post()
    createAnnouncment(@Body() dto: CreateAnnouncmentDto,@GetUser() user: UserEntity){
        return this.announcmentService.createAnnouncment(dto, user);
    }

    @UseGuards(JwtGuard, RolesGuard)
    @Permission(false, 'announcment.editAnnouncment')
    @Patch(':id')
    editAnnouncment(@Param('id', ParseIntPipe) id: number, @Body() dto: EditAnnouncmentDto, @GetUser() user: UserEntity){
        return this.announcmentService.editAnnouncment(id, dto, user);
    }

    @UseGuards(JwtGuard, RolesGuard)
    @Permission(false, 'announcment.deleteAnnouncment')
    @Delete(':id')
    deleteAnnouncment(@Param('id', ParseIntPipe) id: number, @GetUser() user: UserEntity){
        return this.announcmentService.deleteAnnouncment(id, user);
    }
}