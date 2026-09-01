import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { frontendIp, frontendUrl }from "./frontend.constant";
import { Server, Socket } from "socket.io";
import { Logger } from "@nestjs/common";
import { AuthService } from "../user/auth.service";


@WebSocketGateway({
    cors: {
        origin: [frontendIp, frontendUrl],
        credentials: true
    },
    namespace: '/overlay'
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private _logger: Logger = new Logger(SocketGateway.name);

    @WebSocketServer()
    server!: Server;

    constructor(private _authService: AuthService) {}

    handleConnection(socket: Socket) {
        this._logger.log(`Client with ID: ${socket.id} successfully connected`);
    }

    handleDisconnect(socket: Socket) {
        this._logger.log(`Client with ID: ${socket.id} disconnected successfully`);
    }


    @SubscribeMessage('join_stream')
    async handleJoinStreamer(@MessageBody() spotifyUserId: string, @ConnectedSocket() socket: Socket) {
        const exists = await this._authService.streamerExists(spotifyUserId);

        if (!exists) {
            this._logger.warn(`Попытка подключения к несуществующему стримеру: ${spotifyUserId}`);
            socket.disconnect();
            return;
        }
        
        socket.join(spotifyUserId);
        this._logger.log(`Клиент ${socket.id} подписался на стримера ${spotifyUserId}`);
    }

    broadcast(spotifyUserId: string, trackData: any) {
        this.server.to(spotifyUserId).emit('track_changed', trackData);
    }
}