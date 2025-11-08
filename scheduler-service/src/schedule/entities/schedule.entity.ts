import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

export enum JobStatus {
    PENDING = 'pending',
    SCHEDULED = 'scheduled',
    RUNNING = 'running',
    COMPLETED = 'completed',
    FAILED = 'failed',
    CANCELLED = 'cancelled',
}

@Entity('schedules')
export class Schedule {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    taskId: string;

    @Column({ type: 'timestamp' })
    scheduledAt: Date;

    @Column({
        type: 'enum',
        enum: JobStatus,
        default: JobStatus.PENDING,
    })
    status: JobStatus;

    @Column({ type: 'text', nullable: true })
    result: string;

    @Column({ type: 'text', nullable: true })
    error: string;

    @Column({ type: 'timestamp', nullable: true })
    executedAt: Date;

    @Column({ type: 'timestamp', nullable: true })
    completedAt: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}

