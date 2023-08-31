import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtService } from "@nestjs/jwt/dist";
import { type } from 'os';
import { PrismaService } from 'src/prisma/prisma.service';

//
type JwtPayload = {
  sub: String
  email: String
  currentBrand: number
}

export const GetBrand = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const authHeader = request.headers['authorization']

    const jwtService = new JwtService
    const decodedJwt = jwtService.decode(authHeader.split(' ')[1]) as JwtPayload;
    
    
    return decodedJwt.currentBrand;
  },
);