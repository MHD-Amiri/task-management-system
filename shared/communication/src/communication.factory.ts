import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { CommunicationMode, ICommunicationStrategy } from './interfaces';
import { HttpCommunicationStrategy } from './strategies/http.strategy';
import { SocketIoCommunicationStrategy } from './strategies/socketio.strategy';
import { RedisCommunicationStrategy } from './strategies/redis.strategy';

/**
 * Factory for creating communication strategies
 * Follows Factory Pattern for creating appropriate strategy based on configuration
 */
@Injectable()
export class CommunicationFactory {
    constructor(private readonly httpService: HttpService) { }

    create(
        mode: CommunicationMode,
        config: {
            httpUrl?: string;
            socketioUrl?: string;
            redisHost?: string;
            redisPort?: number;
        },
    ): ICommunicationStrategy {
        switch (mode) {
            case CommunicationMode.HTTP:
                if (!config.httpUrl) {
                    throw new Error('HTTP URL is required for HTTP communication mode');
                }
                return new HttpCommunicationStrategy(this.httpService, config.httpUrl);

            case CommunicationMode.SOCKETIO:
                if (!config.socketioUrl) {
                    throw new Error('Socket.IO URL is required for Socket.IO communication mode');
                }
                return new SocketIoCommunicationStrategy(config.socketioUrl);

            case CommunicationMode.REDIS:
                if (!config.redisHost || !config.redisPort) {
                    throw new Error('Redis host and port are required for Redis communication mode');
                }
                return new RedisCommunicationStrategy(config.redisHost, config.redisPort);

            default:
                throw new Error(`Unsupported communication mode: ${mode}`);
        }
    }
}

