import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { User } from '@prisma/client';
import { MyLogger } from 'src/auth/logger/logger.middleware';
import { PrismaService } from 'src/prisma/prisma.service';
import { EditUserDto } from './dto';
import { UserEntity } from 'src/auth/dto/user.dto';
import { warn } from 'console';

@Injectable()
export class UserService {
    logger: MyLogger;
    constructor(private prisma: PrismaService){
        this.logger = new MyLogger(prisma)
    }
//
    /**
     *  A getAllAdmins function
     *  Function returns all admins 
     *  @param {number} brandId - Id of brand
     */
    async getAllAdmins(brandId: number){
        const admins = await this.prisma.brandUser.findMany({
            where: {
                isAdmin: true,
                user: {
                    isActive: true
                },
                brandId
            },
            select: {
                user: {
                    select: {
                        id: true,
                        steamId: true,
                        discordId: true,
                        discordUsername: true,
                        discordAvatarUrl: true,
                        discordDiscriminator: true,
                    }
                },
                role: {
                    select: {
                        discordRoleId: true,
                        name: true,
                        group: true,
                        color: true,
                        power: true
                    },
                    orderBy: {
                        power: 'asc',
                    },
                    take: 1,
                  },
            }
        })
        return admins
    }

    /**
     *  A getAllUsers function
     *  Function returns all users 
     *  @param {number} brandId - Id of brand
     */
    async getAllUsers(brandId: number){
        const users = await this.prisma.brandUser.findMany({
            where:{
                user: {
                    isActive: true
                },
                brandId
            }
        })
        return users
    }

    async getAllUsersSpan(brandId: number, start: number, stop: number){
        const users = await this.prisma.brandUser.findMany({
            skip: start,
            take: stop,
            where:{
                user: {
                    isActive: true
                },
                brandId
            },
            select:{
                user:{
                    select:{
                        id: true,
                        discordUsername: true,
                        discordId: true,
                        steamId: true
                    }
                },
                isAdmin: true
            }
        })
        return users
    }

    /**
     *  A getUserById function
     *  Function returns user with
     *  @param {number} targetId - Id of target user
     */
    async getUserById(targetId: number, user1: UserEntity){
        try{
            const user = await this.prisma.user.findUnique({
                where: {
                    id: targetId,
                },
                select: {
                    id: true,
                    createdAt: true,
                    updatedAt: true,
                    ownerOf: true,
                    email: true,
                    hash: false,
                    steamId: true,
                    discordId: true,
                    discordUsername:true,
                    discordDiscriminator: true,
                    discordAvatarUrl:true,
                    isActive:true,
                    brandUser: {
                        where:{brandId: user1.brandUser.brandId},
                        select:{
                            id: true,
                            createdAt: true,
                            updatedAt: true,
                            userId: true,
                            brandId: true,
                            isAdmin: true,
                            role: true,
                            permission: true,
                            server: true,
                            tempRole: true,
                            vallet: true,
                            warn: {
                                where:{
                                    expirationDate: {
                                        gte:  new Date().toISOString()
                                      },
                                  },
                                select: {
                                  id: true,
                                  reason: true,
                                  createdAt: true,
                                  expirationDate: true,
                                  author: {
                                    select:{
                                        id: true,
                                        isAdmin: true,
                                        user: {
                                            select: {
                                                id: true,
                                                discordId: true,
                                                discordUsername: true
                                            }
                                        }
                                    }
                                },
                                }
                              },
                            strike: {
                                where:{
                                    expirationDate: {
                                        gte:  new Date().toISOString()
                                      },
                                  },
                                select: {
                                    id: true,
                                    reason: true,
                                    createdAt: true,
                                    expirationDate: true,
                                    author: {
                                      select:{
                                          id: true,
                                          isAdmin: true,
                                          user: {
                                              select: {
                                                  id: true,
                                                  discordId: true,
                                                  discordUsername: true
                                              }
                                          }
                                      }
                                  },
                                  }
                            },
                            vacation: {
                                where:{
                                    endOfVacation: {
                                        gte:  new Date().toISOString()
                                    },
                                    startOfVacation: {
                                        lt: new Date().toISOString(),
                                    },
                                },
                                select: {
                                    id: true,
                                    createdAt: true,
                                    updatedAt: true,
                                    reason: true,
                                    author: {
                                      select:{
                                          id: true,
                                          isAdmin: true,
                                          user: {
                                              select: {
                                                  id: true,
                                                  discordId: true,
                                                  discordUsername: true
                                              }
                                          }
                                      }
                                  },
                                    startOfVacation: true,
                                    endOfVacation: true,
                                  }
                            },

                        }
                    },
                }
            })
            return user;
        } catch(e) {
            if (e.code === 'P2025') throw new ForbiddenException(`Nie znaleziono uzytkownika o id: ${targetId}`)
            else throw new ForbiddenException(`Kod błędu ${e.code}`)
        }
    }

    async getPublicUserById(targetId: number){
        const user = await this.prisma.user.findUnique({
            where: {
                id: targetId,
            },
            select:{
                id: true,
                discordUsername: true,
                discordAvatarUrl: true
            }
        })
        return user
    }

    
    /**
     *  A getUserByIdUsingBrandTree function
     *  Function returns User with brand user object of brand used currently by sender user
     *  @param {number} targetId - Id of target user
     *  @param {UserEntity} user - Object of sender user
     */
    async getUserByIdUsingBrandTree(targetId: number, user: UserEntity){
        try{
            const user1 = await this.prisma.brandUser.findFirst({
                where: {
                    brandId: user.brandUser.brandId,
                    user:{
                        id: targetId
                    }
                },
                select: {
                    user: true,
                }
            })
            return user1;
        } catch(e) {
            if (e.code === 'P2025') throw new ForbiddenException(`Nie znaleziono uzytkownika o id: ${targetId}`)
            else throw new ForbiddenException(`Kod błędu ${e.code}`)
        }
    }

    /**
     *  A dezactivateUser function
     *  Function dezactivated enabled target user
     *  @param {number} targetId - Id of target user
     *  @param {UserEntity} user - Object of sender user
     */
    async dezactivateUser(targetId: number, user: UserEntity){
        const isTargetAbleToPerformAction = await this.checkRole(targetId, user);
        if(!isTargetAbleToPerformAction)  return new ForbiddenException(`Na tym użytkowniku nie możesz wykonywać akcji gdyż jest wyżej lub na tym samym poziomie co ty. [albo takiej osoby nie ma]`).getResponse()

        try{


            const userT = await this.prisma.user.update({
                where: {
                    id: targetId
                },
                data:{
                    isActive: false
                }
            })
            this.logger.save({
                brandId: user.brandUser.brandId,
                title: `Dezaktywacja użytkownika`,
                description: `Użytkownik ${user.discordUsername} o id: ${user.id} DEZAKTYWOWAŁ uzytkownika ${userT.discordUsername} o id: ${userT.id}`
            })
            delete userT.hash
            return userT;
        }catch(e){
            if(e.code === 'P2025') throw new ForbiddenException(`Nie znaleziono uzytkownika o id: ${targetId}`)
            else throw new ForbiddenException(`Kod błędu ${e.code}`)
        }
    }

    /**
     *  A activateUser function
     *  Function activates disabled target user
     *  @param {number} targetId - Id of target user
     *  @param {UserEntity} user - Object of sender user
     */
    async activateUser(targetId, user: UserEntity){
        const isTargetAbleToPerformAction = await this.checkRole(targetId, user);
        if(!isTargetAbleToPerformAction)  return new ForbiddenException(`Na tym użytkowniku nie możesz wykonywać akcji gdyż jest wyżej lub na tym samym poziomie co ty. [albo takiej osoby nie ma]`).getResponse()

        try{
            const userT = await this.prisma.user.update({
                where: {
                    id: targetId
                },
                data:{
                    isActive: true
                }
            })
            this.logger.save({
                brandId: user.brandUser.brandId,
                title: `Aktywacja użytkownika`,
                description: `Użytkownik ${user.discordUsername} o id: ${user.id} AKTYWOWAŁ uzytkownika ${userT.discordUsername} o id: ${userT.id}`
            })
            delete userT.hash
            return userT;
        }catch(e){
            if(e.code === 'P2025') throw new ForbiddenException(`Nie znaleziono uzytkownika o id: ${targetId}`)
            else throw new ForbiddenException(`Kod błędu ${e.code}`)
        }
    }

    /**
     *  A editUser function
     *  Function allows to edit user based on DTO
     *  @param {number} targetId - Id of target user
     *  @param {number} brandId - Id of brand
     *  @param {EditUserDto} dto - DTO wich says wich data can be edited
     *  @param {UserEntity} user - Object of sender user
     */
    async editUser(targetId: number, brandId: number, dto: EditUserDto, user: UserEntity){
        try{
            const userTx = await this.prisma.brandUser.findFirst({
                where: {
                    user: {
                        id: targetId
                    },
                    brandId
                }
            })
            if(!userTx) return new ForbiddenException("Nie ma takiego użytkownika!");
            let obj: any = {}
            if(dto.email)
                obj.email = dto.email
            if(dto.discordId)
                obj.discordId = dto.discordId
            if(dto.steamId)
                obj.steamId = dto.steamId
            const userT = await this.prisma.brandUser.update({
                where: {
                    id: userTx.id,
                    brandId: user.brandUser.brandId
                },
                data: {
                    isAdmin: dto.isAdmin,
                    user: {
                        update: {
                            ...obj
                        }
                    }
                },
                select: {
                    user: {
                        select: {
                            discordUsername: true,
                        }
                    }
                }
            })
            this.logger.save({
                brandId: user.brandUser.brandId,
                title: `Edycja użytkownika`,
                description: `Użytkownik ${user.discordUsername} o id: ${user.id} edytował uzytkownika ${userT.user.discordUsername} o id: ${targetId}`
            })
            return userTx;
        } catch (e) {
            console.log(e)
            if (e.code === 'P2025') throw new ForbiddenException(`Nie znaleziono uzytkownika o id: ${targetId}`)

            else throw new ForbiddenException(`Kod błędu ${e.code}`)
        }
    }

    /**
     *  A deleteUser function
     *  Function deletes target user [! use of this function is strictly prohibited and only allowed after contacting with "Main server owners" !]
     *  @param {number} targetId - Id of target user
     *  @param {UserEntity} user - Object of sender user
     */
    async deleteUser(targetId: number, user: UserEntity){
        try{
            const userT = await this.prisma.user.delete({
                where: {
                    id: targetId,
                }
            })
            this.logger.save({
                brandId: user.brandUser.brandId,
                title: `Usuniecie użytkownika`,
                description: `Użytkownik ${user.discordUsername} o id: ${user.id} usuną uzytkownika ${userT.discordUsername} o id: ${userT.id}`
            })
            delete userT.hash
            return userT;
        }catch(e){
            if(e.code === 'P2025') throw new ForbiddenException(`Nie znaleziono uzytkownika o id: ${targetId}`)
            else throw new ForbiddenException(`Kod błędu ${e.code}`)
        }
    }

    /**
     *  A deleteBrandUser function
     *  Function deletes target brandUser
     *  @param {number} targetId - Id of target user
     *  @param {number} brandId - Id of brand
     *  @param {UserEntity} user - Object of sender user
     */
    async deleteBrandUser(targetId: number, brandId: number, user: UserEntity){
        try{
            const userTx = await this.prisma.brandUser.findFirst({
                where: {
                    id: targetId,
                    brandId
                }
            })
            if (!userTx) return new ForbiddenException("Nie ma takiego użytkownika!").getResponse();

            const userT = await this.prisma.brandUser.delete({
                where: {
                    id: userTx.id,
                    brandId: user.brandUser.brandId
                },
                select: {
                    user: {
                        select: {
                            discordUsername: true,
                        }
                    }
                }
            })
            this.logger.save({
                brandId: user.brandUser.brandId,
                title: `Usuniecie użytkownika`,
                description: `Użytkownik ${user.discordUsername} o id: ${user.id} usuną uzytkownika ${userT.user.discordUsername} o id: ${targetId}`
            })
            return userT;
        } catch(e) {
            if(e.code === 'P2025') throw new ForbiddenException(`Nie znaleziono uzytkownika o id: ${targetId}`)
            else throw new ForbiddenException(`Kod błędu ${e.code}`)
        }
    }

    /**
     *  A getAssignedServers function
     *  Function returns servers assigned to target user
     *  @param {number} targetId - Id of target user
     *  @param {number} brand - Id of brand that sender is using
     */
    async getAssignedServers(targetId, brand: number){ 
        try{
            const servers = await this.prisma.brandUser.findFirst({
                where: {
                    id: targetId,
                    brandId: brand
                },
                select: {
                    server: {
                        select: {
                            id: true,
                            createdAt: true,
                            updatedAt: true,
                            brandId: true,
                            name: true,
                            sId: true,
                            game: true,
                            support_id: true,
                            ip: true,
                            port: true
                        }
                    }
                }
            })
            if(!servers) return new ForbiddenException(`Nie znaleziono uzytkownika o id: ${targetId}`).getResponse();
            return servers.server;
        }catch(e){
            if(e.code === 'P2025') throw new ForbiddenException(`Nie znaleziono uzytkownika o id: ${targetId}`)
            else throw new ForbiddenException(`Kod błędu ${e.code}`)
        }
    }

    /**
     *  A assignServerToUser function
     *  Function assigns server to target user
     *  @param {number} targetId - Id of target user
     *  @param {number} serverId - Id of server to assign to user
     *  @param {UserEntity} user - Object of sender user
     */
    async assignServerToUser(targetId: number, serverId: number, user: UserEntity){
        var userServers = await this.prisma.brandUser.findUnique({
            where: { id: targetId, brandId: user.brandUser.brandId },
            select: {
                user: {
                    select: {
                        discordUsername: true,
                    }
                },
                server: {
                    select: {
                        id: true
                    }
                }
            }
            })
        
        if(userServers === null)  throw new ForbiddenException(`Nie ma użytkownika z id: ${targetId}`)
        
        try{
            const relation = await this.prisma.brandUser.update({
                where: { id: targetId },
                data: {
                  server: { set: [...userServers.server, { id: serverId }]},
                },
              })
              this.logger.save({
                brandId: user.brandUser.brandId,
                title: `Przypisanie Serwera do użytkownika`,
                description: `Uzytkownik ${user?.discordUsername? user.discordUsername:"undefined"} o id: ${user?.id? user.id:"undefined"} przypisał serwer o id: ${serverId} do użytkownika ${userServers.user.discordUsername} o id: ${targetId}`
            })
              return relation;
        }catch(e){
            if(e.code === 'P2025') throw new ForbiddenException(`Nie znaleziono serwera o id: ${serverId}`)
            console.log(e)
            throw new ForbiddenException(`Błąd jest nieznany i należy zgłosić go do administratora: ${e.code}`)
        
        }
    }

    /**
     *  A dismissServerFromUser function
     *  Function dismissis server from target user
     *  @param {number} targetId - Id of target user
     *  @param {number} serverId - Id of server to dismiss from user
     *  @param {UserEntity} user - Object of sender user
     */
    async dismissServerFromUser(id: number, serverId: number, user: UserEntity){
        var userServers = await this.prisma.brandUser.findUnique({
            where: { id, brandId: user.brandUser.brandId },
            select: {
                user: {
                    select: {
                        discordUsername: true,
                    }
                },
                server: {
                    select: {
                        id: true
                    }
                }
            }
            })

        if(userServers === null)  throw new ForbiddenException(`Nie ma użytkownika z id: ${id}`)


        let ignoreList = [
            serverId,
        ]
        for (var i = 0; i < userServers.server.length; i++) {
            var obj = userServers.server[i];
        
            if (ignoreList.indexOf(obj.id) !== -1) {
                userServers.server.splice(i, 1);
            }
        }

        try{
            const relation = await this.prisma.brandUser.update({
                where: { id,  brandId: user.brandUser.brandId },
                data: {
                  server: { set: [...userServers.server]},
                },
              })
              this.logger.save({
                brandId: user.brandUser.brandId,
                title: `Odebranie serwera od użytkownika`,
                description: `Uzytkownik ${user?.discordUsername? user.discordUsername:"undefined"} o id: ${user?.id? user.id:"undefined"} odebrał serwer o id: ${serverId} użytkownikowi ${userServers.user.discordUsername} o id: ${id}`
            })
              return relation;
        }catch(e){
            if(e.code === 'P2025') throw new ForbiddenException(`Nie znaleziono servera o id: ${serverId}`)
            throw new ForbiddenException(`Błąd jest nieznany i należy zgłosić go do administratora ${e.code}`)
        }
    }

    /**
     *  A getAssignedRoles function
     *  Function returns assigned roles of target user
     *  @param {number} targetId - Id of target user
     *  @param {number} brand - Id of brand used by sender
     */
    async getAssignedRoles(targetId: number, brand: number){
        try{
            const roles = await this.prisma.brandUser.findFirst({
                where: {
                    user:{
                        id: targetId
                    },
                    brandId: brand
                },
                select: {
                    role: true
                }
            })
            return roles.role;
        }catch(e){
            console.log(e)
            if(e.code === 'P2025') throw new ForbiddenException(`Nie znaleziono uzytkownika o id: ${targetId}`)
            else throw new ForbiddenException(`Kod błędu ${e.code}`)
        }
    }

    /**
     *  A getAssignedPermissions function
     *  Function returns assigned permission of target user
     *  @param {number} targetId - Id of target user
     *  @param {number} brand - Id of brand used by sender
     */
    async getAssignedPermissions(targetId: number, brand: number){
        try{
            const permissions = await this.prisma.brandUser.findFirst({
                where: {
                    user:{
                        id: targetId
                    },
                    brandId: brand
                },
                select: {
                    permission: true
                }
            })
            return permissions.permission;
        }catch(e){
            if(e.code === 'P2025') throw new ForbiddenException(`Nie znaleziono uzytkownika o id: ${targetId}`)
            else throw new ForbiddenException(`Kod błędu ${e.code}`)
        }
    }

    /**
     *  A assignRoleToUser function
     *  Function assingns role to user 
     *  @param {number} targetId - Id of target user
     *  @param {number} roleId - Id of role to assign
     *  @param {UserEntity} user - Object of sender user
     */
    async assignRoleToUser(targetId: number, roleId: number, user: UserEntity){

        var userRoles = await this.prisma.brandUser.findFirst({
            where: {
                brandId: user.brandUser.brandId,
                user:{
                    id: targetId
                },
            },
            select: {
                id:true,
                user: {
                    select: {
                        discordUsername: true,
                    }
                },
                role: {
                    select: {
                        id: true
                    }
                }
            }
            })
        
        if(userRoles === null)  throw new ForbiddenException(`Nie ma użytkownika z id: ${targetId}`)

        try{
            const role = await this.prisma.role.findFirst({
                where:{
                    id: roleId
                }
            })
            if(!role) return new ForbiddenException("Nie ma takiej roli").getResponse()
            if(user.brandUser.role[0]?.power >= role.power) return new ForbiddenException("Nie możesz przypisać komuś większej roli niż twoja własna").getResponse()
        }catch{}
        
        try{
            const relation = await this.prisma.brandUser.update({
                where: { id: userRoles.id, brandId: user.brandUser.brandId },
                data: {
                  role: { set: [...userRoles.role,{ id: roleId }]},
                },
                select: {
                    user: {
                        select: {
                            discordId: true,
                        }
                    }
                }
              })
              this.logger.save({
                brandId: user.brandUser.brandId,
                title: `Przypisanie Roli do użytkownika`,
                description: `Uzytkownik ${user?.discordUsername? user.discordUsername:"undefined"} o id: ${user?.id? user.id:"undefined"} przypisał role o id: ${roleId} do użytkownika ${userRoles.user.discordUsername} o id: ${targetId}`
            })
            const returnValue = {
                userId: targetId,
                userDiscordId: relation.user.discordId,
                roleId: roleId
            }
            return returnValue;
        }catch(e){
            if(e.code === 'P2025') throw new ForbiddenException(`Nie znaleziono roli o id: ${roleId}`)
            throw new ForbiddenException(`Błąd jest nieznany i należy zgłosić go do administratora: ${e.code}`)
        }
    }

    /**
     *  A dismissRoleFromUser function
     *  Function dismissis role from user 
     *  @param {number} targetId - Id of target user
     *  @param {number} roleId - Id of role to dismiss
     *  @param {UserEntity} user - Object of sender user
     */
    async dismissRoleFromUser(targetId: number, roleId: number, user: UserEntity){
        var userRoles = await this.prisma.brandUser.findFirst({
            where: {
                brandId: user.brandUser.brandId,
                user:{
                    id: targetId
                },
            },
            select: {
                id: true,
                user: {
                    select: {
                        discordUsername:true,
                    }
                },
                role: {
                    select: {
                        id: true
                    }
                }
            }
            })

        if(userRoles === null)  throw new ForbiddenException(`Nie ma użytkownika z id: ${targetId}`)


        let ignoreList = [
            roleId,
        ]
        for (var i = 0; i < userRoles.role.length; i++) {
            var obj = userRoles.role[i];
        
            if (ignoreList.indexOf(obj.id) !== -1) {
                userRoles.role.splice(i, 1);
            }
        }

        try{
            const relation = await this.prisma.brandUser.update({
                where: { id: userRoles.id, brandId: user.brandUser.brandId },
                data: {
                    role: { set: [...userRoles.role]},
                },
                select: {
                    user: {
                        select: {
                            discordId: true,
                        }
                    }
                }
              })
              this.logger.save({
                brandId: user.brandUser.brandId,
                title: `Odebranie roli od użytkownika`,
                description: `Uzytkownik ${user?.discordUsername? user.discordUsername:"undefined"} o id: ${user?.id? user.id:"undefined"} odebrał rolę o id: ${roleId} użytkownikowi ${userRoles.user.discordUsername} o id: ${targetId}`
            })
            const returnValue = {
                userId: targetId,
                userDiscordId: relation.user.discordId,
                roleId: roleId
            }
              return returnValue;
        }catch(e){
            if(e.code === 'P2025') throw new ForbiddenException(`Nie znaleziono roli o id: ${roleId}`)
            throw new ForbiddenException(`Błąd jest nieznany i należy zgłosić go do administratora ${e.code}`)
        }
    }

    /**
     *  A assignPermissionToUser function
     *  Function assigns permission to user 
     *  @param {number} targetId - Id of target user
     *  @param {number} permissionId - Id of permission to assign
     *  @param {UserEntity} user - Object of sender user
     */
    async assignPermissionToUser(targetId: number, permissionId: number, user: UserEntity){
        var userPermission = await this.prisma.brandUser.findFirst({
            where: {
                brandId: user.brandUser.brandId,
                user:{
                    id: targetId
                },
            },
            select: {
                id:true,
                user: {
                    select: {
                        discordUsername: true,
                    }
                },
                permission: {
                    select: {
                        id: true
                    }
                }
            }
            })
        
        if(userPermission === null)  throw new ForbiddenException(`Nie ma użytkownika z id: ${targetId}`)
        
        try{
            const relation = await this.prisma.brandUser.update({
                where: { id: userPermission.id, brandId: user.brandUser.brandId },
                data: {
                  permission: { set: [...userPermission.permission,{ id: permissionId }]},
                },
                select: {
                    user: {
                        select: {
                            discordId: true,
                        }
                    }
                }
              })
              this.logger.save({
                brandId: user.brandUser.brandId,
                title: `Przypisanie Permisji do użytkownika`,
                description: `Uzytkownik ${user?.discordUsername? user.discordUsername:"undefined"} o id: ${user?.id? user.id:"undefined"} przypisał permisje o id: ${permissionId} do użytkownika ${userPermission.user.discordUsername} o id: ${targetId}`
            })
            const returnValue = {
                userId: targetId,
                userDiscordId: relation.user.discordId,
                permissionId: permissionId
            }
              return returnValue;
        }catch(e){
            if(e.code === 'P2025') throw new ForbiddenException(`Nie znaleziono permisji o id: ${permissionId}`)
            throw new ForbiddenException(`Błąd jest nieznany i należy zgłosić go do administratora: ${e.code}`)
        }
    }

    /**
     *  A dismissPermissionFromUser function
     *  Function dissmisses permission from user 
     *  @param {number} targetId - Id of target user
     *  @param {number} permissionId - Id of permission to dismiss
     *  @param {UserEntity} user - Object of sender user
     */
    async dismissPermissionFromUser(targetId: number, permissionId: number, user: UserEntity){
        var userPermissions = await this.prisma.brandUser.findFirst({
            where: { 
                brandId: user.brandUser.brandId,
                user:{
                    id: targetId
                },
             },
            select: {
                id: true,
                user: {
                    select: {
                        discordUsername: true,
                    }
                },
                permission: {
                    select: {
                        id: true
                    }
                }
            }
            })

        if(userPermissions === null)  throw new ForbiddenException(`Nie ma użytkownika z id: ${targetId}`)


        let ignoreList = [
            permissionId,
        ]
        for (var i = 0; i < userPermissions.permission.length; i++) {
            var obj = userPermissions.permission[i];
        
            if (ignoreList.indexOf(obj.id) !== -1) {
                userPermissions.permission.splice(i, 1);
            }
        }

        try{
            const relation = await this.prisma.brandUser.update({
                where: { id: userPermissions.id, brandId: user.brandUser.brandId },
                data: {
                  permission: { set: [...userPermissions.permission]},
                },
              })
              this.logger.save({
                brandId: user.brandUser.brandId,
                title: `Odebranie permisji od użytkownika`,
                description: `Uzytkownik ${user?.discordUsername? user.discordUsername:"undefined"} o id: ${user?.id? user.id:"undefined"} odebrał permisje o id: ${permissionId} użytkownikowi ${userPermissions.user.discordUsername} o id: ${targetId}`
            })
            const returnValue = {
                userId: targetId,
                userDiscordId: user.discordId,
                permissionId: permissionId
            }
              return returnValue;
        }catch(e){
            if(e.code === 'P2025') throw new ForbiddenException(`Nie znaleziono permisji o id: ${permissionId}`)
            throw new ForbiddenException(`Błąd jest nieznany i należy zgłosić go do administratora ${e.code}`)
        }
    }

    /**
     *  A getPublicAdminInfo function
     *  Function is made for public use, it returns list of admins from brand
     *  @param {number} brandId - Id of brand 
     */
    async getPublicAdminInfo(brandId: number) {
        const admins = await this.prisma.brandUser.findMany({
            where: {
                isAdmin: true,
                user: {
                    isActive: true
                },
                brandId
            },
            select: {
                user:{
                    select:{
                        steamId: true,
                        discordId: true,
                        discordUsername: true,
                        discordAvatarUrl: true,
                        discordDiscriminator: true,
                    }
                },
                role: {
                    select: {
                        discordRoleId: true,
                        name: true,
                        group: true,
                        color: true,
                    },
                    orderBy: {
                        power: 'asc',
                    },
                    take: 1,
                }
            },
        })

        return admins;
    }
    

    async checkRole(targetId: number, user: UserEntity): Promise<Boolean> {
        const userRolePower = user.brandUser.role[0].power
    
        const targetRole = await this.prisma.brandUser.findFirst({
            where: {
                user:{
                    id: targetId
                },
                brandId: user.brandUser.brandId
            },
            select:{
                role: {
                    select: {
                        discordRoleId: true,
                        name: true,
                        group: true,
                        color: true,
                        power: true
                    },
                    orderBy: {
                        power: 'asc',
                    },
                    take: 1,
                  },
            }
        })
        if(targetRole == null) return false
        if(userRolePower == targetRole.role[0].power)
            return false  
        else if(userRolePower < targetRole.role[0].power)
            return true  
        else
            return false 
    }
}



