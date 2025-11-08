import { FileAttachment } from '../entities/file-attachment.entity';

export class FileAttachmentResponseDto {
    id: string;
    fileName: string;
    originalName: string;
    mimeType: string;
    size: number;
    uploadedAt: Date;

    static fromEntity(file: FileAttachment): FileAttachmentResponseDto {
        const dto = new FileAttachmentResponseDto();
        dto.id = file.id;
        dto.fileName = file.fileName;
        dto.originalName = file.originalName;
        dto.mimeType = file.mimeType;
        dto.size = file.size;
        dto.uploadedAt = file.uploadedAt;
        return dto;
    }
}

