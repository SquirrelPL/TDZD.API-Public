import { ForbiddenException, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { parse } from 'path';
import { MyLogger } from 'src/auth/logger/logger.middleware';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAnnouncmentDto, EditAnnouncmentDto } from './dto';
import { UserEntity } from 'src/auth/dto/user.dto'

//
@Injectable()
export class AnnouncmentService {
    logger: MyLogger;
    constructor(private prisma: PrismaService){
        this.logger = new MyLogger(prisma)
    }

    async getAnnouncment(user: UserEntity){
        return this.prisma.publicAnnouncments.findMany({
            where: {
                brandId: user.brandUser.brandId
            }
        })
    }

    async getAnnouncmentById(id: number, user: UserEntity){
        try{
            const publicAnnouncments = await this.prisma.publicAnnouncments.findUnique({
                where:{
                    id,
                    brandId: user.brandUser.brandId,
                }
            })
            return publicAnnouncments
        }catch(e){
            if(e.code === 'P2025') throw new ForbiddenException(`Nie znaleziono ogłoszenia o id: ${id}`)
            throw new ForbiddenException(`Błąd jest nieznany i należy zgłosić go do administratora`)
        }
    }

    async getAnnouncmentLatests(id: number){
        const publicAnnouncments = await this.prisma.publicAnnouncments.findMany({
            where: {
                brandId: id
            },
            orderBy: { id: 'desc' },
            take: 4
        })
        return publicAnnouncments
    }

    async createAnnouncment(dto: CreateAnnouncmentDto, user: UserEntity){
        try{
            const publicAnnouncments = await this.prisma.publicAnnouncments.create({
                data:{
                    ...dto,
                    brandId: user.brandUser.brandId
                }
            })
            this.logger.save({
                brandId: user.brandUser.brandId,
                title: `Stworzenie ogłoszenia`,
                description: `Użytkownik ${user.discordUsername} o id: ${user.id} wstawił ogłoszenie o tytule ${publicAnnouncments.Title} i id: ${publicAnnouncments.id}`
            })
            return publicAnnouncments
        }catch(e){
            if(e.code === 'P2002') throw new ForbiddenException('Już istnieje takie ogłoszenie');
            throw new ForbiddenException(`Błąd jest nieznany i należy zgłosić go do administratora`)
        }
    }

    async editAnnouncment(id: number, dto: EditAnnouncmentDto, user: UserEntity){
        try{
            const publicAnnouncments = await this.prisma.publicAnnouncments.update({
                where:{
                    id,
                    brandId: user.brandUser.brandId,
                },
                data:{
                    ...dto
                }
            })
            this.logger.save({
                brandId: user.brandUser.brandId,
                title: `Edycja ogłoszenia`,
                description: `Użytkownik ${user.discordUsername} o id: ${user.id} stwierdził że będzie chujem i zedytował ogłoszenie o tytule ${publicAnnouncments.Title} i id: ${publicAnnouncments.id}`
            })
            return publicAnnouncments
        }catch(e){
            if(e.code === 'P2025') throw new ForbiddenException(`Nie znaleziono ogłoszenia o id: ${id}`)
            throw new ForbiddenException(`Błąd jest nieznany i należy zgłosić go do administratora`)
        }
    }

    async deleteAnnouncment(id: number, user: UserEntity){
        try{
            const publicAnnouncments = await this.prisma.publicAnnouncments.delete({
                where:{
                    id,
                    brandId: user.brandUser.brandId,
                }
            })
            this.logger.save({
                brandId: user.brandUser.brandId,
                title: `Usunięcie ogłoszenia`,
                description: `Użytkownik ${user.discordUsername} o id: ${user.id} usuną ogłoszenie o tytule ${publicAnnouncments.Title} i id: ${publicAnnouncments.id}`
            })
            return publicAnnouncments
        }catch(e){
            if(e.code === 'P2025') throw new ForbiddenException(`Nie znaleziono ogłoszenia o id: ${id}`)
            throw new ForbiddenException(`Błąd jest nieznany i należy zgłosić go do administratora`)
        }
    }
}