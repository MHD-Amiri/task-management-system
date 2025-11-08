import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileAttachment } from './entities/file-attachment.entity';
import { Task } from '../task/entities/task.entity';
import * as fs from 'fs';
import * as path from 'path';
import { SocketGateway } from '../socket/socket.gateway';
import { SocketEvents, TaskFileUploadedEvent } from '../../../shared/socket-io/src/socket-events';

@Injectable()
export class FileService {
    private readonly logger = new Logger(FileService.name);
    private readonly uploadDir = path.join(process.cwd(), 'uploads');

    constructor(
        @InjectRepository(FileAttachment)
        private readonly fileRepository: Repository<FileAttachment>,
        private readonly socketGateway: SocketGateway,
    ) {
        // Ensure upload directory exists
        if (!fs.existsSync(this.uploadDir)) {
            fs.mkdirSync(this.uploadDir, { recursive: true });
        }
    }

    async uploadFile(task: Task, file: Express.Multer.File): Promise<FileAttachment> {
        const fileName = `${Date.now()}-${file.originalname}`;
        const filePath = path.join(this.uploadDir, fileName);

        // Save file to disk
        fs.writeFileSync(filePath, file.buffer);

        // Save metadata to database
        const fileAttachment = this.fileRepository.create({
            fileName,
            originalName: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
            path: filePath,
            taskId: task.id,
        });

        const saved = await this.fileRepository.save(fileAttachment);
        this.logger.log(`File uploaded: ${saved.id} for task ${task.id}`);

        // Emit Socket.IO event
        const event: TaskFileUploadedEvent = {
            taskId: task.id,
            fileId: saved.id,
            fileName: saved.originalName,
            fileSize: saved.size,
            fileType: saved.mimeType,
            uploadedAt: saved.uploadedAt.toISOString(),
        };
        this.socketGateway.emit(SocketEvents.TASK_FILE_UPLOADED, event);

        return saved;
    }

    async getFileById(id: string): Promise<FileAttachment> {
        return this.fileRepository.findOne({ where: { id } });
    }
}

