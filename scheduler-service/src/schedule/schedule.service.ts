import { Injectable, NotFoundException, Logger, Inject } from '@nestjs/common';
import { IScheduleRepository } from './repositories/schedule.repository.interface';
import { Schedule, JobStatus } from './entities/schedule.entity';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { SocketGateway } from '../socket/socket.gateway';
import { SocketEvents, JobCreatedEvent, JobExecutedEvent, JobCompletedEvent } from '../../../shared/socket-io/src/socket-events';

/**
 * Schedule Service - Business logic layer
 */
@Injectable()
export class ScheduleService {
    private readonly logger = new Logger(ScheduleService.name);
    private executionInterval: NodeJS.Timeout;

    constructor(
        @Inject('IScheduleRepository')
        private readonly scheduleRepository: IScheduleRepository,
        private readonly socketGateway: SocketGateway,
    ) {
        // Start job execution scheduler
        this.startJobScheduler();
    }

    async findAll(): Promise<Schedule[]> {
        return this.scheduleRepository.findAll();
    }

    async findById(id: string): Promise<Schedule> {
        const schedule = await this.scheduleRepository.findById(id);
        if (!schedule) {
            throw new NotFoundException(`Schedule with id ${id} not found`);
        }
        return schedule;
    }

    async findByTaskId(taskId: string): Promise<Schedule[]> {
        return this.scheduleRepository.findByTaskId(taskId);
    }

    async create(createScheduleDto: CreateScheduleDto): Promise<Schedule> {
        const schedule = await this.scheduleRepository.create({
            taskId: createScheduleDto.taskId,
            scheduledAt: new Date(createScheduleDto.scheduledAt),
            status: JobStatus.SCHEDULED,
        });

        this.logger.log(`Schedule created: ${schedule.id} for task ${createScheduleDto.taskId}`);

        // Emit Socket.IO event
        const event: JobCreatedEvent = {
            id: schedule.id,
            taskId: schedule.taskId,
            scheduledAt: schedule.scheduledAt.toISOString(),
            createdAt: schedule.createdAt.toISOString(),
        };
        this.socketGateway.emit(SocketEvents.JOB_CREATED, event);

        return schedule;
    }

    async executeJob(id: string): Promise<Schedule> {
        const schedule = await this.findById(id);

        if (schedule.status === JobStatus.COMPLETED) {
            throw new Error('Job already completed');
        }

        if (schedule.status === JobStatus.RUNNING) {
            throw new Error('Job is already running');
        }

        // Update status to running
        schedule.status = JobStatus.RUNNING;
        schedule.executedAt = new Date();
        await this.scheduleRepository.update(id, {
            status: JobStatus.RUNNING,
            executedAt: schedule.executedAt,
        });

        this.logger.log(`Executing job: ${id}`);

        // Simulate job execution
        try {
            // Simulate work
            await new Promise((resolve) => setTimeout(resolve, 2000));

            const result = `Job executed successfully at ${new Date().toISOString()}`;
            schedule.status = JobStatus.COMPLETED;
            schedule.result = result;
            schedule.completedAt = new Date();

            await this.scheduleRepository.update(id, {
                status: JobStatus.COMPLETED,
                result,
                completedAt: schedule.completedAt,
            });

            // Emit Socket.IO events
            const executedEvent: JobExecutedEvent = {
                id: schedule.id,
                taskId: schedule.taskId,
                executedAt: schedule.executedAt.toISOString(),
                status: 'success',
                result,
            };
            this.socketGateway.emit(SocketEvents.JOB_EXECUTED, executedEvent);

            const completedEvent: JobCompletedEvent = {
                id: schedule.id,
                taskId: schedule.taskId,
                completedAt: schedule.completedAt.toISOString(),
                duration: schedule.completedAt.getTime() - schedule.executedAt.getTime(),
            };
            this.socketGateway.emit(SocketEvents.JOB_COMPLETED, completedEvent);

            return schedule;
        } catch (error) {
            schedule.status = JobStatus.FAILED;
            schedule.error = error.message;
            await this.scheduleRepository.update(id, {
                status: JobStatus.FAILED,
                error: error.message,
            });

            throw error;
        }
    }

    private startJobScheduler(): void {
        // Check for pending jobs every 5 seconds
        this.executionInterval = setInterval(async () => {
            try {
                const pendingJobs = await this.scheduleRepository.findPendingJobs();
                const now = new Date();

                for (const job of pendingJobs) {
                    if (job.scheduledAt <= now && job.status === JobStatus.SCHEDULED) {
                        this.logger.log(`Auto-executing scheduled job: ${job.id}`);
                        await this.executeJob(job.id).catch((error) => {
                            this.logger.error(`Failed to execute job ${job.id}: ${error.message}`);
                        });
                    }
                }
            } catch (error) {
                this.logger.error(`Error in job scheduler: ${error.message}`);
            }
        }, 5000);
    }

    onModuleDestroy() {
        if (this.executionInterval) {
            clearInterval(this.executionInterval);
        }
    }
}

