import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { SocketEvents, TaskCreatedEvent, TaskUpdatedEvent, TaskDeletedEvent } from '../../../shared/socket-io/src/socket-events';

@WebSocketGateway({
    cors: {
        origin: '*',
        credentials: true,
    },
    namespace: '/',
})
export class SocketGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private logger: Logger = new Logger('SocketGateway');

    afterInit(server: Server) {
        this.logger.log('Socket.IO Gateway initialized');
    }

    handleConnection(client: Socket) {
        this.logger.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }

    emit(event: SocketEvents, data: any) {
        this.server.emit(event, data);
    }

    emitToRoom(room: string, event: SocketEvents, data: any) {
        this.server.to(room).emit(event, data);
    }

    emitToClient(clientId: string, event: SocketEvents, data: any) {
        this.server.to(clientId).emit(event, data);
    }
}

