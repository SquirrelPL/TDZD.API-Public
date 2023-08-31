import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from '@prisma/client';
import { Request } from 'express';
import { GetUser, Permission } from 'src/auth/decorator';
import { JwtGuard } from 'src/auth/guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { EditUserDto } from './dto';
import { UserService } from './user.service';
import { GetBrand } from 'src/auth/decorator/get-used-brand.decorator';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserEntity } from 'src/auth/dto/user.dto';

//
@Controller('user')
export class UserController {
    constructor(private userService: UserService, private prismaService: PrismaService){}

    @UseGuards(JwtGuard)
    @Get('isMyAccountLinkedToDiscord')
    isMyAccountLinkedToDiscord(@GetUser() user: UserEntity){
        return user.discordId != null? {isLinked: true}:{isLinked: false}
    }

    @UseGuards(JwtGuard, RolesGuard)
    @Permission(false, "user.seeMySelf")
    @Get('me')
    getMe(@GetUser() user: User, @GetBrand() brand){
        return user
    }

    @UseGuards(JwtGuard, RolesGuard)
    @Permission(false, "admin.getAllAdmins")
    @Get('admin')
    getAllAdmins(@GetBrand() brand){
        return this.userService.getAllAdmins(brand)
    }

    @UseGuards(JwtGuard, RolesGuard)
    @Permission(false, "user.getAllUsers")
    @Get()
    getAllUsers(@GetBrand() brand){
        return this.userService.getAllUsers(brand)
    }

    @UseGuards(JwtGuard, RolesGuard)
    @Permission(false, "user.getAllUsers")
    @Get('/span/:start/:stop')
    getAllUsersSpan(@GetBrand() brand, @Param('start', ParseIntPipe) start: number, @Param('stop', ParseIntPipe) stop: number){
        return this.userService.getAllUsersSpan(brand, start, stop)
    }


    @UseGuards(JwtGuard, RolesGuard)
    @Permission(false, "user.getUserById")
    @Get('id/:id')
    getUserById(@Param('id', ParseIntPipe) id, @GetUser() user: UserEntity){
        return this.userService.getUserById(id, user) 
    }

    @Get('public/id/:id')
    getPublicUserById(@Param('id', ParseIntPipe) id){
        return this.userService.getPublicUserById(id) 
    }

    // this end point allows you to restrict search to only brand u are using
    @UseGuards(JwtGuard, RolesGuard)
    @Permission(false, "user.getUserByIdUsingBrandTree")
    @Get('brand/id/:id')
    getUserByIdUsingBrandTree(@Param('id', ParseIntPipe) id, @GetUser() user: UserEntity){
        return this.userService.getUserByIdUsingBrandTree(id, user)
    }

    // this end point is prohibitted from use and can be only aproved by 4 main owners
    @UseGuards(JwtGuard, RolesGuard)
    @Permission(false, "user.dezactivateUser")
    @Patch('dezactivateUser/:id')
    dezactivateUser(@Param('id', ParseIntPipe) id: number, @GetUser() user: UserEntity){
        return this.userService.dezactivateUser(id, user)
    }

    // this end point is prohibitted from use and can be only aproved by 4 main owners
    @UseGuards(JwtGuard, RolesGuard)
    @Permission(false, "user.activateUser")
    @Patch('activateUser/:id')
    activateUser(@Param('id', ParseIntPipe) id: number, @GetUser() user: UserEntity){
        return this.userService.activateUser(id, user)
    }

    @UseGuards(JwtGuard, RolesGuard)
    @Permission(false, "user.editUser")
    @Patch('edit/:id')
    editUser(@Param('id', ParseIntPipe) id: number, @Body() dto: EditUserDto, @GetUser() user: UserEntity, @GetBrand() brand: number){
        return this.userService.editUser(id, brand, dto, user)
    }

    @UseGuards(JwtGuard, RolesGuard)
    @Permission(false, "user.deleteUser")
    @Delete('user/id/:id') 
    deleteUser(@Param('id', ParseIntPipe) id: number, @GetUser() user: UserEntity){
        return this.userService.deleteUser(id, user)
    }

    @UseGuards(JwtGuard, RolesGuard)
    @Permission(false, "user.deleteBrandUser")
    @Delete('brandUser/id/:id')
    deleteBrandUser(@Param('id', ParseIntPipe) id: number, @GetUser() user: UserEntity, @GetBrand() brand: number){
        return this.userService.deleteBrandUser(id, brand, user)
    }

    @UseGuards(JwtGuard, RolesGuard)
    @Permission(false, "user.server.getAssignedServers")
    @Get('server/id/:id')
    getAssignedServers(@Param('id', ParseIntPipe) id: number, @GetBrand() brand){
        return this.userService.getAssignedServers(id, brand)
    }

    @UseGuards(JwtGuard, RolesGuard)
    @Permission(false, "user.server.assignServerToUser")
    @Patch('server/assign/:id/:serverId')
    assignServerToUser(@Param('id', ParseIntPipe) id: number, @Param('serverId', ParseIntPipe) serverId: number, @GetUser() user: UserEntity){
        return this.userService.assignServerToUser(id, serverId, user)
    }

    @UseGuards(JwtGuard, RolesGuard)
    @Permission(false, "user.server.dismissServerFromUser")
    @Patch('server/dismiss/:id/:serverId')
    dismissServerFromUser(@Param('id', ParseIntPipe) id: number, @Param('serverId', ParseIntPipe) serverId: number, @GetUser() user: UserEntity){
        return this.userService.dismissServerFromUser(id, serverId, user)
    }

    @UseGuards(JwtGuard, RolesGuard)
    @Permission(false, "user.role.getAssignedRoles")
    @Get('role/id/:id')
    getAssignedRoles(@Param('id', ParseIntPipe) id: number, @GetBrand() brand){
        return this.userService.getAssignedRoles(id, brand)
    }

    @UseGuards(JwtGuard, RolesGuard)
    @Permission(false, "user.permission.getAssignedPermissions")
    @Get('permission/id/:id')
    getAssignedPermissions(@Param('id', ParseIntPipe) id: number, @GetBrand() brand){
        return this.userService.getAssignedPermissions(id, brand)
    }

    @UseGuards(JwtGuard, RolesGuard)
    @Permission(false, "user.role.assignRoleToUser")
    @Patch('role/assign/:id/:roleId')
    assignRoleToUser(@Param('id', ParseIntPipe) id: number, @Param('roleId', ParseIntPipe) roleId: number, @GetUser() user: UserEntity){
        return this.userService.assignRoleToUser(id, roleId, user)
    }

    @UseGuards(JwtGuard, RolesGuard)
    @Permission(false, "user.role.dismissRoleFromUser")
    @Patch('role/dismiss/:id/:roleId')
    dismissRoleFromUser(@Param('id', ParseIntPipe) id: number, @Param('roleId', ParseIntPipe) roleId: number, @GetUser() user: UserEntity){
        return this.userService.dismissRoleFromUser(id, roleId, user)
    }

    @UseGuards(JwtGuard, RolesGuard)///////////////////////////////////////////// !!HERE!!
    @Permission(false, "user.permission.assignPermissionToUser")
    @Patch('permission/assign/:id/:permissionId')
    assignPermissionToUser(@Param('id', ParseIntPipe) id: number, @Param('permissionId', ParseIntPipe) permissionId: number, @GetUser() user: UserEntity){
        return this.userService.assignPermissionToUser(id, permissionId, user)
    }

    @UseGuards(JwtGuard, RolesGuard)
    @Permission(false, "user.permission.dismissPermissionFromUser")
    @Patch('permission/dismiss/:id/:permissionId')
    dismissPermissionFromUser(@Param('id', ParseIntPipe) id: number, @Param('permissionId', ParseIntPipe) permissionId: number, @GetUser() user: UserEntity){
        return this.userService.dismissPermissionFromUser(id, permissionId, user)
    }

    
    @Get('/publicAdminInfo/:brandId')
    publicAdminInfo(@Param('brandId', ParseIntPipe) brandId: number) {
        return this.userService.getPublicAdminInfo(brandId)
    }
}