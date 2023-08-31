import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { MyLogger } from 'src/auth/logger/logger.middleware';
import { PrismaService } from 'src/prisma/prisma.service';
import { Observable, lastValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosRequestConfig } from 'axios';

@Injectable()
export class SchedulesService {
    logger: MyLogger;
    constructor(private prisma: PrismaService, private httpService: HttpService, private config: ConfigService){
        this.logger = new MyLogger(prisma)
    }

//
  async upadateProfPicsOfEveryAdmin() {
    let idList = []
    const brandUser = await this.prisma.brandUser.findMany({
        where:{
            isAdmin: true,
            user:{
                isActive: true
            }
        },
        select:{
            user:{
                select:{
                    id: true,
                    discordId: true
                }
            }
        }
    })
    brandUser.forEach(element => {
        if(element.user.discordId != null){
            idList.push({
                id: element.user.id,
                discordId: element.user.discordId
            })
        }
    });
    
    for await (const ids of idList){
        const userCredentials = await this.fetchDiscordCredentials(ids.discordId)

        const user = await this.prisma.user.update({
            where:{
                id: ids.id
            },
            data:{
                discordUsername: userCredentials.username,
                discordDiscriminator: userCredentials.discriminator,
                discordAvatarUrl: `https://cdn.discordapp.com/avatars/${ids.discordId}/${userCredentials.avatar}?size=`
            }
        })
    }

  }


  async fetchDiscordCredentials(discordId): Promise<any>{

      const axiosConfig: AxiosRequestConfig = {
        method: 'get',
        url: `https://discord.com/api/v9/users/${discordId}`,
        headers: {
          'Authorization': `Bot ${this.config.get('DISCORD_TOKEN')}`,
        }
    }
    return ((await lastValueFrom(this.httpService.request(axiosConfig)))).data
    }
}
