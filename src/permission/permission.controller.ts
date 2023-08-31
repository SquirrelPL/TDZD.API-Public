import { Body, Controller, Get, ParseIntPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { Delete, Param } from '@nestjs/common/decorators';
import { AuthGuard } from '@nestjs/passport';
import { User } from '@prisma/client';
import { Request } from 'express';
import { GetUser, Permission } from 'src/auth/decorator';
import { JwtGuard } from 'src/auth/guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { CreatePermissionDto } from './dto';
import { PermissionService } from './permission.service';
import { UserEntity } from 'src/auth/dto/user.dto';
//
@UseGuards(JwtGuard, RolesGuard)
@Controller('permission')
export class PermissionController {
    constructor(private permissionService: PermissionService){}

    @Permission(false, 'permission.getPermissionBySku')
    @Get('/sku/:sku')
    getPermissionBySku(@Param('sku') sku: string, @GetUser() user: UserEntity){
        return this.permissionService.getPermissionBySku(sku, user);
    }

    @Permission(false, 'permission.getPermissionById')
    @Get('/id/:id')
    getPermissionById(@Param('id', ParseIntPipe) id: number, @GetUser() user: UserEntity){
        return this.permissionService.getPermissionById(id, user);
    }

    @Permission(false, 'Squirrels.SuperPermission')
    @Get()
    getPermission(){
        return this.permissionService.getPermission();
    }

    @Permission(false, 'permission.getPermissions')
    @Get('byBrand')
    getPermissionByBrand(@GetUser() user: UserEntity){
        return this.permissionService.getPermissionByBrand(user);
    }

    @Permission(false, 'permission.getUserAssignedToPermission')
    @Get('users/:id')
    getUsersAssigned(@Param('id', ParseIntPipe) id: number, @GetUser() user: UserEntity){
        return this.permissionService.getUsersAssigned(id, user);
    }

    @Permission(false, "permission.getRolesAssignedToPermission")
    @Get('roles/:id')
    getRolesAssigned(@Param('id', ParseIntPipe) id: number, @GetUser() user: UserEntity){
        return this.permissionService.getRolesAssigned(id, user);
    }

    @Permission(false, "Squirrels.SuperPermission")
    @Post()
    createPermission(@Body() dto: CreatePermissionDto, @GetUser() user: UserEntity){
        return this.permissionService.createPermission(dto, user);
    }

    @Permission(false, "Squirrels.SuperPermission")
    @Delete(':id')
    deletePermission(@Param('id', ParseIntPipe) id: number, @GetUser() user: UserEntity){
        return this.permissionService.deletePermission(id, user);
     
    }
}