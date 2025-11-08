import { DynamicModule, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CommunicationFactory } from './communication.factory';

@Module({})
export class CommunicationModule {
    static forRoot(): DynamicModule {
        return {
            module: CommunicationModule,
            imports: [HttpModule],
            providers: [CommunicationFactory],
            exports: [CommunicationFactory, HttpModule],
        };
    }
}

