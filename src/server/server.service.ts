import { ForbiddenException, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { parse } from 'path';
import { MyLogger } from 'src/auth/logger/logger.middleware';
import { PrismaService } from 'src/prisma/prisma.service';
import { AddStatisticDTO, CreateServerDto, EditServerDto, GetStatisticByDateDto } from './dto';
import { UserEntity } from 'src/auth/dto/user.dto';
import { ServerSocketService } from './server.socket.service';


@Injectable()
export class ServerService {
    logger: MyLogger;
    constructor(private prisma: PrismaService, private serverSocketService: ServerSocketService){
        this.logger = new MyLogger(prisma)
    }
//
    async serverInfo(id) {
        try{
            let connList = this.serverSocketService.getConnectionList()
            let server = connList.find(x => x.id == id)
            let info = await server.pteroServer.getPublicData()
    
            return {
                serverId: server.id,
                name: info.name, 
                currentPlayers: (info?.players | 0) + '/' + (info?.maxplayers | 0)}
        }
        catch{
            return {
                serverId: 0,
                name: "unknown", 
                currentPlayers: "0/0"
            }
        }
    }

    async getCurrentPlayers(id: number, user: UserEntity) {
        let connList = this.serverSocketService.getConnectionList()
        let server = connList.find(x => x.id == id)
        let info = await server.pteroServer.getGameData()
        if(info.error) {return new ForbiddenException("Serwer nie znajduje się na liście serwerów.").getResponse()}
        return info.players
    }

    async sendCommand(id: number, user: UserEntity, command: string) {
        let connList = this.serverSocketService.getConnectionList()
        let server = connList.find(x => x.id == id)
        let info = await server.pteroServer.sendCommand(command)
        if(info.error) {return new ForbiddenException("Serwer nie znajduje się na liście serwerów.").getResponse()}
        return info.players
    }

    async getCurrentPlayersPublic(id: number) {
        let connList = this.serverSocketService.getConnectionList()
        let server = connList.find(x => x.id == id)
        let info = await server.pteroServer.getGameData()

        if(info.error) {return new ForbiddenException("Serwer nie znajduje się na liście serwerów.").getResponse()}

        let adminsIds = []
        info?.players?.forEach(element => {
            adminsIds.push(element.steamid.split('@')[0])
        });
//
        const branduser = await this.prisma.brandUser.findMany({
            where:{
                isAdmin: true,
                brandId: server.brandId,
                user:{
                    steamId: {in: [...adminsIds]}
                }
            },
            select:{
                user:{
                    select:{
                        steamId: true
                    }
                }
            }
        })

        let administListIds = []
        branduser.forEach(element => {
            administListIds.push(element.user.steamId)
        });

        let finallList = []
        info.players.forEach(element => {
            finallList.push({
                id: element.id,
                name: element.name,
                isAdmin:  administListIds.includes(element.steamid.split('@')[0])
            })
        });
        return finallList
    }

    async getServers(user: UserEntity) {
        const servers = await this.prisma.server.findMany({
            where: {
                brandId: user.brandUser.brandId
            }
        })
        let serversList = []
        servers.forEach(element => {
            delete element.pteroServerId
            delete element.pteroAuthKey
            serversList.push(element)
        });
        return serversList;
    }

    async getBans(id: number, user: UserEntity) {
        let connList = this.serverSocketService.getConnectionList()
        let server = connList.find(x => x.id == id)
        let info = await server.pteroServer.getGameData()
        info.info.bans.forEach(element => {
            delete element.ip
            delete element.source
        });
        return info.info.bans
    }

    async startServer(id: number, user: UserEntity) {
        let connList = this.serverSocketService.getConnectionList()
        let server = connList.find(x => x.id == id)
        let info = await server.pteroServer.changeState('start');
        return {successful: info}
    }

    async restartServer(id: number, user: UserEntity) {
        let connList = this.serverSocketService.getConnectionList()
        let server = connList.find(x => x.id == id)
        let info = await server.pteroServer.changeState('restart');
        return {successful: info}
    }

    async stopServer(id: number, user: UserEntity) {
        let connList = this.serverSocketService.getConnectionList()
        let server = connList.find(x => x.id == id)
        let info = await server.pteroServer.changeState('stop');
        return {successful: info}
    }


    async getServerById(id: number, user: UserEntity){
        try{
            const server = await this.prisma.server.findUnique({
                where: {
                    id,
                    brandId: user.brandUser.brandId
                }
            })
            delete server.pteroServerId
            delete server.pteroAuthKey
            return server;
        }catch(e){
            if(e.code === 'P2025') throw new ForbiddenException(`Nie znaleziono serwera o id: ${id}`)
            else throw new ForbiddenException(`Kod błędu ${e.code}`)
        }

    }

    async createServer(dto: CreateServerDto, user: UserEntity){

        try{
            const server = await this.prisma.server.create({
                data: {
                    brandId: user.brandUser.brandId,
                    ...dto
                }
            })
            this.logger.save({
                brandId: user.brandUser.brandId,
                title: `Stworzenie Serwera`,
                description: `Użytkownik ${user.discordUsername} o id: ${user.id} storzył server ${server.name} o id: ${server.id}`
            })
            delete server.pteroServerId
            delete server.pteroAuthKey
            
            const permissions = await this.prisma.permission.createMany({
                data: [
                    { sku: `server.${server.brandId}.${server.id}.start`, brandView: server.brandId },
                    { sku: `server.${server.brandId}.${server.id}.stop`, brandView: server.brandId },
                    { sku: `server.${server.brandId}.${server.id}.restart`, brandView: server.brandId },
                    { sku: `server.${server.brandId}.${server.id}.connectWithConsole`, brandView: server.brandId },
                    { sku: `server.${server.brandId}.${server.id}.sendCommand`, brandView: server.brandId },
                    { sku: `server.${server.brandId}.${server.id}.getBans`, brandView: server.brandId },
                    { sku: `server.${server.brandId}.${server.id}.getCurrentPlayers`, brandView: server.brandId },
                    { sku: `server.${server.brandId}.${server.id}.editConfig`, brandView: server.brandId },
                    { sku: `server.${server.brandId}.${server.id}.getLogs`, brandView: server.brandId },
                    { sku: `userGameTime.${server.brandId}.${server.id}.getUserTime`, brandView: server.brandId},
                    { sku: `userGameTime.${server.brandId}.${server.id}.getAdministrationTime`, brandView: server.brandId},
                    { sku: `userGameTime.${server.brandId}.${server.id}.addUserTime`, brandView: server.brandId},
                ]
            })

            const permissionsList = await this.prisma.permission.findMany({
                where:{
                    sku: {in: [
                        `server.${server.brandId}.${server.id}.start`, 
                        `server.${server.brandId}.${server.id}.stop`,
                        `server.${server.brandId}.${server.id}.restart`,
                        `server.${server.brandId}.${server.id}.connectWithConsole`,
                        `server.${server.brandId}.${server.id}.sendCommand`,
                        `server.${server.brandId}.${server.id}.getBans`,
                        `server.${server.brandId}.${server.id}.getCurrentPlayers`,
                        `server.${server.brandId}.${server.id}.editConfig`,
                        `server.${server.brandId}.${server.id}.getLogs`,
                    ]}
                },
                select: {id:true}
            })

            const role1 = await this.prisma.role.create({
                data: {
                    brandId: user.brandUser.brandId,
                    discordRoleId: "0",
                    name: `ManageServer ${server.brandId}:${server.id}`,
                    power: 300,
                    group: `SSCP:${server.brandId}:${server.id}`,
                    color: "#323232",
                    permissions: { connect: permissionsList.map(x => {return {id: x.id}})},
                },
            })
            this.logger.save({
                brandId: user.brandUser.brandId,
                title: `Stworzenie Roli`,
                description: `Uzytkownik ${user.discordUsername} o id: ${user.id} utworzył rolę ${role1.name} o id: ${role1.id}`
            })

            await this.prisma.brandUser.update({
                where:{
                    id: user.brandUser.id
                },
                data:{
                    role: {connect: {id: role1.id}}
                }
            })
            this.serverSocketService.connectToServersSockets()

            return server;
        }catch(e){
            if(e.code === 'P2002') throw new ForbiddenException(`Wartości takie jak support_id i sId muszą być unikalne!`)
            else throw new ForbiddenException(`Kod błędu ${e.code}`)
        }
    }

    async editServer(id: number, dto: EditServerDto, user: UserEntity){
        try{
            const server = await this.prisma.server.update({
                where:{
                    id,
                    brandId: user.brandUser.brandId
                },
                data: {
                    ...dto
                }
            })
            this.logger.save({
                brandId: user.brandUser.brandId,
                title: `Edycja Serwera`,
                description: `Użytkownik ${user.discordUsername} o id: ${user.id} edytował server ${server.name} o id: ${server.id}`
            })
            delete server.pteroServerId
            delete server.pteroAuthKey
            return server;
        }catch(e){
            if(e.code === 'P2025') throw new ForbiddenException(`Nie znaleziono serwera o id: ${id}`)
            else throw new ForbiddenException(`Kod błędu ${e.code}`)
        }
    }

    async deleteServer(id: number, user: UserEntity){
        try{
            const server = await this.prisma.server.delete({
                where:{
                    id,
                    brandId: user.brandUser.brandId
                }
            })
            this.logger.save({
                brandId: user.brandUser.brandId,
                title: `Usunięcie Serwera`,
                description: `Użytkownik ${user.discordUsername} o id: ${user.id} usuną server ${server.name} o id: ${server.id}`
            })
            delete server.pteroServerId
            delete server.pteroAuthKey

            const permissions = await this.prisma.permission.deleteMany({
                where: {
                    sku: {in: [
                        `server.${server.brandId}.${server.id}.start`,
                        `server.${server.brandId}.${server.id}.stop` ,
                        `server.${server.brandId}.${server.id}.restart`,
                        `server.${server.brandId}.${server.id}.connectWithConsole`,
                        `server.${server.brandId}.${server.id}.getBans`,
                        `server.${server.brandId}.${server.id}.getCurrentPlayers`,
                        `server.${server.brandId}.${server.id}.editConfig` ,
                        `server.${server.brandId}.${server.id}.getLogs`
                    ]}
                }
            })
            
            return server;
        }catch(e){
            if(e.code === 'P2025') throw new ForbiddenException(`Nie znaleziono serwera o id: ${id}`)
            else throw new ForbiddenException(`Kod błędu ${e.code}`)
        }
    }

    async addStatistic(dto: AddStatisticDTO){
        try{
            const stat = await this.prisma.numberOfPrayersStatistic.create({
                data:{
                    ...dto
                }
            })
            return stat;
        }catch(e){
            if(e.code === 'P2003') throw new ForbiddenException(`Nie ma takiego serwera o id: ${dto.serverId}`)
            else throw new ForbiddenException(`Kod błędu ${e.code}`)
        }
    }

    async getStatisticById(id: number){
        try{
            const stat = this.prisma.numberOfPrayersStatistic.findUnique({
                where:{
                    id
                }
            })
            return stat;
        }catch(e){
            if(e.code === 'P2025') throw new ForbiddenException(`Nie znaleziono statystyki o id: ${id}`)
            else throw new ForbiddenException(`Kod błędu ${e.code}`)
        }
    }

    async getStatisticByDate(serverId: number,dto: GetStatisticByDateDto){
        try{
            const stat = this.prisma.numberOfPrayersStatistic.findMany({
                where:{
                    serverId,
                    createdAt: {
                        gte:  new Date(dto.from).toISOString(),
                        lt: new Date(dto.to).toISOString(),
                      },
                }
            })
            return stat;
        }catch(e){
            if(e.code === 'P2025') throw new ForbiddenException(`Nie znaleziono statystyki o id:`)
            else throw new ForbiddenException(`Kod błędu ${e.code}`)
        }
    }
    
}