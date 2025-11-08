import { Test, TestingModule } from '@nestjs/testing';
import { ScheduleService } from './schedule.service';
import { NotFoundException } from '@nestjs/common';
import { IScheduleRepository } from './repositories/schedule.repository.interface';
import { Schedule, JobStatus } from './entities/schedule.entity';
import { SocketGateway } from '../socket/socket.gateway';

describe('ScheduleService', () => {
    let service: ScheduleService;
    let repository: jest.Mocked<IScheduleRepository>;
    let socketGateway: jest.Mocked<SocketGateway>;

    const mockSchedule: Schedule = {
        id: '1',
        taskId: 'task-1',
        scheduledAt: new Date(),
        status: JobStatus.SCHEDULED,
        createdAt: new Date(),
        updatedAt: new Date(),
        result: null,
        error: null,
        executedAt: null,
        completedAt: null,
    };

    beforeEach(async () => {
        const mockRepository = {
            findAll: jest.fn(),
            findById: jest.fn(),
            findByTaskId: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            findPendingJobs: jest.fn(),
        };

        const mockSocketGateway = {
            emit: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ScheduleService,
                {
                    provide: 'IScheduleRepository',
                    useValue: mockRepository,
                },
                {
                    provide: SocketGateway,
                    useValue: mockSocketGateway,
                },
            ],
        }).compile();

        service = module.get<ScheduleService>(ScheduleService);
        repository = module.get('IScheduleRepository');
        socketGateway = module.get(SocketGateway);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should create a schedule and emit event', async () => {
            repository.create.mockResolvedValue(mockSchedule);

            const result = await service.create({
                taskId: 'task-1',
                scheduledAt: new Date().toISOString(),
            });

            expect(result).toEqual(mockSchedule);
            expect(repository.create).toHaveBeenCalled();
            expect(socketGateway.emit).toHaveBeenCalled();
        });
    });

    describe('findById', () => {
        it('should return a schedule by id', async () => {
            repository.findById.mockResolvedValue(mockSchedule);

            const result = await service.findById('1');

            expect(result).toEqual(mockSchedule);
        });

        it('should throw NotFoundException if schedule not found', async () => {
            repository.findById.mockResolvedValue(null);

            await expect(service.findById('1')).rejects.toThrow(NotFoundException);
        });
    });
});

