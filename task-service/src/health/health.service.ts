import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class HealthService {
    constructor(private readonly dataSource: DataSource) { }

    getHealth() {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            service: 'task-service',
        };
    }

    async getReadiness() {
        try {
            await this.dataSource.query('SELECT 1');
            return {
                status: 'ready',
                database: 'connected',
                timestamp: new Date().toISOString(),
            };
        } catch (error) {
            return {
                status: 'not ready',
                database: 'disconnected',
                error: error.message,
                timestamp: new Date().toISOString(),
            };
        }
    }
}

