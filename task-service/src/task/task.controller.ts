import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    UseInterceptors,
    UploadedFile,
    ParseFilePipe,
    MaxFileSizeValidator,
    FileTypeValidator,
    Version,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskResponseDto } from './dto/task-response.dto';
import { TaskResponseV2Dto } from './dto/task-response-v2.dto';
import { FileService } from '../file/file.service';

/**
 * Task Controller - API layer
 * Handles HTTP requests and versioning
 */
@Controller('tasks')
export class TaskController {
    constructor(
        private readonly taskService: TaskService,
        private readonly fileService: FileService,
    ) { }

    @Get()
    @Version('1')
    async findAllV1(): Promise<TaskResponseDto[]> {
        const tasks = await this.taskService.findAll();
        return tasks.map((task) => TaskResponseDto.fromEntity(task));
    }

    @Get()
    @Version('2')
    async findAllV2(): Promise<TaskResponseV2Dto[]> {
        const tasks = await this.taskService.findAll();
        return tasks.map((task) => TaskResponseV2Dto.fromEntity(task));
    }

    @Get(':id')
    @Version('1')
    async findOneV1(@Param('id') id: string): Promise<TaskResponseDto> {
        const task = await this.taskService.findById(id);
        return TaskResponseDto.fromEntity(task);
    }

    @Get(':id')
    @Version('2')
    async findOneV2(@Param('id') id: string): Promise<TaskResponseV2Dto> {
        const task = await this.taskService.findById(id);
        return TaskResponseV2Dto.fromEntity(task);
    }

    @Post()
    @Version('1')
    async createV1(@Body() createTaskDto: CreateTaskDto): Promise<TaskResponseDto> {
        const task = await this.taskService.create(createTaskDto);
        return TaskResponseDto.fromEntity(task);
    }

    @Post()
    @Version('2')
    async createV2(@Body() createTaskDto: CreateTaskDto): Promise<TaskResponseV2Dto> {
        const task = await this.taskService.create(createTaskDto);
        return TaskResponseV2Dto.fromEntity(task);
    }

    @Put(':id')
    @Version('1')
    async updateV1(
        @Param('id') id: string,
        @Body() updateTaskDto: UpdateTaskDto,
    ): Promise<TaskResponseDto> {
        const task = await this.taskService.update(id, updateTaskDto);
        return TaskResponseDto.fromEntity(task);
    }

    @Put(':id')
    @Version('2')
    async updateV2(
        @Param('id') id: string,
        @Body() updateTaskDto: UpdateTaskDto,
    ): Promise<TaskResponseV2Dto> {
        const task = await this.taskService.update(id, updateTaskDto);
        return TaskResponseV2Dto.fromEntity(task);
    }

    @Delete(':id')
    @Version('1')
    async removeV1(@Param('id') id: string): Promise<{ message: string }> {
        await this.taskService.delete(id);
        return { message: 'Task deleted successfully' };
    }

    @Delete(':id')
    @Version('2')
    async removeV2(@Param('id') id: string): Promise<{ message: string; deletedAt: string }> {
        await this.taskService.delete(id);
        return {
            message: 'Task deleted successfully',
            deletedAt: new Date().toISOString(),
        };
    }

    @Post(':id/upload')
    @Version('1')
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(
        @Param('id') id: string,
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
                    new FileTypeValidator({ fileType: /(image|pdf)\// }),
                ],
            }),
        )
        file: Express.Multer.File,
    ): Promise<TaskResponseDto> {
        const task = await this.taskService.findById(id);
        await this.fileService.uploadFile(task, file);
        const updatedTask = await this.taskService.findById(id);
        return TaskResponseDto.fromEntity(updatedTask);
    }

    @Post(':id/upload')
    @Version('2')
    @UseInterceptors(FileInterceptor('file'))
    async uploadFileV2(
        @Param('id') id: string,
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
                    new FileTypeValidator({ fileType: /(image|pdf)\// }),
                ],
            }),
        )
        file: Express.Multer.File,
    ): Promise<TaskResponseV2Dto> {
        const task = await this.taskService.findById(id);
        await this.fileService.uploadFile(task, file);
        const updatedTask = await this.taskService.findById(id);
        return TaskResponseV2Dto.fromEntity(updatedTask);
    }
}

