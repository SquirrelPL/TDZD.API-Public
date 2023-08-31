import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Role, User } from '@prisma/client';
import { Request } from 'express';
import { GetUser, Permission } from 'src/auth/decorator';
import { JwtGuard } from 'src/auth/guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { TempRoleService } from './tempRole.service';
import { AssignTempRoleDTO } from './dto';
import { UserEntity } from 'src/auth/dto/user.dto';

@UseGuards(JwtGuard, RolesGuard)
@Controller('temprole')
export class TempRoleController {
    constructor(private temproleService: TempRoleService){}
//
    @Permission(false, 'temprole.getTempRoles')
    @Get()
    getTempRoles(@Body() {expired = false}: {expired: boolean}, @GetUser() user: UserEntity ){
        return this.temproleService.getTempRoles(expired, user);
    }
    
    @Permission(false, 'temprole.getTempRoleById')
    @Get('/byId/:id')
    getTempRoleById(@Param('id', ParseIntPipe) id: number, @GetUser() user: UserEntity){
        return this.temproleService.getTempRoleById(id, user);
    }

    @Permission(false, 'temprole.getMyTempRoles')
    @Get('/my')
    getMyTempRoles(@GetUser() user: UserEntity, @Body() {expired = false}: {expired: boolean}){
        return this.temproleService.getMyTempRoles(user, expired);
    }

    @Permission(false, 'temprole.getTempRoleByUserId')
    @Get('/byUserId/:id')
    getTempRoleByUserId(@Param('id', ParseIntPipe) id: number, @Body() {expired = false}: {expired: boolean}, @GetUser() user: UserEntity){
        return this.temproleService.getTempRoleByUserId(id, expired, user);
    }

    @Permission(false, 'temprole.assignTempRole')
    @Post()
    assignTempRole(@GetUser() user: UserEntity, @Body() dto: AssignTempRoleDTO){
        return this.temproleService.assignTempRole(user, dto);
    }

    @Permission(false, 'temprole.deleteTempRole')
    @Delete('/byId/:id')
    deleteTempRole(@GetUser() user: UserEntity, @Param('id', ParseIntPipe) id: number){
        return this.temproleService.deleteTempRole(user, id);
    }
}