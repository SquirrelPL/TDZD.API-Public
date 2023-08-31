import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from '@prisma/client';
import { Request } from 'express';
import { GetUser, Permission } from 'src/auth/decorator';
import { JwtGuard } from 'src/auth/guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { AdminTimeTableService } from './adminTimeTable.service';
import { CreateAdminTimeTableDto, EditAdminTimeTableDto } from './dto';
import { UserEntity } from 'src/auth/dto/user.dto';
//
@UseGuards(JwtGuard, RolesGuard)
@Controller('adminTimeTable')
export class AdminTimeTableController {
    constructor(private adminTimeTableService: AdminTimeTableService){}


    @Permission(false, 'adminTimeTable.getAdminTimeTableByRoleId')
    @Get('/role/:roleId')
    getAdminTimeTableByRoleId(@Param('roleId', ParseIntPipe) roleId: number, @GetUser() user: UserEntity){
        return this.adminTimeTableService.getAdminTimeTableByRoleId(roleId, user);
    }

    @Permission(false, 'adminTimeTable.getAdminTimeTableById')
    @Get('/id/:id')
    getAdminTimeTableById(@Param('id', ParseIntPipe) id: number, @GetUser() user: UserEntity){
        return this.adminTimeTableService.getAdminTimeTableById(id, user);
    }

    @Permission(false, 'adminTimeTable.getPermissions')
    @Get()
    getAdminTimeTable(@GetUser() user: UserEntity){
        return this.adminTimeTableService.getAdminTimeTable(user);
    }

    @Permission(false, "adminTimeTable.editAdminTimeTableById")
    @Patch(':id')
    editAdminTimeTableById(@Param('id', ParseIntPipe) id: number, @Body() dto: EditAdminTimeTableDto, @GetUser() user: UserEntity){
        return this.adminTimeTableService.editAdminTimeTableById(id, dto, user);
    }

    @Permission(false, "adminTimeTable.createAdminTimeTable")
    @Post()
    createAdminTimeTable(@Body() dto: CreateAdminTimeTableDto, @GetUser() user: UserEntity){
        return this.adminTimeTableService.createAdminTimeTable(dto, user);
    }

    @Permission(false, "adminTimeTable.deleteAdminTimeTable")
    @Delete(':id')
    deleteAdminTimeTable(@Param('id', ParseIntPipe) id: number, @GetUser() user: UserEntity){
        return this.adminTimeTableService.deleteAdminTimeTable(id, user);
     
    }

    
}