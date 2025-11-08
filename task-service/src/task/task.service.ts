import { Injectable, NotFoundException, Logger, Inject } from '@nestjs/common';
import { ITaskRepository } from './repositories/task.repository.interface';
import { Task } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskEventPublisher } from '../communication/task-event.publisher';
import { SocketGateway } from '../socket/socket.gateway';
import { SocketEvents, TaskCreatedEvent, TaskUpdatedEvent, TaskDeletedEvent } from '../../../shared/socket-io/src/socket-events';

/**
 * Task Service - Business logic layer
 * Follows Single Responsibility Principle
 */
@Injectable()
export class TaskService {
    private readonly logger = new Logger(TaskService.name);

    constructor(
        @Inject('ITaskRepository')
        private readonly taskRepository: ITaskRepository,
        private readonly eventPublisher: TaskEventPublisher,
        private readonly socketGateway: SocketGateway,
    ) { }

    async findAll(): Promise<Task[]> {
        return this.taskRepository.findAll();
    }

    async findById(id: string): Promise<Task> {
        const task = await this.taskRepository.findById(id);
        if (!task) {
            throw new NotFoundException(`Task with id ${id} not found`);
        }
        return task;
    }

    async create(createTaskDto: CreateTaskDto): Promise<Task> {
        const task = await this.taskRepository.create(createTaskDto);
        this.logger.log(`Task created: ${task.id}`);

        // Emit Socket.IO event
        const socketEvent: TaskCreatedEvent = {
            id: task.id,
            title: task.title,
            description: task.description,
            status: task.status,
            createdAt: task.createdAt.toISOString(),
        };
        this.socketGateway.emit(SocketEvents.TASK_CREATED, socketEvent);

        // Publish event to Scheduler Service
        await this.eventPublisher.publishTaskCreated(task);

        return task;
    }

    async update(id: string, updateTaskDto: UpdateTaskDto): Promise<Task> {
        await this.findById(id); // Ensure task exists
        const updatedTask = await this.taskRepository.update(id, updateTaskDto);
        this.logger.log(`Task updated: ${id}`);

        // Emit Socket.IO event
        const socketEvent: TaskUpdatedEvent = {
            id: updatedTask.id,
            title: updatedTask.title,
            description: updatedTask.description,
            status: updatedTask.status,
            updatedAt: updatedTask.updatedAt.toISOString(),
        };
        this.socketGateway.emit(SocketEvents.TASK_UPDATED, socketEvent);

        // Publish event to Scheduler Service
        await this.eventPublisher.publishTaskUpdated(updatedTask);

        return updatedTask;
    }

    async delete(id: string): Promise<void> {
        await this.findById(id); // Ensure task exists
        await this.taskRepository.delete(id);
        this.logger.log(`Task deleted: ${id}`);

        // Emit Socket.IO event
        const socketEvent: TaskDeletedEvent = {
            id,
            deletedAt: new Date().toISOString(),
        };
        this.socketGateway.emit(SocketEvents.TASK_DELETED, socketEvent);

        // Publish event to Scheduler Service
        await this.eventPublisher.publishTaskDeleted(id);
    }
}

