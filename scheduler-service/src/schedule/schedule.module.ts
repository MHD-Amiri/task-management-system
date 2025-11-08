import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleController } from './schedule.controller';
import { ScheduleService } from './schedule.service';
import { Schedule } from './entities/schedule.entity';
import { ScheduleRepository } from './repositories/schedule.repository';
import { SocketModule } from '../socket/socket.module';

@Module({
    imports: [TypeOrmModule.forFeature([Schedule]), forwardRef(() => SocketModule)],
    controllers: [ScheduleController],
    providers: [
        ScheduleService,
        {
            provide: 'IScheduleRepository',
            useClass: ScheduleRepository,
        },
    ],
    exports: [ScheduleService],
})
export class ScheduleModule { }

