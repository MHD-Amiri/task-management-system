import { Module, forwardRef } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { EventListenerController } from './event-listener.controller';
import { EventListenerService } from './event-listener.service';
import { ScheduleModule } from '../schedule/schedule.module';

@Module({
    imports: [HttpModule, forwardRef(() => ScheduleModule)],
    controllers: [EventListenerController],
    providers: [EventListenerService],
    exports: [EventListenerService],
})
export class EventListenerModule { }

