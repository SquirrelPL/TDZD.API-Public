import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateLogDto, GetLogsByDateDto, GetMultipleLogsByIdSpanDto } from './dto';
import { UserEntity } from 'src/auth/dto/user.dto';
//
@Injectable()
export class LogService {
    constructor(private prisma: PrismaService){}

    async getLogs(user: UserEntity){
        return await this.prisma.apiLogs.findMany({
            where: {
                brandId: user.brandUser.brandId,
            }
        });
    }

    async getLogById(id: number, user: UserEntity){
        try{
            const log = await this.prisma.apiLogs.findUnique({
                where: {
                    id,
                    brandId: user.brandUser.brandId,
                }
            });
            return log;
        }catch(e){
            if(e.code === 'P2025') throw new ForbiddenException(`Nie znaleziono loga o id: ${id}`)
            throw new ForbiddenException(`Błąd jest nieznany i należy zgłosić go do administratora ${e?.code}`)
        }
    }

    async getLogByDate(dto: GetLogsByDateDto, user: UserEntity){
        try{
            const log = await this.prisma.apiLogs.findMany({
                where: {
                    createdAt: {
                        gte:  new Date(dto.from).toISOString(),
                        lt: new Date(dto.to).toISOString(),
                      },
                      brandId: user.brandUser.brandId,
                }
            });
            return log;
        }catch(e){
            throw new ForbiddenException(`Błąd jest nieznany i należy zgłosić go do administratora ${e?.code}`)
        }
    }

    async getMultipleLogsByIdSpan(dto: GetMultipleLogsByIdSpanDto, user: UserEntity){
        let arrayOfIds = Array.from({length:(dto.to-dto.from+1)},(v,k)=>k+dto.from)

        try{
            const log = await this.prisma.apiLogs.findMany({
                where: {
                    id: { in: arrayOfIds },
                    brandId: user.brandUser.brandId,
                }
            });
            return log;
        }catch(e){
            throw new ForbiddenException(`Błąd jest nieznany i należy zgłosić go do administratora ${e?.code}`)
        }
    }

    async postLog(dto: CreateLogDto, user: UserEntity){
        try{
            const log = await this.prisma.apiLogs.create({
                data: {
                    ...dto,
                    brandId: user.brandUser.brandId,
                }
            });
            return log;
        }catch(e){
            throw new ForbiddenException(`Błąd jest nieznany i należy zgłosić go do administratora ${e?.code}`)
        }
    }

    async deleteLog(id: number, user: UserEntity){
        try{
            const log = await this.prisma.apiLogs.delete({
                where: {
                    id,
                    brandId: user.brandUser.brandId,
                }
            });
            return log;
        }catch(e){
            if(e.code === 'P2025') throw new ForbiddenException(`Nie znaleziono loga o id: ${id}`)
            throw new ForbiddenException(`Błąd jest nieznany i należy zgłosić go do administratora ${e?.code}`)
        }
    }
}