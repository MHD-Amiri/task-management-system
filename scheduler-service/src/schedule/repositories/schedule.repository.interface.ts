import { Schedule } from '../entities/schedule.entity';

/**
 * Repository interface following Repository Pattern
 */
export interface IScheduleRepository {
    findAll(): Promise<Schedule[]>;
    findById(id: string): Promise<Schedule | null>;
    findByTaskId(taskId: string): Promise<Schedule[]>;
    create(schedule: Partial<Schedule>): Promise<Schedule>;
    update(id: string, schedule: Partial<Schedule>): Promise<Schedule>;
    delete(id: string): Promise<void>;
    findPendingJobs(): Promise<Schedule[]>;
}

