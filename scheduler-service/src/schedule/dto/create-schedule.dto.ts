import { IsString, IsNotEmpty, IsDateString } from 'class-validator';

export class CreateScheduleDto {
    @IsString()
    @IsNotEmpty()
    taskId: string;

    @IsDateString()
    @IsNotEmpty()
    scheduledAt: string;
}

