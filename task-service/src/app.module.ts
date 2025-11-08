import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskModule } from './task/task.module';
import { FileModule } from './file/file.module';
import { CommunicationModule } from './communication/communication.module';
import { SocketModule } from './socket/socket.module';
import { VersioningModule } from './versioning/versioning.module';
import { HealthModule } from './health/health.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),
        TypeOrmModule.forRootAsync({
            useFactory: () => ({
                type: 'postgres',
                url: process.env.DATABASE_URL,
                entities: [__dirname + '/**/*.entity{.ts,.js}'],
                synchronize: process.env.NODE_ENV !== 'production',
                logging: process.env.NODE_ENV === 'development',
                autoLoadEntities: true,
            }),
        }),
        TaskModule,
        FileModule,
        CommunicationModule,
        SocketModule,
        VersioningModule,
        HealthModule,
    ],
})
export class AppModule { }

