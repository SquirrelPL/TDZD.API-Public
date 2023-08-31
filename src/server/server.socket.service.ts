import { ForbiddenException, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { MyLogger } from "src/auth/logger/logger.middleware";
import { PrismaService } from "src/prisma/prisma.service";
import { PteroServer, PteroSocket } from 'mathost-node'
import { Server, Socket, Namespace } from "socket.io";

type JwtPayload = {
    sub: String
    email: String
    brandUser: number
    currentBrand: number
  }
//
  type PteroConnection = {
    serverId: number,
    supportId: string,
    brandId: number,
    pteroAuthKey: string
  }

let connectionList= [];
let serverLogs = []

@Injectable()
export class ServerSocketService {
    logger: MyLogger;
    constructor(private prisma: PrismaService){
        this.logger = new MyLogger(prisma)
    }

    getServerLogs(){
        return serverLogs
    }

    async wakeUp(){
        let connectionList2 = []
        const servers = await this.prisma.server.findMany({})
        servers?.forEach(element => {//
            connectionList2?.push({
                serverId:  element.id,
                supportId: element.support_id,
                brandId: element.brandId,
                pteroAuthKey: element.pteroAuthKey
            })
        });
        return connectionList2
    }

    async connectToServersSockets(): Promise<any[]>{
       const servers = await this.wakeUp()
        connectionList = [];
       servers?.forEach(async (connection) => {
           const pteroServer = new PteroServer(connection.supportId)
           pteroServer.authorize(connection.pteroAuthKey)
           const pteroSocket = new PteroSocket(pteroServer)
           pteroSocket.connect()
           connectionList.push({
                id: connection.serverId,
                brandId: connection.brandId,
                supportId: connection.supportId,
                pteroServer: pteroServer,
                pteroAuthKey: connection.pteroAuthKey,
                serverId: connection.serverId,
                socket: pteroSocket
           })
           serverLogs.push({id: connection.serverId, logs: []})
       })
       return connectionList;
    }


    async authorize(authorization: string) {
        const jwtService = new JwtService
        if(authorization == undefined) return false
        const decodedJwt = jwtService.decode(authorization.split(' ')[1]) as JwtPayload;

        const user = await this.prisma.brandUser.findUnique({
            where: {
                id: decodedJwt?.brandUser | 0,
                isAdmin: true,
                user:{
                    isActive: true
                }
            }
        })
        if(!user) return false;
        return true
    }

    getConnectionList(){
        return connectionList;
    }

    subEvents(io, server){

        server.socket.on("console_output", (data) => {
            serverLogs.find(x => x.id == server.id).logs.push(data)
            if(serverLogs.find(x => x.id == server.id).logs.length >= 300) serverLogs.find(x => x.id == server.id).logs.shift()
            io.to(server.id.toString()).emit("console_output", data)
        })

        server.socket.on("close", async (data) => {
            setTimeout(() => {
                server.socket.connect();
              }, 1000);
        })


        server.socket.on("connect_error", () => {
            setTimeout(() => {
                server.socket.connect();
            }, 1000);
          });


        server.socket.on("disconnect", (data) => {
            setTimeout(() => {
                server.socket.connect();
              }, 1000);
        })

    }

    async auth(client: Socket): Promise<Boolean>{
        if(!client.handshake.auth.Authorization) return false
        const jwtService = new JwtService
        let decodedJwt: JwtPayload = {
            sub: '0',
            email: '0',
            brandUser: 0,
            currentBrand: 0,
        }
        try{
            decodedJwt = jwtService.decode(client.handshake.auth.Authorization.split(' ')[1]) as JwtPayload;
        }catch{
            return false
        }
        if(decodedJwt?.email === '0' || decodedJwt === null) return false

     
        const currentBrandId = decodedJwt.currentBrand;
        const brandUserId = decodedJwt.brandUser;
        
        
        if(!client.handshake.query?.serverId.toString()) return false

        const requiredRoles = {
            roles: [ `server.${currentBrandId}.${client.handshake.query?.serverId.toString()}.connectWithConsole` ],
            isCustom: true
        }

        
        const user2 = await this.prisma.brandUser.findFirst({
            where: {
                id: brandUserId,
                brandId: currentBrandId,
                user: {
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
                id: brandUserId,
                brandId: currentBrandId,
                user: {
                    isActive: true,
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
            return true
        }


    }
}