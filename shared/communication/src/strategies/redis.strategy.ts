import { Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { ICommunicationStrategy, TaskEvent } from '../interfaces';

@Injectable()
export class RedisCommunicationStrategy implements ICommunicationStrategy {
    private readonly logger = new Logger(RedisCommunicationStrategy.name);
    private publisher: Redis;
    private readonly channel: string = 'task-events';

    constructor(
        redisHost: string,
        redisPort: number,
    ) {
        this.publisher = new Redis({
            host: redisHost,
            port: redisPort,
            retryStrategy: (times) => {
                const delay = Math.min(times * 50, 2000);
                return delay;
            },
        });

        this.publisher.on('connect', () => {
            this.logger.log('Connected to Redis');
        });

        this.publisher.on('error', (error) => {
            this.logger.error(`Redis error: ${error.message}`);
        });
    }

    async initialize(): Promise<void> {
        this.logger.log('Redis Communication Strategy initialized');
    }

    async send(event: TaskEvent): Promise<void> {
        try {
            await this.publisher.publish(
                this.channel,
                JSON.stringify(event),
            );
            this.logger.log(`Event sent via Redis: ${event.type} for task ${event.taskId}`);
        } catch (error) {
            this.logger.error(`Failed to send event via Redis: ${error.message}`, error.stack);
            throw error;
        }
    }

    async destroy(): Promise<void> {
        if (this.publisher) {
            await this.publisher.quit();
            this.logger.log('Redis Communication Strategy destroyed');
        }
    }
}

