import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Schedule, JobStatus } from '../entities/schedule.entity';
import { IScheduleRepository } from './schedule.repository.interface';

@Injectable()
export class ScheduleRepository implements IScheduleRepository {
    constructor(
        @InjectRepository(Schedule)
        private readonly repository: Repository<Schedule>,
    ) { }

    async findAll(): Promise<Schedule[]> {
        return this.repository.find({
            order: { createdAt: 'DESC' },
        });
    }

    async findById(id: string): Promise<Schedule | null> {
        return this.repository.findOne({ where: { id } });
    }

    async findByTaskId(taskId: string): Promise<Schedule[]> {
        return this.repository.find({
            where: { taskId },
            order: { createdAt: 'DESC' },
        });
    }

    async create(schedule: Partial<Schedule>): Promise<Schedule> {
        const newSchedule = this.repository.create(schedule);
        return this.repository.save(newSchedule);
    }

    async update(id: string, schedule: Partial<Schedule>): Promise<Schedule> {
        await this.repository.update(id, schedule);
        const updated = await this.findById(id);
        if (!updated) {
            throw new Error(`Schedule with id ${id} not found`);
        }
        return updated;
    }

    async delete(id: string): Promise<void> {
        await this.repository.delete(id);
    }

    async findPendingJobs(): Promise<Schedule[]> {
        return this.repository.find({
            where: [
                { status: JobStatus.PENDING },
                { status: JobStatus.SCHEDULED },
            ],
            order: { scheduledAt: 'ASC' },
        });
    }
}

