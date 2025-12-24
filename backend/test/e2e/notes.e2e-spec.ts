import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { createTestUser } from '../fixtures/test-data';

describe('NotesController (e2e)', () => {
    let app: INestApplication;
    let authToken: string;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe());
        await app.init();

        // Register and Login to get token
        const user = createTestUser('notes');
        await request(app.getHttpServer())
            .post('/auth/register')
            .send(user);

        const loginResponse = await request(app.getHttpServer())
            .post('/auth/login')
            .send({
                email: user.email,
                password: user.password,
            });

        authToken = loginResponse.body.access_token;
    });

    afterAll(async () => {
        await app.close();
    });

    describe('Notes CRUD Flow', () => {
        let noteId: string;

        it('should create a new note', () => {
            return request(app.getHttpServer())
                .post('/notes')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    title: 'Test Note',
                    content: 'This is a test note content',
                })
                .expect(201)
                .expect((res) => {
                    expect(res.body).toHaveProperty('id');
                    expect(res.body.title).toBe('Test Note');
                    noteId = res.body.id;
                });
        });

        it('should get all notes', () => {
            return request(app.getHttpServer())
                .get('/notes')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200)
                .expect((res) => {
                    expect(Array.isArray(res.body)).toBe(true);
                    // Check if at least one note exists (created above)
                    expect(res.body.length).toBeGreaterThan(0);
                });
        });

        it('should get note by id', () => {
            return request(app.getHttpServer())
                .get(`/notes/${noteId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body.id).toBe(noteId);
                });
        });

        it('should update note', () => {
            return request(app.getHttpServer())
                .patch(`/notes/${noteId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    title: 'Updated Test Note',
                })
                .expect(200)
                .expect((res) => {
                    expect(res.body.title).toBe('Updated Test Note');
                });
        });

        it('should delete note', () => {
            return request(app.getHttpServer())
                .delete(`/notes/${noteId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);
        });
    });

    describe('Authorization', () => {
        it('should reject request without token', () => {
            return request(app.getHttpServer())
                .get('/notes')
                .expect(401);
        });

        it('should reject request with invalid token', () => {
            return request(app.getHttpServer())
                .get('/notes')
                .set('Authorization', 'Bearer invalid-token')
                .expect(401);
        });
    });
});
