import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon from 'argon2'
import { Role, User } from '@prisma/client';
import { AssignTempRoleDTO } from './dto';
import { MyLogger } from 'src/auth/logger/logger.middleware';
import { UserEntity } from 'src/auth/dto/user.dto';

@Injectable()
export class TempRoleService {
    logger: MyLogger;
    constructor(private prisma: PrismaService){
        this.logger = new MyLogger(prisma)
    }
//
    async getTempRoles(expired: boolean, user: UserEntity) {
        const role = await this.prisma.tempRole.findMany({
            where: {
                brandId: user.brandUser.brandId,
                expirationDate: !expired ? {
                    gte: new Date().toISOString(),
                } : {
                    lt: new Date().toISOString(),
                },
            }
        })
        return role;
    }

    async getTempRoleById(id: number, user: UserEntity){
        return await this.prisma.tempRole.findUnique({
            where: {
                id,
                brandId: user.brandUser.brandId,
            }})
    }

    async getMyTempRoles(user: UserEntity, expired: boolean){
        const role = await this.prisma.tempRole.findMany({
            where:{
                brandUserId: user.brandUser.id,
                brandId: user.brandUser.brandId,
                expirationDate: !expired ? {
                    gte: new Date().toISOString(),
                } : {
                    lt: new Date().toISOString(),
                },
            }
        })
        return role;
    }

    async getTempRoleByUserId(id: number, expired: boolean, user: UserEntity){
        const role = await this.prisma.tempRole.findMany({
            where: {
                brandUserId: id,
                brandId: user.brandUser.brandId,
                expirationDate: !expired ? {
                    gte: new Date().toISOString(),
                } : {
                    lt: new Date().toISOString(),
                },
        }})
        return role;
    }

    async assignTempRole(user: UserEntity, dto: AssignTempRoleDTO){
        try{
            const now = new Date;
            if(new Date(dto.expirationDate) <=  now ) {
                return new ForbiddenException("Data nie może być mniejsza lub taka sama co aktualna!").getResponse()
            }
  
            const tempRole = await this.prisma.tempRole.create({
                data: {
                    ...dto,
                    brandId: user.brandUser.brandId,
                    expirationDate: new Date(dto.expirationDate).toISOString()
                }
            })
            this.logger.save({
                brandId: user.brandUser.brandId,
                title: `Nadanie tymczasowej roli`,
                description: `Użytkownik ${user.discordUsername} o id: ${user.id} nadał TYMCZASOWĄ rolę [${dto.roleId}] użytkownikowi ${dto.brandUserId} do dnia ${dto.expirationDate}`
            })
            const newTempRole = {
                ...tempRole,
                expirationTime: new Date(dto.expirationDate).getDay() - now.getDay()
            }
            return newTempRole;
        }
        catch(e){
            if(e.code === "P2003") {throw new ForbiddenException("NIE istnieje taki użytkownik lub rola")}
        }
    }

    async deleteTempRole(user: UserEntity, id: number){
        try{
            const tempRole = await this.prisma.tempRole.delete({
                where: {
                    id,
                    brandId: user.brandUser.brandId
                }
            })
            this.logger.save({
                brandId: user.brandUser.brandId,
                title: `Pozbycie się tymczasowej roli`,
                description: `Użytkownik ${user.discordUsername} o id: ${user.id} usuną tymczasową rolę [${id}]`
            })
            return tempRole
        }catch(e){
            if(e.code === "P2025") {throw new ForbiddenException(`Nie istnieje taka rola o id: ${id}`)}
        }

    }
    
}
