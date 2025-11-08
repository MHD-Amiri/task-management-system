import { Controller, Post, Body, Version } from '@nestjs/common';
import { EventListenerService } from './event-listener.service';
import { TaskEvent } from '../../../shared/communication/src/interfaces';

/**
 * Event Listener Controller
 * Receives HTTP events from Task Service
 */
@Controller('events')
export class EventListenerController {
    constructor(private readonly eventListenerService: EventListenerService) { }

    @Post('task')
    @Version('1')
    async handleTaskEvent(@Body() event: TaskEvent): Promise<{ message: string }> {
        await this.eventListenerService.handleTaskEvent(event);
        return { message: 'Event received and processed' };
    }
}

