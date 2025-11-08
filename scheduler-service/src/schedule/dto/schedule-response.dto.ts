import { Schedule, JobStatus } from '../entities/schedule.entity';

export class ScheduleResponseDto {
    id: string;
    taskId: string;
    scheduledAt: Date;
    status: JobStatus;
    result?: string;
    error?: string;
    executedAt?: Date;
    completedAt?: Date;
    createdAt: Date;
    updatedAt: Date;

    static fromEntity(schedule: Schedule): ScheduleResponseDto {
        const dto = new ScheduleResponseDto();
        dto.id = schedule.id;
        dto.taskId = schedule.taskId;
        dto.scheduledAt = schedule.scheduledAt;
        dto.status = schedule.status;
        dto.result = schedule.result;
        dto.error = schedule.error;
        dto.executedAt = schedule.executedAt;
        dto.completedAt = schedule.completedAt;
        dto.createdAt = schedule.createdAt;
        dto.updatedAt = schedule.updatedAt;
        return dto;
    }
}

