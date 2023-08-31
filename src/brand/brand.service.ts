import { ForbiddenException, Injectable } from '@nestjs/common';
import { UserEntity } from 'src/auth/dto/user.dto';
import { MyLogger } from 'src/auth/logger/logger.middleware';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBrandDto } from './dto';
import { HttpService } from '@nestjs/axios';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { Observable, lastValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
//
@Injectable()
export class BrandService {
    logger: MyLogger;
    constructor(private prisma: PrismaService, private httpService: HttpService, private config: ConfigService){
        this.logger = new MyLogger(prisma);
    }


    async deleteBrand(user: UserEntity, id: number) {
        if(id==1) return new ForbiddenException("Wypierdalaj nie można usunąć złej dzielnicy ୧༼ ಠ益ಠ ༽୨").getResponse();
        const brand = await this.prisma.brand.delete({
            where: {
                id
            }
        })
        return brand
    }

    async createBrand(user: UserEntity, dto: CreateBrandDto) {
        const brand = await this.prisma.brand.create({
            data: {
                ...dto
            }
        })

        return brand
    }

    async assignOwner(user: UserEntity, userId: number, serverId: number) {
        try{
            const brand = await this.prisma.brand.update({
                where: {
                    id: serverId
                },
                data: {
                    owner: {connect: {id: userId}}
                }
            })
            if(!brand) return new ForbiddenException("Nie ma takiej działalności").getResponse();
            return brand
        }catch(e){
            if(e.code == "P2025") throw new ForbiddenException(`Nie istnieje uzytkownik o Id: ${userId}`)
            else if(e.code == "P2016") throw new ForbiddenException(`Nie ma działalności o Id: ${serverId}`)
        }



    }

    async unassignOwner(user: UserEntity, userId: number, serverId: number) {
        try{
            const brand = await this.prisma.brand.update({
                where: {
                    id: serverId
                },
                data: {
                    owner: {disconnect: {id: userId}}
                }
            })
            if(!brand) return new ForbiddenException("Nie ma takiej działalności").getResponse();
            return brand
        }catch(e){
            if(e.code == "P2025") throw new ForbiddenException(`Nie ma takiej działalności o Id: ${serverId}`)
        }

    }

    async updateBrand(user: UserEntity, dto: CreateBrandDto, id: number) {
        const brand = await this.prisma.brand.update({
            where: {
                id
            },
            data: {
                ...dto
            }
        })
        if(!brand) return new ForbiddenException("Nie ma takiej działalności").getResponse();
        return brand
    }

    async getBrandPublic( id: number) {
        const brand = await this.prisma.brand.findUnique({
            where: {
                id
            },
            select: {
                name: true,
                discordGuildId: true,
                discordCode: true,
                primaryColor: true,
                secondaryColor: true,
                tertiaryColor: true
            },
        })
        
        const discord = await this.getDiscord(brand)
        let link = ""
        if(discord != null) {
            link = `https://cdn.discordapp.com/icons/${brand.discordGuildId}/${discord.icon}?size=`
        }else{
            link = "unknown"
        }

        const theme = {
            name: brand.name,
            guildIconUrl: link,
            primaryColor: brand.primaryColor,
            secondaryColor: brand.secondaryColor,
            tertiaryColor: brand.tertiaryColor
        }
        if(!brand) return new ForbiddenException("Nie ma takiej działalności").getResponse();
        return theme
    }

    async getBrands(user: UserEntity) {
        const brands = await this.prisma.brand.findMany({
            select: {
                owner: {
                    select: {
                        id: true,
                        discordId: true,
                        discordUsername: true
                    }
                },
                id: true,
                name: true,
                discordGuildId: true,
                discordCode: true,
                primaryColor: true,
                secondaryColor: true,
                tertiaryColor: true
            },
            
        })
        return brands;
    }

    async getPublicBrands() {
        const brands = await this.prisma.brand.findMany({
            select: {
                id: true,
                discordGuildId: true,
                name: true,
                primaryColor: true,
            },
            
        })
        let brandsList = []
        for await(const element of brands){
            const discord = await this.getDiscord(element)
            let link = ''
            if(discord != null) {
                link = `https://cdn.discordapp.com/icons/${element.discordGuildId}/${discord.icon}?size=`
            }else{
                link = "unknown"
            }
            brandsList.push({
                id: element.id,
                guildIconUrl: link,
                name: element.name,
                primaryColor: element.primaryColor,
            })
        }
    
        return brandsList;
    }

    

    async getDiscord(brand): Promise<any>{
        const axiosConfig: AxiosRequestConfig = {
            method: 'get',
            url: `https://discord.com/api/v10/guilds/${brand.discordGuildId}`,
            headers: {
              'Authorization': `Bot ${this.config.get('DISCORD_TOKEN')}`,
            }
        }
        try{
            return ((await lastValueFrom(this.httpService.request(axiosConfig)))).data
        }catch(e){
            return null
        }


    }
}
