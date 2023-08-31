import { ForbiddenException, Injectable } from '@nestjs/common';
import { UserEntity } from 'src/auth/dto/user.dto';
import { MyLogger } from 'src/auth/logger/logger.middleware';
import { PrismaService } from 'src/prisma/prisma.service';
import { WarnDto } from './dto';

@Injectable()
export class WarnService {
    logger: MyLogger;
    constructor(private prisma: PrismaService){
        this.logger = new MyLogger(prisma)
    }
//
    async getAdminWarns(user: UserEntity) {
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
                warn: {
                    where:{
                        expirationDate:{
                            gte:  new Date().toISOString()
                        }
                    }
                }
            }
        })
        let adminsList = []
        admins.forEach(element => {
            adminsList.push({
                id: element.id,
                discordId: element.user.discordId,
                discordUsername: element.user.discordUsername,
                warns: element.warn.length
            })
        });
        return adminsList
    }

    async getMyWarns(user: UserEntity) {
        const warn = this.prisma.warn.findMany({
            where: {
                brandUser:{
                    id: user.brandUser.id,
                    isAdmin: true
                },
                brandId: user.brandUser.brandId,
                expirationDate: {
                    gte:  new Date().toISOString()
                  },
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
                expirationDate: true,
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
        return warn
    }

    async getUserWarnsById(id: number, user: UserEntity) {
        const warn = this.prisma.warn.findMany({
            where: {
                brandUser:{
                    user:{
                        id
                    }
                },
                brandId: user.brandUser.brandId,
                expirationDate: {
                    gte:  new Date().toISOString()
                  },
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
                expirationDate: true,
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
        return warn
    }

    async getUserWarnsByDiscordId(id: string, user: UserEntity) {
        const warn = this.prisma.warn.findMany({
            where: {
                brandUser:{
                    user:{
                        discordId: id
                    }
                },
                brandId: user.brandUser.brandId,
                expirationDate: {
                    gte:  new Date().toISOString()
                  },
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
                expirationDate: true,
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
        return warn
    }

    

    async warnUserById(id: number, user: UserEntity, dto: WarnDto) {
        if(new Date(dto.expirationDate) <= new Date()) {return new ForbiddenException("Data wygaśnięcia nie może być równa lub mniejsza niż aktualna data").getResponse()}
        const targetUser = await this.prisma.brandUser.findFirst({
            where: {
                userId: id,
                brandId: user.brandUser.brandId
            }
        })
        if(!targetUser) return new ForbiddenException(`Nie ma użytkownika o id: ${id}`).getResponse()

        if(!(await this.checkRoleById(id, user))) {return new ForbiddenException("Nie możesz nadać ostrzeżenia osobie o tej samej lub wyższej sile rangi").getResponse()}


        try{
            const warn = await this.prisma.warn.create({
                data:{
                    authorId: user.brandUser.id,
                    brandUserId: targetUser.id,
                    reason: dto.reason,
                    brandId: user.brandUser.brandId,
                    expirationDate: new Date(dto.expirationDate).toISOString(),
                    
                }
            })
            return warn
        }catch(e){
            return new ForbiddenException(`Nieznany błąd: ${e.code}`)
        }
 
    }

    async warnUserByDiscordId(discordId: string, user: UserEntity, dto: WarnDto) {
        if(new Date(dto.expirationDate) <= new Date()) {return new ForbiddenException("Data wygaśnięcia nie może być równa lub mniejsza niż aktualna data").getResponse()}

        const targetUser = await this.prisma.brandUser.findFirst({
            where: {
                user:{
                    discordId
                },
                brandId: user.brandUser.brandId
            }
        })
        if(!targetUser) return new ForbiddenException(`Nie ma użytkownika o discord id: ${discordId}`).getResponse()

        if(!(await this.checkRoleByDiscordId(discordId, user))) {return new ForbiddenException("Nie możesz nadać ostrzeżenia osobie o tej samej lub wyższej sile rangi").getResponse()}


        try{
            const warn = await this.prisma.warn.create({
                data:{
                    authorId: user.brandUser.id,
                    brandUserId: targetUser.id,
                    reason: dto.reason,
                    brandId: user.brandUser.brandId,
                    expirationDate: new Date(dto.expirationDate).toISOString(),
                    
                }
            })
            return warn
        }catch(e){
            return new ForbiddenException(`Nieznany błąd: ${e.code}`)
        }
 
    }

    async warnDelete(id: number, user: UserEntity) {
        try{
            const warn = await this.prisma.warn.delete({
                where:{
                    id,
                    brandId: user.brandUser.brandId
                }
            })
            return warn
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
