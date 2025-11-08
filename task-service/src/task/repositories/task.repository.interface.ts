import { Task } from '../entities/task.entity';

/**
 * Repository interface following Repository Pattern
 * Abstracts data access layer
 */
export interface ITaskRepository {
    findAll(): Promise<Task[]>;
    findById(id: string): Promise<Task | null>;
    create(task: Partial<Task>): Promise<Task>;
    update(id: string, task: Partial<Task>): Promise<Task>;
    delete(id: string): Promise<void>;
}

