import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);

    // Global validation pipe
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    // API Versioning configuration
    const versioningStrategy = configService.get<string>('API_VERSIONING_STRATEGY', 'url');

    if (versioningStrategy === 'url') {
        app.setGlobalPrefix('api');
        app.enableVersioning({
            type: VersioningType.URI,
            defaultVersion: '1',
        });
    } else {
        // Header-based versioning
        app.setGlobalPrefix('api');
        app.enableVersioning({
            type: VersioningType.HEADER,
            header: 'X-API-Version',
            defaultVersion: '1',
        });
    }

    const port = configService.get<number>('PORT', 3001);
    await app.listen(port);
    console.log(`Task Service is running on: http://localhost:${port}`);
}

bootstrap();

