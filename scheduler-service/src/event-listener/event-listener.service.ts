import { Injectable, Logger, OnModuleInit, OnModuleDestroy, Inject, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { ScheduleService } from '../schedule/schedule.service';
import { TaskEvent, CommunicationMode } from '../../../shared/communication/src/interfaces';
import Redis from 'ioredis';
import { Server } from 'socket.io';

/**
 * Event Listener Service
 * Listens to task events from Task Service using configured communication method
 */
@Injectable()
export class EventListenerService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(EventListenerService.name);
    private redisSubscriber: Redis;
    private socketServer: Server;

    constructor(
        private readonly configService: ConfigService,
        @Inject(forwardRef(() => ScheduleService))
        private readonly scheduleService: ScheduleService,
        private readonly httpService: HttpService,
    ) { }

    async onModuleInit() {
        const mode = this.configService.get<CommunicationMode>(
            'COMMUNICATION_MODE',
            CommunicationMode.HTTP,
        );

        this.logger.log(`Initializing event listener with mode: ${mode}`);

        switch (mode) {
            case CommunicationMode.HTTP:
                // HTTP events are handled via controller endpoint
                this.logger.log('HTTP event listener ready (via /api/v1/events/task endpoint)');
                break;

            case CommunicationMode.SOCKETIO:
                // Socket.IO events are handled via gateway
                this.logger.log('Socket.IO event listener ready (via gateway)');
                break;

            case CommunicationMode.REDIS:
                await this.initializeRedisListener();
                break;

            default:
                this.logger.warn(`Unknown communication mode: ${mode}`);
        }
    }

    private async initializeRedisListener(): Promise<void> {
        const redisHost = this.configService.get<string>('REDIS_HOST', 'localhost');
        const redisPort = this.configService.get<number>('REDIS_PORT', 6379);

        this.redisSubscriber = new Redis({
            host: redisHost,
            port: redisPort,
            retryStrategy: (times) => {
                const delay = Math.min(times * 50, 2000);
                return delay;
            },
        });

        this.redisSubscriber.on('connect', () => {
            this.logger.log('Connected to Redis for event listening');
        });

        this.redisSubscriber.on('error', (error) => {
            this.logger.error(`Redis error: ${error.message}`);
        });

        // Subscribe to task events channel
        await this.redisSubscriber.subscribe('task-events');
        this.logger.log('Subscribed to Redis channel: task-events');

        this.redisSubscriber.on('message', async (channel, message) => {
            if (channel === 'task-events') {
                try {
                    const event: TaskEvent = JSON.parse(message);
                    await this.handleTaskEvent(event);
                } catch (error) {
                    this.logger.error(`Error processing Redis message: ${error.message}`);
                }
            }
        });
    }

    async handleTaskEvent(event: TaskEvent): Promise<void> {
        this.logger.log(`Received task event: ${event.type} for task ${event.taskId}`);

        try {
            switch (event.type) {
                case 'task.created':
                    // Auto-create a scheduled job for new tasks
                    const scheduledAt = new Date();
                    scheduledAt.setMinutes(scheduledAt.getMinutes() + 5); // Schedule 5 minutes from now
                    await this.scheduleService.create({
                        taskId: event.taskId,
                        scheduledAt: scheduledAt.toISOString(),
                    });
                    this.logger.log(`Auto-created schedule for task ${event.taskId}`);
                    break;

                case 'task.updated':
                    // Update related schedules if needed
                    this.logger.log(`Task ${event.taskId} updated, schedules may need update`);
                    break;

                case 'task.deleted':
                    // Cancel related schedules
                    const schedules = await this.scheduleService.findByTaskId(event.taskId);
                    for (const schedule of schedules) {
                        // Mark as cancelled (in a real scenario, you'd have a cancel method)
                        this.logger.log(`Task ${event.taskId} deleted, related schedules should be cancelled`);
                    }
                    break;

                default:
                    this.logger.warn(`Unknown event type: ${event.type}`);
            }
        } catch (error) {
            this.logger.error(`Error handling task event: ${error.message}`, error.stack);
        }
    }

    async onModuleDestroy() {
        if (this.redisSubscriber) {
            await this.redisSubscriber.quit();
        }
    }
}

