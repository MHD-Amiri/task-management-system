import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';

describe('TaskController (e2e)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe());
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    it('/api/v1/tasks (GET) - should return empty array initially', () => {
        return request(app.getHttpServer())
            .get('/api/v1/tasks')
            .expect(200)
            .expect((res) => {
                expect(Array.isArray(res.body)).toBe(true);
            });
    });

    it('/api/v1/tasks (POST) - should create a task', () => {
        return request(app.getHttpServer())
            .post('/api/v1/tasks')
            .send({
                title: 'Test Task',
                description: 'Test Description',
            })
            .expect(201)
            .expect((res) => {
                expect(res.body).toHaveProperty('id');
                expect(res.body.title).toBe('Test Task');
            });
    });
});

