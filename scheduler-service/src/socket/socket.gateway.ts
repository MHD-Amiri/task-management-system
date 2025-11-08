import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, Inject, forwardRef } from '@nestjs/common';
import { SocketEvents } from '../../../shared/socket-io/src/socket-events';
import { TaskEvent } from '../../../shared/communication/src/interfaces';
import { EventListenerService } from '../event-listener/event-listener.service';

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

    constructor(
        @Inject(forwardRef(() => EventListenerService))
        private readonly eventListenerService: EventListenerService,
    ) { }

    afterInit(server: Server) {
        this.logger.log('Socket.IO Gateway initialized');
    }

    handleConnection(client: Socket) {
        this.logger.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('task.event')
    async handleTaskEvent(client: Socket, event: TaskEvent) {
        this.logger.log(`Received task event via Socket.IO: ${event.type}`);
        await this.eventListenerService.handleTaskEvent(event);
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

