import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ICommunicationStrategy, TaskEvent } from '../interfaces';

@Injectable()
export class HttpCommunicationStrategy implements ICommunicationStrategy {
    private readonly logger = new Logger(HttpCommunicationStrategy.name);
    private readonly baseUrl: string;

    constructor(
        private readonly httpService: HttpService,
        baseUrl: string,
    ) {
        this.baseUrl = baseUrl;
    }

    async initialize(): Promise<void> {
        this.logger.log('HTTP Communication Strategy initialized');
    }

    async send(event: TaskEvent): Promise<void> {
        try {
            const url = `${this.baseUrl}/api/v1/events/task`;
            await firstValueFrom(
                this.httpService.post(url, event, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }),
            );
            this.logger.log(`Event sent via HTTP: ${event.type} for task ${event.taskId}`);
        } catch (error) {
            this.logger.error(`Failed to send event via HTTP: ${error.message}`, error.stack);
            throw error;
        }
    }

    async destroy(): Promise<void> {
        this.logger.log('HTTP Communication Strategy destroyed');
    }
}

