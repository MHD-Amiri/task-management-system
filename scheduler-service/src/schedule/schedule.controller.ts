import {
    Controller,
    Get,
    Post,
    Param,
    Body,
    Version,
} from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { ScheduleResponseDto } from './dto/schedule-response.dto';

@Controller('schedules')
export class ScheduleController {
    constructor(private readonly scheduleService: ScheduleService) { }

    @Get()
    @Version('1')
    async findAll(): Promise<ScheduleResponseDto[]> {
        const schedules = await this.scheduleService.findAll();
        return schedules.map((schedule) => ScheduleResponseDto.fromEntity(schedule));
    }

    @Get('task/:taskId')
    @Version('1')
    async findByTaskId(@Param('taskId') taskId: string): Promise<ScheduleResponseDto[]> {
        const schedules = await this.scheduleService.findByTaskId(taskId);
        return schedules.map((schedule) => ScheduleResponseDto.fromEntity(schedule));
    }

    @Get(':id')
    @Version('1')
    async findOne(@Param('id') id: string): Promise<ScheduleResponseDto> {
        const schedule = await this.scheduleService.findById(id);
        return ScheduleResponseDto.fromEntity(schedule);
    }

    @Post()
    @Version('1')
    async create(@Body() createScheduleDto: CreateScheduleDto): Promise<ScheduleResponseDto> {
        const schedule = await this.scheduleService.create(createScheduleDto);
        return ScheduleResponseDto.fromEntity(schedule);
    }

    @Post(':id/execute')
    @Version('1')
    async execute(@Param('id') id: string): Promise<ScheduleResponseDto> {
        const schedule = await this.scheduleService.executeJob(id);
        return ScheduleResponseDto.fromEntity(schedule);
    }
}

