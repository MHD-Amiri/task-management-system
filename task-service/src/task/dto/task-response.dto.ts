import { Task, TaskStatus } from '../entities/task.entity';
import { FileAttachmentResponseDto } from '../../file/dto/file-attachment-response.dto';

export class TaskResponseDto {
    id: string;
    title: string;
    description?: string;
    status: TaskStatus;
    createdAt: Date;
    updatedAt: Date;
    attachments?: FileAttachmentResponseDto[];

    static fromEntity(task: Task): TaskResponseDto {
        const dto = new TaskResponseDto();
        dto.id = task.id;
        dto.title = task.title;
        dto.description = task.description;
        dto.status = task.status;
        dto.createdAt = task.createdAt;
        dto.updatedAt = task.updatedAt;
        if (task.attachments) {
            dto.attachments = task.attachments.map((att) =>
                FileAttachmentResponseDto.fromEntity(att),
            );
        }
        return dto;
    }
}

