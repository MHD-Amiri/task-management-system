import { Module, forwardRef } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { EventListenerModule } from '../event-listener/event-listener.module';

@Module({
    imports: [forwardRef(() => EventListenerModule)],
    providers: [SocketGateway],
    exports: [SocketGateway],
})
export class SocketModule { }

