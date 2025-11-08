import { Injectable, Logger } from '@nestjs/common';
import { io, Socket } from 'socket.io-client';
import { ICommunicationStrategy, TaskEvent } from '../interfaces';

@Injectable()
export class SocketIoCommunicationStrategy implements ICommunicationStrategy {
    private readonly logger = new Logger(SocketIoCommunicationStrategy.name);
    private socket: Socket;
    private readonly serverUrl: string;

    constructor(serverUrl: string) {
        this.serverUrl = serverUrl;
    }

    async initialize(): Promise<void> {
        this.socket = io(this.serverUrl, {
            transports: ['websocket'],
            reconnection: true,
            reconnectionDelay: 1000,
        });

        this.socket.on('connect', () => {
            this.logger.log('Connected to Scheduler Service via Socket.IO');
        });

        this.socket.on('disconnect', () => {
            this.logger.warn('Disconnected from Scheduler Service');
        });

        this.socket.on('connect_error', (error) => {
            this.logger.error(`Socket.IO connection error: ${error.message}`);
        });

        // Wait for connection
        return new Promise((resolve, reject) => {
            if (this.socket.connected) {
                resolve();
            } else {
                this.socket.once('connect', () => resolve());
                this.socket.once('connect_error', reject);
                setTimeout(() => reject(new Error('Connection timeout')), 5000);
            }
        });
    }

    async send(event: TaskEvent): Promise<void> {
        if (!this.socket || !this.socket.connected) {
            throw new Error('Socket.IO not connected');
        }

        try {
            this.socket.emit('task.event', event);
            this.logger.log(`Event sent via Socket.IO: ${event.type} for task ${event.taskId}`);
        } catch (error) {
            this.logger.error(`Failed to send event via Socket.IO: ${error.message}`, error.stack);
            throw error;
        }
    }

    async destroy(): Promise<void> {
        if (this.socket) {
            this.socket.disconnect();
            this.logger.log('Socket.IO Communication Strategy destroyed');
        }
    }
}

