import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileAttachment } from './entities/file-attachment.entity';
import { FileService } from './file.service';
import { SocketModule } from '../socket/socket.module';

@Module({
    imports: [TypeOrmModule.forFeature([FileAttachment]), SocketModule],
    providers: [FileService],
    exports: [FileService],
})
export class FileModule { }

