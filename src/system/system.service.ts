import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon from 'argon2'

@Injectable()
export class SystemService {
    constructor(private prisma: PrismaService){}

    async startup(){
        const user = await this.prisma.user.findUnique({
            where: {
                id: 1
            },
        })

        if(user) throw new ForbiddenException("Startup has been already executed!");
//
        var listofPerm = [
            "Squirrels.SuperPermission",
            "user.seeMySelf", "admin.getAllAdmins", "user.getAllUsers", "user.getUserById", "user.getUserByIdUsingBrandTree", "user.dezactivateUser", "user.activateUser", "user.editUser", "user.deleteUser", "user.deleteBrandUser", "user.server.getAssignedServers", "user.server.assignServerToUser", "user.server.dismissServerFromUser", 
            "server.statistic.addStatistic","server.deleteServer","server.editServer","server.createServer","server.getServerById","server.getServers",
            "role.deleteRole","role.editRole","role.dismissMultiplePermissionToRole","role.dismissPermissionFromRole","role.assignMultiplePermissionToRole","role.assignPermissionToRole","role.createRole","role.getUserAssigned","role.getRoles",
            "permission.getRolesAssignedToPermission","permission.getUserAssignedToPermission","permission.getPermissions","permission.getPermissionById","permission.getPermissionBySku",
            "log.getLogs","log.getLogById","log.getLogByDate","log.getMultipleLogsByIdSpan","log.postLog",
            "announcment.getAll","announcment.ById","announcment.createAnnouncment","announcment.editAnnouncment","announcment.deleteAnnouncment",
            "adminTimeTable.getAdminTimeTableByRoleId","adminTimeTable.getAdminTimeTableById","adminTimeTable.getPermissions","adminTimeTable.editAdminTimeTableById","adminTimeTable.createAdminTimeTable","adminTimeTable.deleteAdminTimeTable",
            "role.getMyRoles","user.role.getAssignedRoles","user.permission.getAssignedPermissions","user.role.assignRoleToUser","user.role.dismissRoleFromUser","user.permission.assignPermissionToUser","user.permission.dismissPermissionFromUser",
            "temprole.getTempRoles","temprole.getMyTempRoles","temprole.deleteTempRole","temprole.assignTempRole","temprole.getMyTempRoles","temprole.getTempRoleById","temprole.getTempRoleByUserId","temprole.deleteTempRole",
            "brand.seeBrands","brand.updateBrand",
            "warn.getAdminWarns","warn.myWarns","warns.getUserWarns","warns.warnUser","warns.deleteWarn",
            "strike.getAdminStrikes","strike.myStrikes","strikes.getUserStrikes","strikes.strikeUser","strikes.deleteStrike",
            "vacation.getAdminVacations","vacation.myVacations","vacations.getUserVacations","vacations.vacationUser","vacations.deleteVacation",
            "steamBlock.playearJoinedEvent","steamBlock.getAllSteamBlocks","steamBlock.updateHours"
        ]
        var listofStandardPerm = [
            "user.seeMySelf"
        ]

        const permissions = await this.prisma.permission.createMany({
            data: [
                ...listofPerm.map(x => {return {sku: x}})
            ],
        })
        
        const brand = await this.prisma.brand.create({
            data: {
                name: "Trafiłeś do Złej Dzielnicy",
                discordGuildId: "407996605220782121",
                discordCode: "KMbpT4Pf",
                primaryColor: "#47b2f5",
                secondaryColor: "#0078bf",
                tertiaryColor: "#072c42"
            }
        })

        const standardRole = await this.prisma.role.create({
            data: {
                discordRoleId: "0",
                name: "User",
                power: 9999,
                group: "user",
                color: "#fff",
                brand: {connect: {id: 1}},
            },
        })

        const role = await this.prisma.role.create({
            data: {
                discordRoleId: "422396250848231434",
                name: "Pan Prezes",
                power: 0,
                group: "BigO",
                color: "#4dffb8",
                brand: {connect: {id: 1}},
            },
        })



        let listOfPermissionIds = Array.from({length:(listofPerm.length-2+1)},(v,k)=>k+2)
        const relation = await this.prisma.role.update({
            where: { id: role.id },
            data: {
              permissions: { set: [...listOfPermissionIds.map(x => {return {id: x}})]},
            },
          })

          let listOfPermissionIds2 = Array.from({length:(listofStandardPerm.length-2+1)},(v,k)=>k+2)
          const relation1 = await this.prisma.role.update({
              where: { id: standardRole.id },
              data: {
                permissions: { set: [...listOfPermissionIds2.map(x => {return {id: x}})]},
              },
            })


            const hash = await argon.hash("Lor142"); //to nie jest moje aktualne hasło :P

            var userR = await this.prisma.user.create({
                data: {
                    email: "dutka.krzychu@gmail.com",
                    hash,
                    discordId: "345927009886535681",
                    steamId: "76561198206584156",
                    isActive: true
                },
            });
            delete userR.hash;

            const branUser = await this.prisma.brandUser.create({
                data: {
                    user: {connect: {id: userR.id}},
                    brand: {connect: {id: 1}},
                    isAdmin: true,
                }
            })

            const userVallet = await this.prisma.economy.create({
                data: {
                    brandUser: {
                        connect: {
                            id: branUser.id
                        }
                    }
                }
            })

            const relation2 = await this.prisma.brandUser.update({
                where: { id: userR.id },
                data: {
                  permission: { set: [{sku: listofPerm[0]}]},
                },
            })

            const relation3 = await this.prisma.brandUser.update({
                where: { id: userR.id },
                data: {
                  role: { set: [{id: role.id}, {id: standardRole.id}]},
                },
            })

            return {message: "Startup script has been successful!"}

    }
}
