import { ForbiddenException, Injectable } from '@nestjs/common';
import { UserEntity } from 'src/auth/dto/user.dto';
import { GetByDateDto, UserTimeTableDto } from './dto';
import { MyLogger } from 'src/auth/logger/logger.middleware';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserGameTimeService {
    logger: MyLogger;
    constructor(private prisma: PrismaService){
        this.logger = new MyLogger(prisma)
    }

    async getUserTimeById(user: UserEntity, id: number, serverId: number) {
        const user1 = await this.prisma.user.findUnique({
            where:{
                id
            },
            select:{
                timeTable:{
                    where:{
                        serverId,
                        server:{
                            brandId: user.brandUser.brandId
                        }
                    }
                }
                //brandUser:{
                //    where:{
                //        brandId: user.brandUser.brandId
                //    },
                //    select:{
                //        vacation:{
                //            where:{
                //                endOfVacation:{
                //                    gte:  new Date().toISOString()
                //                },
                //                startOfVacation:{
                //                    lt:  new Date().toISOString()
                //                }
                //            }
                //        }
                //    }
                //}
                //
            }
        })

        if(user1.timeTable.length == 0) return {"timeSpendMinutes": 0, "serverId": serverId}
        let minutesTotal = 0
        user1.timeTable.forEach(element => {
            minutesTotal += element.timeSpend
        });
        const timeTable = {
            "timeSpendMinutes": minutesTotal,
            "serverId": serverId
            //"onVacation": user1.brandUser[0].vacation.length > 0
        }
        return timeTable
    }

    async getAdministrationTime(user: UserEntity, serverId: number, dto: GetByDateDto) {
        const users = await this.prisma.brandUser.findMany({
            where:{
                user:{
                    isActive: true
                },
                brandId: user.brandUser.brandId,
                isAdmin: true
            },
            select:{
                user:{
                    select:{
                        id: true,
                        discordId: true,
                        discordUsername: true,
                        timeTable:{
                            where:{
                                joinedTime:{
                                    lte: new Date(dto.to).toISOString() , // to
                                    gte: new Date(dto.from).toISOString() , // from
                                },
                                serverId,
                                server:{
                                    brandId: user.brandUser.brandId
                                }
                            }
                        }
                    }
                },
                vacation:{
                    where:{
                        endOfVacation:{
                            gte:  new Date().toISOString()
                        },
                        startOfVacation:{
                            lt:  new Date().toISOString()
                        }
                    }
                },
                role: {
                    select: {
                        id: true,
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


        let administrationTimeTable = []
        for await (const user1 of users){
            //if(user1.user.timeTable.length == 0) return {"timeSpendMinutes": 0, "serverId": serverId}
            let minutesTotal = 0
            user1.user.timeTable.forEach(element => {
                minutesTotal += element.timeSpend
            });

            const administrationTimeTables = await this.prisma.adminTimeTable.findMany({
                where:{
                    serverId,
                    brandId: user.brandUser.brandId
                }
            })

            let admTimeTable: any = {}
            try{
                admTimeTable = administrationTimeTables.find(x => x.roleId == user1.role[0].id)
            }catch{
                admTimeTable = null
            }

            let passed = false;
            if(admTimeTable){
                 passed = minutesTotal >= admTimeTable.minimumTime
            }
           else{
             passed = true
           }
            administrationTimeTable.push({
                "userId": user1.user.id,
                "discordId": user1.user.discordId?  user1.user.discordId:"unknown",
                "discordUsername": user1.user.discordUsername? user1.user.discordUsername:"unknown",
                "timeSpendMinutes": minutesTotal,
                "serverId": serverId,
                "onVacation": user1.vacation.length > 0,
                "passed": passed
            })
        }

        return administrationTimeTable
    }


  async addUserTime(user: UserEntity, dto: UserTimeTableDto, serverId: number) {

    try{
        dto.timeSpend = parseInt(dto.timeSpend.toString())
    }
    catch{
        return new ForbiddenException("timeSpend musi być numerem").getResponse()
    }

    let steamsIds = []

    const user1 = await this.prisma.brandUser.findFirst({
        where:{
            user:{
                steamId: dto.steamId
            },
            brandId: 1
        }
    })
    if(user1) steamsIds.push(dto.steamId) 
    

   const hours = await this.prisma.timeTable.create({
       data:{
               steamId: dto.steamId,
               joinedTime: dto.joinedTime,
               timeSpend: dto.timeSpend,
               serverId: serverId
       }
   })
   return hours
  }
}
