import { Task, TaskStatus } from '../entities/task.entity';
import { FileAttachmentResponseDto } from '../../file/dto/file-attachment-response.dto';

/**
 * V2 Response DTO with additional fields
 */
export class TaskResponseV2Dto {
    id: string;
    title: string;
    description?: string;
    status: TaskStatus;
    statusLabel: string; // Human-readable status
    createdAt: Date;
    updatedAt: Date;
    attachments?: FileAttachmentResponseDto[];
    attachmentCount: number;
    metadata: {
        hasAttachments: boolean;
        isCompleted: boolean;
        isPending: boolean;
    };

    static fromEntity(task: Task): TaskResponseV2Dto {
        const dto = new TaskResponseV2Dto();
        dto.id = task.id;
        dto.title = task.title;
        dto.description = task.description;
        dto.status = task.status;
        dto.statusLabel = TaskResponseV2Dto.getStatusLabel(task.status);
        dto.createdAt = task.createdAt;
        dto.updatedAt = task.updatedAt;
        dto.attachmentCount = task.attachments?.length || 0;
        dto.metadata = {
            hasAttachments: (task.attachments?.length || 0) > 0,
            isCompleted: task.status === TaskStatus.COMPLETED,
            isPending: task.status === TaskStatus.PENDING,
        };
        if (task.attachments) {
            dto.attachments = task.attachments.map((att) =>
                FileAttachmentResponseDto.fromEntity(att),
            );
        }
        return dto;
    }

    private static getStatusLabel(status: TaskStatus): string {
        const labels = {
            [TaskStatus.PENDING]: 'Pending',
            [TaskStatus.IN_PROGRESS]: 'In Progress',
            [TaskStatus.COMPLETED]: 'Completed',
            [TaskStatus.CANCELLED]: 'Cancelled',
        };
        return labels[status] || status;
    }
}

