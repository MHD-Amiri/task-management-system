import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '../entities/task.entity';
import { ITaskRepository } from './task.repository.interface';

/**
 * TypeORM implementation of Task Repository
 * Can be swapped with Prisma or other ORM implementations
 */
@Injectable()
export class TaskRepository implements ITaskRepository {
    constructor(
        @InjectRepository(Task)
        private readonly repository: Repository<Task>,
    ) { }

    async findAll(): Promise<Task[]> {
        return this.repository.find({
            relations: ['attachments'],
            order: { createdAt: 'DESC' },
        });
    }

    async findById(id: string): Promise<Task | null> {
        return this.repository.findOne({
            where: { id },
            relations: ['attachments'],
        });
    }

    async create(task: Partial<Task>): Promise<Task> {
        const newTask = this.repository.create(task);
        return this.repository.save(newTask);
    }

    async update(id: string, task: Partial<Task>): Promise<Task> {
        await this.repository.update(id, task);
        const updated = await this.findById(id);
        if (!updated) {
            throw new Error(`Task with id ${id} not found`);
        }
        return updated;
    }

    async delete(id: string): Promise<void> {
        await this.repository.delete(id);
    }
}

