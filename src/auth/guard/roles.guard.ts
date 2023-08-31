import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { ForbiddenException } from '@nestjs/common/exceptions';
import { Reflector } from '@nestjs/core';
import { PrismaService } from 'src/prisma/prisma.service';
import { ROLES_KEY } from '../decorator/roles.decorator';
import { AuthDto, FindDto, LoginDto } from '../dto';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

type JwtPayload = {
    sub: String
    email: String
    currentBrand: number
  }
//
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector, private prisma: PrismaService) {}

   

  async canActivate(context: ExecutionContext): Promise<boolean> {

    const requiredRoles = this.reflector.getAllAndOverride<{roles: String[], isCustom :boolean}>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);


    if (!requiredRoles.roles) {
      return true;
    }


    const { user } = context.switchToHttp().getRequest();
    const request = context.switchToHttp().getRequest();

    const request2 = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization']





    const jwtService = new JwtService
    const decodedJwt = jwtService.decode(authHeader.split(' ')[1]) as JwtPayload;
    const currentBrandId = decodedJwt.currentBrand;
    
     const discordId: string = user.discordId

     //if(discordId == null) {throw new ForbiddenException(`Friendly reminder: linkowanie konta discord jest wymagane`)}

     if(requiredRoles.isCustom){
        requiredRoles.roles.forEach((element, index) => {
            let dots = []
            let string = ""
            for(let i = 0; i<requiredRoles.roles[index].length; i++){
                if(requiredRoles.roles[index][i] == '.'){
                    dots.push(i)
                }
            }
            for(let i = 0; i<requiredRoles.roles[index].length; i++){
                string += requiredRoles.roles[index][i]
                if(i == dots[0]-1){
                    i = dots[2]
                    string += ".&.#."
                }
            }
            requiredRoles.roles[index] = string
            requiredRoles.roles[index] = requiredRoles.roles[index].replace('&', currentBrandId.toString())
            requiredRoles.roles[index] = requiredRoles.roles[index].replace('#', request.params.id)
        });
    }
    

    const user2 = await this.prisma.brandUser.findFirst({
        where: {
            brandId: currentBrandId,
            user: {
                id: user.id,
                isActive: true,
            }
        },  
        select: {
            role: {
                select: {
                    permissions: {
                        select: {
                            sku: true
                        }
                    }
                },
            },
        }
    })
    

    if(!user2) return false;


    let permissionsList = []
    
    user2.role.forEach(element => {
        permissionsList.push(element)
    });
    let permissionsList2 = []


    permissionsList.forEach(element => {
        element.permissions.forEach(element => {
            permissionsList2.push(element.sku)
        });
    });


    const user3 = await this.prisma.brandUser.findFirst({
        where:{
            brandId: currentBrandId,
            user: {
                id: user.id,
            }
        },  
        select: {
            permission: {
                select:{
                    sku: true
                }
            }
        }
    })
    user3.permission.forEach(element => {
        permissionsList2.push(element.sku)
    });
    permissionsList2 = [...new Set(permissionsList2)]
    
    
    if(requiredRoles.roles.some((role) => permissionsList2.includes(role))){
        return true;
    }else{
        throw new ForbiddenException(`Odmowa dostępu, wymagana permisja: ${requiredRoles.roles}`)
    }
  }
}