import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { Task } from './entities/task.entity';
import { TaskRepository } from './repositories/task.repository';
import { CommunicationModule } from '../communication/communication.module';
import { FileModule } from '../file/file.module';
import { SocketModule } from '../socket/socket.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Task]),
        CommunicationModule,
        FileModule,
        SocketModule,
    ],
    controllers: [TaskController],
    providers: [
        TaskService,
        {
            provide: 'ITaskRepository',
            useClass: TaskRepository,
        },
    ],
    exports: [TaskService],
})
export class TaskModule { }

