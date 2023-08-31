import { Body, Controller, Get, ParseIntPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { Delete, Param } from '@nestjs/common/decorators';
import { AuthGuard } from '@nestjs/passport';
import { User } from '@prisma/client';
import { Request } from 'express';
import { GetUser, Permission } from 'src/auth/decorator';
import { JwtGuard } from 'src/auth/guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { CreateRoleDto, EditRoleDto } from './dto';
import { RoleService } from './role.service';
import { UserEntity } from 'src/auth/dto/user.dto';
//

@UseGuards(JwtGuard, RolesGuard)
@Controller('role')
export class RoleController {
    constructor(private roleService: RoleService){}

    @Permission(false, 'role.getRoles')
    @Get()
    getRoles(@GetUser() user: UserEntity){
        return this.roleService.getRoles(user);
    }

    @Permission(false, 'role.getRoles')
    @Get('/byId/:id')
    getRoleById(@Param('id', ParseIntPipe) id: number,@GetUser() user: UserEntity){
        return this.roleService.getRoleById(id,user);
    }


    @Permission(false, 'role.getMyRoles')
    @Get('/me')
    getMyRoles(@GetUser() user: UserEntity){
        return this.roleService.getMyRoles(user);
    }

    @Permission(false, 'role.getUserAssigned')
    @Get('users/:id')
    getUserAssignedToRole(@Param('id', ParseIntPipe) id: number, @GetUser() user: UserEntity){
        return this.roleService.getUserAssignedToRole(id, user);
    }

    @Permission(false, 'role.createRole')
    @Post()
    createRole(@Body() dto: CreateRoleDto,@GetUser() user: UserEntity) {
        return this.roleService.createRole(dto, user);
    }

    @Permission(false, 'role.assignPermissionToRole')
    @Patch('/aptr/:roleId/:permissionId')
    assignPermissionToRole(@Param('roleId', ParseIntPipe) roleId: number, @Param('permissionId', ParseIntPipe) permissionId: number, @GetUser() user: UserEntity){
        return this.roleService.assignPermissionToRole(roleId, permissionId, user);
    }

    @Permission(false, 'role.assignMultiplePermissionToRole')
    @Patch('/amptr/:roleId')
    assignMultiplePermissionToRole(@Param('roleId', ParseIntPipe) roleId: number,@Body() listOfPermissionIds: {permissionId: number[]},@GetUser() user: UserEntity){
        return this.roleService.assignMultiplePermissionToRole(roleId ,listOfPermissionIds, user);
    }

    @Permission(false, 'role.dismissPermissionFromRole')
    @Patch('/dpfr/:roleId/:permissionId')
    dismissPermissionFromRole(@Param('roleId', ParseIntPipe) roleId: number, @Param('permissionId', ParseIntPipe) permissionId: number,@GetUser() user: UserEntity){
        return this.roleService.dismissPermissionToRole(roleId ,permissionId, user);
    }

    @Permission(false, 'role.dismissMultiplePermissionToRole')
    @Patch('/dmpfr/:roleId')
    dismissMultiplePermissionToRole(@Param('roleId', ParseIntPipe) roleId: number,@Body() listOfPermissionIds: {permissionId: number[]},@GetUser() user: UserEntity){
        return this.roleService.dismissMultiplePermissionToRole(roleId ,listOfPermissionIds, user);
    }

    @Permission(false, 'role.editRole')
    @Patch('/edit/:roleId')
    editRole(@Param('roleId', ParseIntPipe) roleId: number,@Body() dto: EditRoleDto,@GetUser() user: UserEntity){
        return this.roleService.editRole(roleId ,dto, user);
    }

    @Permission(false, 'role.deleteRole')
    @Delete('/:roleId')
    deleteRole(@Param('roleId', ParseIntPipe) roleId: number, @GetUser() user: UserEntity){
        return this.roleService.deleteRole(roleId, user);
    }
    
}