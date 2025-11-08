import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Task } from '../../task/entities/task.entity';

@Entity('file_attachments')
export class FileAttachment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    fileName: string;

    @Column()
    originalName: string;

    @Column()
    mimeType: string;

    @Column('bigint')
    size: number;

    @Column()
    path: string;

    @Column()
    taskId: string;

    @ManyToOne(() => Task, (task) => task.attachments, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'taskId' })
    task: Task;

    @CreateDateColumn()
    uploadedAt: Date;
}

