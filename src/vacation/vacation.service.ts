import { ForbiddenException, Injectable } from '@nestjs/common';
import { UserEntity } from 'src/auth/dto/user.dto';
import { MyLogger } from 'src/auth/logger/logger.middleware';
import { PrismaService } from 'src/prisma/prisma.service';
import { VacationDto } from './dto';

@Injectable()
export class VacationService {
    logger: MyLogger;
    constructor(private prisma: PrismaService){
        this.logger = new MyLogger(prisma)
    }
//
    async getAdminVacations(user: UserEntity) {
        const admins = await this.prisma.brandUser.findMany({
            where: {
                isAdmin: true,
                brandId: user.brandUser.brandId
            },
            select: {
                id: true,
                user:{
                    select:{
                        discordId: true,
                        discordUsername: true
                    }
                },
                vacation: {
                    where:{
                        endOfVacation:{
                            gte:  new Date().toISOString()
                        },
                        startOfVacation:{
                            lt:  new Date().toISOString()
                        }
                    }
                }
            }
        })
        let adminsList = []
        admins.forEach(element => {
            if(element.vacation.length > 0){
                adminsList.push({
                    id: element.id,
                    discordId: element.user.discordId,
                    discordUsername: element.user.discordUsername,
                    vacations: true
                })
            }
        });
        return adminsList
    }

    async getMyVacations(user: UserEntity) {
        const vacation = this.prisma.vacation.findMany({
            where: {
                brandUser:{
                    id: user.brandUser.id,
                    isAdmin: true
                },
                brandId: user.brandUser.brandId,
                endOfVacation: {
                    gte:  new Date().toISOString()
                },
                startOfVacation: {
                    lt: new Date().toISOString(), 
                }
            },
            select:{
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
                brandUser: {
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
                }
            }
        })
        return vacation
    }

    async getUserVacationsById(id: number, user: UserEntity) {
        const vacation = this.prisma.vacation.findMany({
            where: {
                brandUser:{
                    id
                },
                brandId: user.brandUser.brandId,
                endOfVacation: {
                    gte:  new Date().toISOString()
                },
                  startOfVacation: {
                    lt: new Date().toISOString(),
                }
            },
            select:{
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
                brandUser: {
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
                }
            }
        })
        return vacation
    }

    async getUserVacationsByDiscordId(id: string, user: UserEntity) {
        const vacation = this.prisma.vacation.findMany({
            where: {
                brandUser:{
                    user:{
                        discordId: id
                    }
                },
                brandId: user.brandUser.brandId,
                endOfVacation: {
                    gte:  new Date().toISOString()
                },
                startOfVacation: {
                    lt: new Date().toISOString(),
                }
            },
            select:{
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
                brandUser: {
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
                }
            }
        })
        return vacation
    }

    

    async vacationUserById(id: number, user: UserEntity, dto: VacationDto) {
        if(new Date(dto.endOfVacation) <= new Date(dto.startOfVacation)) {return new ForbiddenException("Data wygaśnięcia nie może być równa lub mniejsza niż data rozpoczęcia! [wtf man]").getResponse()}

        if(new Date(dto.endOfVacation) <= new Date()) {return new ForbiddenException("Data wygaśnięcia nie może być równa lub mniejsza niż aktualna data").getResponse()}

        const targetUser = await this.prisma.brandUser.findFirst({
            where: {
                user:{
                    id,
                },
                brandId: user.brandUser.brandId
            }
        })
        if(!targetUser) return new ForbiddenException(`Nie ma użytkownika o id: ${id}`).getResponse()

        if(!(await this.checkRoleById(id, user))) {return new ForbiddenException("Nie możesz wysłać osoby na wakacje o tej samej lub wyższej sile rangi").getResponse()}


        try{
            const vacation = await this.prisma.vacation.create({
                data:{
                    authorId: user.brandUser.id,
                    brandUserId: targetUser.id,
                    reason: dto.reason,
                    brandId: user.brandUser.brandId,
                    startOfVacation: new Date(dto.startOfVacation).toISOString(),
                    endOfVacation: new Date(dto.endOfVacation).toISOString(),
                }
            })
            return vacation
        }catch(e){
            return new ForbiddenException(`Nieznany błąd: ${e.code}`)
        }
 
    }

    async vacationUserByDiscordId(discordId: string, user: UserEntity, dto: VacationDto) {
        if(new Date(dto.endOfVacation) <= new Date(dto.startOfVacation)) {return new ForbiddenException("Data wygaśnięcia nie może być równa lub mniejsza niż data rozpoczęcia! [wtf man]").getResponse()}

        if(new Date(dto.endOfVacation) <= new Date()) {return new ForbiddenException("Data wygaśnięcia nie może być równa lub mniejsza niż aktualna data").getResponse()}

        const targetUser = await this.prisma.brandUser.findFirst({
            where: {
                user:{
                    discordId
                },
                brandId: user.brandUser.brandId
            }
        })
        if(!targetUser) return new ForbiddenException(`Nie ma użytkownika o discord id: ${discordId}`).getResponse()

        if(!(await this.checkRoleByDiscordId(discordId, user))) {return new ForbiddenException("Nie możesz wysłać osoby na wakacje o tej samej lub wyższej sile rangi").getResponse()}


        try{
            const vacation = await this.prisma.vacation.create({
                data:{
                    authorId: user.brandUser.id,
                    brandUserId: targetUser.id,
                    reason: dto.reason,
                    brandId: user.brandUser.brandId,
                    startOfVacation: new Date(dto.startOfVacation).toISOString(),
                    endOfVacation: new Date(dto.endOfVacation).toISOString(),
                }
            })
            return vacation
        }catch(e){
            return new ForbiddenException(`Nieznany błąd: ${e.code}`)
        }
 
    }

    async vacationDelete(id: number, user: UserEntity) {
        try{
            const vacation = await this.prisma.vacation.delete({
                where:{
                    id,
                    brandId: user.brandUser.brandId
                }
            })
            return vacation
        }catch(e){
            if(e.code == "P2025") throw new ForbiddenException(`Nie ma ostrzeżenia o Id: ${id}`)
            return new ForbiddenException(`Nieznany błąd: ${e.code}`).getResponse()
        }

    }



    async checkRoleById(targetId: number, user: UserEntity): Promise<Boolean> {
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

    async checkRoleByDiscordId(targetId: string, user: UserEntity): Promise<Boolean> {
        const userRolePower = user.brandUser.role[0].power
    
        const targetRole = await this.prisma.brandUser.findFirst({
            where: {
                user:{
                    discordId: targetId
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
