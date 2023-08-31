import { Injectable, LoggerService } from "@nestjs/common";
import { NestMiddleware } from "@nestjs/common/interfaces";
import { CreateLogDto } from "src/log/dto";
import { PrismaService } from "src/prisma/prisma.service";
//
@Injectable()
export class MyLogger implements LoggerService {
    constructor(private prisma: PrismaService){}

    log(message: any, ...optionalParams: any[]) {}
  
    error(message: any, ...optionalParams: any[]) {}
  
    warn(message: any, ...optionalParams: any[]) {}
  
    debug?(message: any, ...optionalParams: any[]) {}
  
    verbose?(message: any, ...optionalParams: any[]) {}

    async save(dto: CreateLogDto) {
        try{
            await this.prisma.apiLogs.create({
                data:{
                    ...dto
                }
            })
        }catch{}

    }
  }