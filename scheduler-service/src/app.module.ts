import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from './schedule/schedule.module';
import { EventListenerModule } from './event-listener/event-listener.module';
import { SocketModule } from './socket/socket.module';
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
        ScheduleModule,
        EventListenerModule,
        SocketModule,
        HealthModule,
    ],
})
export class AppModule { }

