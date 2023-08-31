import { ArgumentMetadata, ForbiddenException, Injectable, PipeTransform } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';

type JwtPayload = {
    sub: String
    email: String
    brandUser: number
    currentBrand: number
  }
//

@Injectable()
export class GetUserPipe implements PipeTransform {
    constructor(private prismaService: PrismaService) {}
    
    async transform(value: any, metadata: ArgumentMetadata) {
        const jwtService = new JwtService
        const decodedJwt = jwtService.decode(value.authHeader.split(' ')[1]) as JwtPayload;
        const currentBrandId = decodedJwt.currentBrand;
        const brandUserId = decodedJwt.brandUser;
        const brandUser = await this.prismaService.brandUser.findUnique({
          where: {
            id: brandUserId
          },
          select: {
            id: true,
            userId: true,
            brandId: true,
            isAdmin: true,
            user:{
              select:{
                id: true,
                discordId: true,
                steamId: true,
                email: true,
                discordUsername: true,
                discordDiscriminator: true,
                discordAvatarUrl: true
              }
            },
            vallet: true,
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
            tempRole: {
              select: {
                  id: true,
                  expirationDate: true,
                  brandUserId: true,
                  roleId: true,
              }
            },
            server: {
              select: {
                id: true,
                brandId: true,
                name: true,
                sId: true,
                game: true,
                support_id: true,
                ip: true,
                port: true,
              }
            },
            strike: {
              where:{
                expirationDate: {
                    gte:  new Date().toISOString()
                  },
              },
              select: {
                id: true,
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
              }
            },
            warn: {
              where:{
                expirationDate: {
                    gte:  new Date().toISOString()
                  },
              },
              select: {
                id: true,
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
              }
            },
            vacation: {
              where:{
                endOfVacation: {
                  gte:  new Date().toISOString()
              },
              startOfVacation: {
                  lt: new Date().toISOString(),
              }
              },
              select: {
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
              }
            },
          }
        })
        const userInfo = {
          ...value.request.user,
          brandUser,
        }
        return userInfo;
    }
}