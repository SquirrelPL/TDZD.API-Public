import { ForbiddenException, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { parse } from 'path';
import { MyLogger } from 'src/auth/logger/logger.middleware';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateRoleDto, EditRoleDto } from './dto';
import { UserEntity } from 'src/auth/dto/user.dto';

@Injectable()
export class RoleService {
    logger: MyLogger;
    constructor(private prisma: PrismaService){
        this.logger = new MyLogger(prisma)
    }
//
    async getRoles(user: UserEntity){
        const role = await this.prisma.role.findMany({where: {
            brandId: user.brandUser.brandId
        }})
        return role;
    }

    async getRoleById(id: number, user: UserEntity){
        const role = await this.prisma.role.findUnique({
            where:{
                id,
                brandId: user.brandUser.brandId
            },
            select:{
                id: true,
                createdAt: true,
                updatedAt: true,
                discordRoleId: true,
                name: true,
                power: true,
                group: true,
                color: true,
                permissions:{
                    select:{
                        id: true,
                        sku: true
                    }
                },
                adminTimeTable:{
                    select:{
                        id: true,
                        server: {
                            select:{
                                id: true,
                                name: true,
                            }
                        },
                        minimumTime: true
                    }
                }
            }
        })
        if(!role) return new ForbiddenException(`Nie ma takiej roli o id: ${id}`).getResponse()
        return role
    }

    async getMyRoles(user: UserEntity){
        const role = await this.prisma.brandUser.findMany({
            where:{
                id: user.brandUser.id
            },
            select:{
                role: true
            }
        })
        return role[0].role;
    }

    async getUserAssignedToRole(id: number, user: UserEntity){
        const user1 = await this.prisma.role.findUnique({
            where: {
                id,
                brandId: user.brandUser.brandId
            },
            select: {
                brandUser: {
                    select:{
                        id: true,
                        user:{
                            select:{
                                id: true,
                                email: true,
                                discordUsername: true,
                                isActive: true
                            }
                        },
                        isAdmin: true,
                    }
                }
            }
        })
        return user1.brandUser;
    }

    async createRole(dto: CreateRoleDto, user: UserEntity){
        try{
            const role = await this.prisma.role.create({
                data: {
                    brandId: user.brandUser.brandId,
                    ...dto,
                },
            })
            this.logger.save({
                brandId: user.brandUser.brandId,
                title: `Stworzenie Roli`,
                description: `Uzytkownik ${user.discordUsername} o id: ${user.id} utworzył rolę ${role.name} o id: ${role.id}`
            })
            return {id: role.id};
        }catch(e){
            if(e.code === 'P2002') throw new ForbiddenException('Już istnieje taka rola');
            throw new ForbiddenException('Błąd jest nieznany');
        }

    }

    async assignPermissionToRole(roleId: number, permissionId: number, user: UserEntity) {

        var rolePermissions = await this.prisma.role.findUnique({
            where: { 
                id: roleId,
                brandId: user.brandUser.brandId
             },
            select: {
                name: true,
                permissions: {
                    select: {
                        id: true
                    }
                }
            }
            })

        if(rolePermissions === null)  throw new ForbiddenException(`Nie ma roli z id: ${roleId}`)

        try{
            const relation = await this.prisma.role.update({
                where: { id: roleId,
                    brandId: user.brandUser.brandId  },
                data: {
                  permissions: { connect: { id: permissionId }},
                },
              })
              this.logger.save({
                brandId: user.brandUser.brandId,
                title: `Przypisanie permisji do roli`,
                description: `Uzytkownik ${user?.discordUsername? user.discordUsername:"undefined"} o id: ${user?.id? user.id:"undefined"} przypisał permisję o id: ${permissionId} do roli ${rolePermissions.name} o id: ${roleId}`
            })
              return relation;
        }catch(e){
            if(e.code === 'P2025') throw new ForbiddenException(`Nie znaleziono permisji o id: ${permissionId}`)
            console.log(e)
            throw new ForbiddenException(`Błąd jest nieznany i należy zgłosić go do administratora: ${e.code}`)

        }

    }

    async assignMultiplePermissionToRole(roleId: number,listOfPermissionIds: {permissionId: number[]}, user: UserEntity){

        var rolePermissions = await this.prisma.role.findUnique({
            where: { 
                id: roleId,
                brandId: user.brandUser.brandId 
            },
            select: {
                name: true,
                permissions: {
                    select: {
                        id: true
                    }
                }
            }
            })
        if(rolePermissions === null)  throw new ForbiddenException(`Nie ma roli z id: ${roleId}`)

        try{
            const relation = await this.prisma.role.update({
                where: { id: roleId,
                    brandId: user.brandUser.brandId  },
                data: {
                  permissions: { connect: listOfPermissionIds.permissionId.map(x => {return {id: x}})},
                },
              })
              this.logger.save({
                brandId: user.brandUser.brandId,
                title: `Przypisanie permisji do roli`,
                description: `Uzytkownik ${user?.discordUsername? user.discordUsername:"undefined"} o id: ${user?.id? user.id:"undefined"} przypisał permisję o id: ${listOfPermissionIds.permissionId.map(x => {return x})} do roli ${rolePermissions.name} o id: ${roleId}`
            })
              return relation;
        }catch(e){
            if(e.code === 'P2025') throw new ForbiddenException(`Nie znaleziono roli o id: ${roleId} lub ${e.meta.cause}`)
            throw new ForbiddenException(`Błąd jest nieznany i należy zgłosić go do administratora ${e.code}`)
        }

    }

    
    async dismissPermissionToRole(roleId: number, permissionId: number, user: UserEntity) {
        var rolePermissions = await this.prisma.role.findUnique({
            where: { 
                id: roleId,
                brandId: user.brandUser.brandId 
            },
            select: {
                name:true,
                permissions: {
                    select: {
                        id: true
                    }
                }
            }
            })

        if(rolePermissions === null)  throw new ForbiddenException(`Nie ma roli z id: ${roleId}`)


        let ignoreList = [
            permissionId,
        ]
        for (var i = 0; i < rolePermissions.permissions.length; i++) {
            var obj = rolePermissions.permissions[i];
        
            if (ignoreList.indexOf(obj.id) !== -1) {
                rolePermissions.permissions.splice(i, 1);
            }
        }

        try{
            const relation = await this.prisma.role.update({
                where: { 
                    id: roleId, 
                    brandId: user.brandUser.brandId 
                },
                data: {
                  permissions: { set: [...rolePermissions.permissions]},
                },
              })
              this.logger.save({
                brandId: user.brandUser.brandId,
                title: `Odebranie permisji roli`,
                description: `Uzytkownik ${user?.discordUsername? user.discordUsername:"undefined"} o id: ${user?.id? user.id:"undefined"} odebrał permisję o id: ${permissionId} roli ${rolePermissions.name} o id: ${roleId}`
            })
              return relation;
        }catch(e){
            if(e.code === 'P2025') throw new ForbiddenException(`Nie znaleziono permisji o id: ${permissionId}`)
            throw new ForbiddenException(`Błąd jest nieznany i należy zgłosić go do administratora ${e.code}`)
        }

    }

    async dismissMultiplePermissionToRole(roleId: number, listOfPermissionIds: {permissionId: number[]}, user: UserEntity) {
        var rolePermissions = await this.prisma.role.findUnique({
            where: { 
                id: roleId,
                brandId: user.brandUser.brandId 
            },
            select: {
                name: true,
                permissions: {
                    select: {
                        id: true
                    }
                }
            }
            })

        if(rolePermissions === null)  throw new ForbiddenException(`Nie ma roli z id: ${roleId}`)

        for (var i = 0; i < rolePermissions.permissions.length; i++) {
            var obj = rolePermissions.permissions[i];
        
            if (listOfPermissionIds.permissionId.indexOf(obj.id) !== -1) {
                rolePermissions.permissions.splice(i, 1);
                i--
            }
        }

        try{
            const relation = await this.prisma.role.update({
                where: { 
                    id: roleId,
                    brandId: user.brandUser.brandId
                 },
                data: {
                  permissions: { set: [...rolePermissions.permissions]},
                },
              })
              this.logger.save({
                brandId: user.brandUser.brandId,
                title: `Odebranie permisji roli`,
                description: `Uzytkownik ${user?.discordUsername? user.discordUsername:"undefined"} o id: ${user?.id? user.id:"undefined"} odebrał permisję o id: ${listOfPermissionIds.permissionId.map(x => {return x})} roli ${rolePermissions.name} o id: ${roleId}`
            })
              return relation;
        }catch(e){
            throw new ForbiddenException(`Błąd jest nieznany i należy zgłosić go do administratora ${e.code}`)
        }

    }

    async editRole(roleId: number, dto: EditRoleDto, user: UserEntity){
        try{
            const role = await this.prisma.role.update({
                where: { 
                    id: roleId,
                    brandId: user.brandUser.brandId
                },
                data:{
                    ...dto
                }
            })
            this.logger.save({
                brandId: user.brandUser.brandId,
                title: `Edycja roli`,
                description: `Uzytkownik ${user?.discordUsername? user.discordUsername:"undefined"} o id: ${user?.id? user.id:"undefined"} edytował rolę ${role.name} o id: ${role.id}`
            })
            return role
        }catch(e){
            if(e.code === 'P2025') throw new ForbiddenException(`Nie znaleziono roli o id: ${roleId}`)
            else throw new ForbiddenException(`Kod błędu ${e.code}`)
        }
    }

    async deleteRole(roleId: number, user: UserEntity){
        try{
            const role = await this.prisma.role.delete({
                where: { 
                    id: roleId,
                    brandId: user.brandUser.brandId
                },
            })
            this.logger.save({
                brandId: user.brandUser.brandId,
                title: `Usunięcie roli`,
                description: `Uzytkownik ${user?.discordUsername? user.discordUsername:"undefined"} o id: ${user?.id? user.id:"undefined"} usuną rolę ${role.name} o id: ${role.id}`
            })
            return role
        }catch(e){
            if(e.code === 'P2025') throw new ForbiddenException(`Nie znaleziono roli o id: ${roleId}`)
            else throw new ForbiddenException(`Kod błędu ${e.code}`)
        }

    }

    
}