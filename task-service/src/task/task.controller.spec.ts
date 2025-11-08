import { Test, TestingModule } from '@nestjs/testing';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { FileService } from '../file/file.service';

describe('TaskController', () => {
    let controller: TaskController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [TaskController],
            providers: [
                {
                    provide: TaskService,
                    useValue: {
                        findAll: jest.fn(),
                        findById: jest.fn(),
                        create: jest.fn(),
                        update: jest.fn(),
                        delete: jest.fn(),
                    },
                },
                {
                    provide: FileService,
                    useValue: {
                        uploadFile: jest.fn(),
                    },
                },
            ],
        }).compile();

        controller = module.get<TaskController>(TaskController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});

