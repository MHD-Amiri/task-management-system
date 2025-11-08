/**
 * Shared Socket.IO event definitions
 * Used by both Task Service and Scheduler Service
 */

export enum SocketEvents {
    // Task events
    TASK_CREATED = 'task.created',
    TASK_UPDATED = 'task.updated',
    TASK_DELETED = 'task.deleted',
    TASK_FILE_UPLOADED = 'task.file.uploaded',

    // Job events
    JOB_CREATED = 'job.created',
    JOB_EXECUTED = 'job.executed',
    JOB_FAILED = 'job.failed',
    JOB_COMPLETED = 'job.completed',

    // Connection events
    CONNECT = 'connect',
    DISCONNECT = 'disconnect',
}

export interface TaskCreatedEvent {
    id: string;
    title: string;
    description?: string;
    status: string;
    createdAt: string;
}

export interface TaskUpdatedEvent {
    id: string;
    title?: string;
    description?: string;
    status?: string;
    updatedAt: string;
}

export interface TaskDeletedEvent {
    id: string;
    deletedAt: string;
}

export interface TaskFileUploadedEvent {
    taskId: string;
    fileId: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    uploadedAt: string;
}

export interface JobCreatedEvent {
    id: string;
    taskId: string;
    scheduledAt: string;
    createdAt: string;
}

export interface JobExecutedEvent {
    id: string;
    taskId: string;
    executedAt: string;
    status: 'success' | 'failed';
    result?: any;
}

export interface JobFailedEvent {
    id: string;
    taskId: string;
    failedAt: string;
    error: string;
}

export interface JobCompletedEvent {
    id: string;
    taskId: string;
    completedAt: string;
    duration: number;
}

