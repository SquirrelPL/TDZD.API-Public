import { CanActivate, ForbiddenException, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { WsException } from "@nestjs/websockets";
import { Observable } from "rxjs";
import { PrismaService } from "src/prisma/prisma.service";
import { UserService } from "src/user/user.service";

type JwtPayload = {
    sub: String
    email: String
    brandUser: number
    currentBrand: number
  }
//
@Injectable()
export class WsGuard implements CanActivate {

    constructor(private prisma: PrismaService) {
    }

    async canActivate(context: any,){
        const jwtService = new JwtService
        const bearerToken = context.args[0].handshake.headers.authorization.split(' ')[1];
        const decodedJwt = jwtService.decode(bearerToken) as JwtPayload;
        const brandUserId = decodedJwt?.brandUser;
        try {
            const user = await this.prisma.brandUser.findUnique({
                where: {
                    id: brandUserId
                },
                select:{
                    user: true
                }
            })

            if(!user) throw new ForbiddenException('Klucz dostępu został odrzucony')
            delete user.user.hash
            console.log("false")
            return true

             
        } catch (ex) {
            console.log("true")
            throw new WsException("aaa")
            return false
        }
    }
}