import { DynamicModule, Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';

@Module({})
export class SocketModule {
    static forRoot(options?: { port?: number; cors?: any }): DynamicModule {
        return {
            module: SocketModule,
            providers: [SocketGateway],
            exports: [SocketGateway],
        };
    }
}

