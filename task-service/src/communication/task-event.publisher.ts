import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommunicationFactory, CommunicationMode, TaskEvent } from '../../../shared/communication/src';
import { ICommunicationStrategy } from '../../../shared/communication/src/interfaces';
import { Task } from '../task/entities/task.entity';

/**
 * Task Event Publisher
 * Publishes task events to Scheduler Service using configured communication strategy
 */
@Injectable()
export class TaskEventPublisher implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(TaskEventPublisher.name);
    private strategy: ICommunicationStrategy;

    constructor(
        private readonly communicationFactory: CommunicationFactory,
        private readonly configService: ConfigService,
    ) { }

    async onModuleInit() {
        const mode = this.configService.get<CommunicationMode>(
            // The value 'COMMUNICATION_MODE' is typically loaded from the .env file via ConfigService
            'COMMUNICATION_MODE',
            CommunicationMode.HTTP,
        );

        const config = {
            httpUrl: this.configService.get<string>('SCHEDULER_SERVICE_URL'),
            socketioUrl: this.configService.get<string>('SCHEDULER_SERVICE_URL')?.replace('http', 'ws'),
            redisHost: this.configService.get<string>('REDIS_HOST', 'localhost'),
            redisPort: this.configService.get<number>('REDIS_PORT', 6379),
        };

        this.strategy = this.communicationFactory.create(mode, config);
        await this.strategy.initialize();
        this.logger.log(`Communication strategy initialized: ${mode}`);
    }

    async onModuleDestroy() {
        if (this.strategy) {
            await this.strategy.destroy();
        }
    }

    async publishTaskCreated(task: Task): Promise<void> {
        const event: TaskEvent = {
            type: 'task.created',
            taskId: task.id,
            data: {
                title: task.title,
                description: task.description,
                status: task.status,
            },
            timestamp: new Date().toISOString(),
        };
        await this.strategy.send(event);
    }

    async publishTaskUpdated(task: Task): Promise<void> {
        const event: TaskEvent = {
            type: 'task.updated',
            taskId: task.id,
            data: {
                title: task.title,
                description: task.description,
                status: task.status,
            },
            timestamp: new Date().toISOString(),
        };
        await this.strategy.send(event);
    }

    async publishTaskDeleted(taskId: string): Promise<void> {
        const event: TaskEvent = {
            type: 'task.deleted',
            taskId,
            data: {},
            timestamp: new Date().toISOString(),
        };
        await this.strategy.send(event);
    }
}

