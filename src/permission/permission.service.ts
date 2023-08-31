import { ForbiddenException, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { MyLogger } from 'src/auth/logger/logger.middleware';
import { CreateLogDto } from 'src/log/dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePermissionDto } from './dto';
import { UserEntity } from 'src/auth/dto/user.dto';


@Injectable()
export class PermissionService {
    logger: MyLogger;
    constructor(private prisma: PrismaService){
        this.logger = new MyLogger(prisma);
    }
//
    
    async getPermissionBySku(sku: string, user: UserEntity){
        const permission = await this.prisma.permission.findFirst({
            where: {
                sku,
                brandView: {in: [0, user.brandUser.brandId]}
            }
        })
        return permission;
    }

    async getPermissionById(id: number, user: UserEntity){
        try{
            const permission = await this.prisma.permission.findUnique({
                where: {
                    id,
                    brandView: {in: [0, user.brandUser.brandId]}
                }
            })
            return permission;
        }catch(e){
            if(e.code === 'P2025') throw new ForbiddenException(`Nie znaleziono permisji o id: ${id}`)
            throw new ForbiddenException(`Błąd jest nieznany i należy zgłosić go do administratora`)
        }
    }


    async getPermission(){
        const permission = await this.prisma.permission.findMany()
        return permission;
    }

    async getPermissionByBrand(user: UserEntity){
        const permission = await this.prisma.permission.findMany({
            where: {
                brandView: {in: [0,user.brandUser.brandId]} 
            }
        })
        return permission;
    }

    
    async getUsersAssigned(id: number, user: UserEntity){
        try{
            const users = await this.prisma.permission.findUnique({
                where: {
                    id,
                    brandView: {in: [0, user.brandUser.brandId]}
                },
                select: {
                    brandUser: {
                        select:{
                            id: true,
                            user: {
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
            return users.brandUser;
        }catch(e){
            throw new ForbiddenException(`Kod błędu: ${e.code}`);
        }

    }

    async getRolesAssigned(id: number, user: UserEntity){
        try{
            const permission = await this.prisma.permission.findUnique({
                where: {
                    id,
                    brandView: {in: [0, user.brandUser.brandId]}
                },
                select: {
                    role: true
                }
            })
            return permission.role;
        }catch(e){
            throw new ForbiddenException(`Kod błędu: ${e.code}`);
        }

    }
    

    async createPermission(dto: CreatePermissionDto, user: UserEntity){
        try{
            const permission = await this.prisma.permission.create({
                data: {
                    ...dto,
                },
            })
        this.logger.save({
            brandId: user.brandUser.brandId,
            title: 'Stworzenie Permisji', 
            description: `Użytkownik ${user.discordUsername} z id: ${user.id} utworzył permisję: ${dto.sku} o id: ${permission.id}`
        })
        return {id: permission.id};
        
        }catch(e){
            if(e.code === 'P2002') throw new ForbiddenException('Już istnieje taka permisja');
        }
        throw new ForbiddenException('Błąd jest nieznany');
    }

    async deletePermission(id: number, user: UserEntity){
        try{
            const permission = await this.prisma.permission.delete({
                where: {
                    id,
                    brandView: user.brandUser.brandId
                },
            })
        this.logger.save({
            brandId: user.brandUser.brandId,
            title: 'Usuniecie Permisji', 
            description: `Użytkownik ${user.discordUsername} z id: ${user.id} usuną permisję: ${permission.sku} o id: ${permission.id}`
        }) 
        return permission;
        }catch(e){
            throw new ForbiddenException(`Kod błędu: ${e.code}`);
        }

    }
    
}
