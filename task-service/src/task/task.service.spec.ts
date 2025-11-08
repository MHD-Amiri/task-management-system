import { Test, TestingModule } from '@nestjs/testing';
import { TaskService } from './task.service';
import { NotFoundException } from '@nestjs/common';
import { ITaskRepository } from './repositories/task.repository.interface';
import { Task, TaskStatus } from './entities/task.entity';
import { TaskEventPublisher } from '../communication/task-event.publisher';
import { SocketGateway } from '../socket/socket.gateway';

describe('TaskService', () => {
    let service: TaskService;
    let repository: jest.Mocked<ITaskRepository>;
    let eventPublisher: jest.Mocked<TaskEventPublisher>;
    let socketGateway: jest.Mocked<SocketGateway>;

    const mockTask: Task = {
        id: '1',
        title: 'Test Task',
        description: 'Test Description',
        status: TaskStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
        attachments: [],
    };

    beforeEach(async () => {
        const mockRepository = {
            findAll: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };

        const mockEventPublisher = {
            publishTaskCreated: jest.fn(),
            publishTaskUpdated: jest.fn(),
            publishTaskDeleted: jest.fn(),
        };

        const mockSocketGateway = {
            emit: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TaskService,
                {
                    provide: 'ITaskRepository',
                    useValue: mockRepository,
                },
                {
                    provide: TaskEventPublisher,
                    useValue: mockEventPublisher,
                },
                {
                    provide: SocketGateway,
                    useValue: mockSocketGateway,
                },
            ],
        }).compile();

        service = module.get<TaskService>(TaskService);
        repository = module.get('ITaskRepository');
        eventPublisher = module.get(TaskEventPublisher);
        socketGateway = module.get(SocketGateway);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('findAll', () => {
        it('should return an array of tasks', async () => {
            repository.findAll.mockResolvedValue([mockTask]);

            const result = await service.findAll();

            expect(result).toEqual([mockTask]);
            expect(repository.findAll).toHaveBeenCalled();
        });
    });

    describe('findById', () => {
        it('should return a task by id', async () => {
            repository.findById.mockResolvedValue(mockTask);

            const result = await service.findById('1');

            expect(result).toEqual(mockTask);
            expect(repository.findById).toHaveBeenCalledWith('1');
        });

        it('should throw NotFoundException if task not found', async () => {
            repository.findById.mockResolvedValue(null);

            await expect(service.findById('1')).rejects.toThrow(NotFoundException);
        });
    });

    describe('create', () => {
        it('should create a task and publish events', async () => {
            repository.create.mockResolvedValue(mockTask);

            const result = await service.create({
                title: 'Test Task',
                description: 'Test Description',
            });

            expect(result).toEqual(mockTask);
            expect(repository.create).toHaveBeenCalled();
            expect(eventPublisher.publishTaskCreated).toHaveBeenCalledWith(mockTask);
            expect(socketGateway.emit).toHaveBeenCalled();
        });
    });

    describe('update', () => {
        it('should update a task and publish events', async () => {
            repository.findById.mockResolvedValue(mockTask);
            repository.update.mockResolvedValue(mockTask);

            const result = await service.update('1', { title: 'Updated Task' });

            expect(result).toEqual(mockTask);
            expect(repository.update).toHaveBeenCalledWith('1', { title: 'Updated Task' });
            expect(eventPublisher.publishTaskUpdated).toHaveBeenCalledWith(mockTask);
            expect(socketGateway.emit).toHaveBeenCalled();
        });
    });

    describe('delete', () => {
        it('should delete a task and publish events', async () => {
            repository.findById.mockResolvedValue(mockTask);
            repository.delete.mockResolvedValue(undefined);

            await service.delete('1');

            expect(repository.delete).toHaveBeenCalledWith('1');
            expect(eventPublisher.publishTaskDeleted).toHaveBeenCalledWith('1');
            expect(socketGateway.emit).toHaveBeenCalled();
        });
    });
});

