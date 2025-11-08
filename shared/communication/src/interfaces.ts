/**
 * Communication strategy interface
 * Follows Strategy Pattern for pluggable communication methods
 */

export interface TaskEvent {
    type: 'task.created' | 'task.updated' | 'task.deleted';
    taskId: string;
    data: any;
    timestamp: string;
}

export interface ICommunicationStrategy {
    /**
     * Send an event to the target service
     */
    send(event: TaskEvent): Promise<void>;

    /**
     * Initialize the communication strategy
     */
    initialize(): Promise<void>;

    /**
     * Cleanup resources
     */
    destroy(): Promise<void>;
}

export enum CommunicationMode {
    HTTP = 'http',
    SOCKETIO = 'socketio',
    REDIS = 'redis',
}

