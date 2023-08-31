import { MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer, WsException } from "@nestjs/websockets";
import { ServerSocketService } from "./server.socket.service";
import { Server, Socket, Namespace } from "socket.io";
import { ForbiddenException, Get, OnModuleInit, UseGuards } from "@nestjs/common";
import { JwtGuard, RolesGuard } from "src/auth/guard";
import { WsGuard } from "src/auth/guard/ws.jwt.guard";
import { Permission } from "src/auth/decorator";

let serverConnections = [];
@WebSocketGateway({ namespace: 'server' })
export class Gateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect{
    constructor(private serverSocketService: ServerSocketService){}

    @WebSocketServer() io: Namespace;


//
    async afterInit(){
        this.io.use(async (socket, next) => {
            if(!await this.serverSocketService.authorize(socket.handshake.auth?.Authorization)) socket.disconnect()
            next()////
        })
        serverConnections = await this.serverSocketService.connectToServersSockets()
        serverConnections.forEach(element => {
            this.serverSocketService.subEvents(this.io,element)

        });
    }

                                                                        //                                      /-> Ptero     -   -     -     -    \     -
                                                                        // client (użytkownik/admin) !->! TDZD API -> Ptero                      #- |####|>
    async handleConnection(client: Socket) {                            //                                       \-> Ptero     -     -         -   / -
        const sockets = this.io.sockets
        const isAuth = await this.serverSocketService.auth(client)
        if(!isAuth) client.disconnect()

        const serverLogs = this.serverSocketService.getServerLogs()
        if(serverLogs.find(x => x.id == client.handshake.query?.serverId) == undefined) {client.disconnect()}
        else{
            const logs = serverLogs.find(x => x.id == client.handshake.query?.serverId).logs
            logs.forEach(element => {
                this.io.to(client.id).emit('startup',element)
            });
////
            
            client.join(client.handshake.query?.serverId.toString())
        }
    }

    
    handleDisconnect(client: Socket) {
       
    }


}