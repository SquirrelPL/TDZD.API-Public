import { ForbiddenException, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { MyLogger } from 'src/auth/logger/logger.middleware';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAdminTimeTableDto, EditAdminTimeTableDto } from './dto';
import { UserEntity } from 'src/auth/dto/user.dto'
//
@Injectable()
export class AdminTimeTableService {
    logger: MyLogger;
    constructor(private prisma: PrismaService){
        this.logger = new MyLogger(prisma);
    }

    async getAdminTimeTableByRoleId(roleId: number, user: UserEntity){
        try{
            const adminTimeTable = await this.prisma.adminTimeTable.findMany({
                where: {
                    roleId,
                    brandId: user.brandUser.brandId
                }
            })
            return adminTimeTable;
        }catch(e){
            if(e.code === 'P2025') throw new ForbiddenException(`Nie znaleziono tabeli czasu administracji do której jest przypisana rola o id: ${roleId}`)
            else throw new ForbiddenException(`Kod błędu ${e.code}`)
        }
    }

    async getAdminTimeTableById(id: number, user: UserEntity){
        try{
            const adminTimeTable = await this.prisma.adminTimeTable.findUnique({
                where:{
                    id,
                    brandId: user.brandUser.brandId
                }
            })
            return adminTimeTable;
        }catch(e){
            if(e.code === 'P2025') throw new ForbiddenException(`Nie znaleziono tabeli czasu administracji o id: ${id}`)
            else throw new ForbiddenException(`Kod błędu ${e.code}`)
        }
    }

    async getAdminTimeTable(user: UserEntity){
        return this.prisma.adminTimeTable.findMany({where: {
            brandId: user.brandUser.brandId
        }})
    }

    async editAdminTimeTableById(id: number, dto: EditAdminTimeTableDto, user: UserEntity){
        try{
            const adminTimeTable = await this.prisma.adminTimeTable.update({
                where:{
                    id,
                    brandId: user.brandUser.brandId
                },
                data: {
                    ...dto
                }
            })
            this.logger.save({
                brandId: user.brandUser.brandId,
                title: `Edycja tabeli czasu administracji`,
                description: `Użytkownik ${user.discordUsername} o id: ${user.id} zedytował tabele czasu administracji ${adminTimeTable.id}, ustawił czas minimalny na ${adminTimeTable.minimumTime}`
            })
            return adminTimeTable;
        }catch(e){
            if(e.code === 'P2025') throw new ForbiddenException(`Nie znaleziono tabeli czasu administracji o id: ${id}`)
            else throw new ForbiddenException(`Kod błędu ${e.code}`)
        }
    }

    async createAdminTimeTable(dto: CreateAdminTimeTableDto, user: UserEntity){
        try{
            const adminTimeTable = await this.prisma.adminTimeTable.create({
                data: {
                    brandId: user.brandUser.brandId,
                    ...dto
                }
            })
            this.logger.save({
                brandId: user.brandUser.brandId,
                title: `Stworzenie tabeli czasu administracji`,
                description: `Użytkownik ${user.discordUsername} o id: ${user.id} stworzył tabele czasu administracji ${adminTimeTable.id}, ustawił czas minimalny na ${adminTimeTable.minimumTime}`
            })
            return adminTimeTable;
        }catch(e){
            if(e.code == 'P2003') throw new ForbiddenException(`Nie znaleziono podanego servera lub roli`)
            throw new ForbiddenException(`Kod błędu ${e.code}`)
        }
    }

    async deleteAdminTimeTable(id: number, user: UserEntity){
        try{
            const adminTimeTable = await this.prisma.adminTimeTable.delete({
                where: {
                    id,
                    brandId: user.brandUser.brandId
                }
            })
            this.logger.save({
                brandId: user.brandUser.brandId,
                title: `Stworzenie tabeli czasu administracji`,
                description: `Użytkownik ${user.discordUsername} o id: ${user.id} usuną tabele czasu administracji ${adminTimeTable.id}`
            })
            return adminTimeTable;
        }catch(e){
            if(e.code === 'P2025') throw new ForbiddenException(`Nie znaleziono tabeli czasu administracji o id: ${id}`)
            else throw new ForbiddenException(`Kod błędu ${e.code}`)
        }
    }
}