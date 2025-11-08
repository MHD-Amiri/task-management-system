import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CommunicationFactory } from '../../../shared/communication/src/communication.factory';
import { TaskEventPublisher } from './task-event.publisher';

@Module({
    imports: [HttpModule],
    providers: [CommunicationFactory, TaskEventPublisher],
    exports: [TaskEventPublisher],
})
export class CommunicationModule { }

