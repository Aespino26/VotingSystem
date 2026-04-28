import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('E-Voting System API (e2e)', () => {
  let app: INestApplication<App>;
  let studentToken: string;
  let adminToken: string;
  let createdCandidateId: number;

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

  // ─────────────────────────────────────────
  // Health Check & Root Endpoints
  // ─────────────────────────────────────────
  describe('Health Checks', () => {
    it('GET / should return Hello World', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect(200)
        .expect('Hello World!');
    });

    it('GET /hello should return E-Voting System welcome message', () => {
      return request(app.getHttpServer())
        .get('/hello')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
          expect(res.body.message).toContain('E-Voting System');
        });
    });
  });

  // ─────────────────────────────────────────
  // Authentication Tests
  // ─────────────────────────────────────────
  describe('Authentication', () => {
    it('POST /auth/register should register a student', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          studentId: 'AB123456',
          name: 'John Doe',
          password: 'password123',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          expect(res.body).toHaveProperty('user');
          expect(res.body.user.role).toBe('student');
          studentToken = res.body.access_token;
        });
    });

    it('POST /auth/register should register an admin', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          studentId: 'ADMIN001',
          name: 'Admin User',
          password: 'adminsecure',
          role: 'admin',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          adminToken = res.body.access_token;
        });
    });

    it('POST /auth/login should authenticate student and return token', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          studentId: 'AB123456',
          password: 'password123',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          studentToken = res.body.access_token;
          expect(res.body.user).toHaveProperty('studentId', 'AB123456');
        });
    });

    it('POST /auth/login with invalid credentials should fail', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          studentId: 'AB123456',
          password: 'wrongpassword',
        })
        .expect(401);
    });

    it('GET /auth/me should return current user when authenticated', () => {
      return request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('studentId', 'AB123456');
          expect(res.body).toHaveProperty('role', 'student');
        });
    });

    it('GET /auth/me should fail without token', () => {
      return request(app.getHttpServer()).get('/auth/me').expect(401);
    });
  });

  // ─────────────────────────────────────────
  // Candidates Tests
  // ─────────────────────────────────────────
  describe('Candidates', () => {
    it('GET /candidates should return all candidates (requires auth)', () => {
      return request(app.getHttpServer())
        .get('/candidates')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('GET /candidates without auth should fail', () => {
      return request(app.getHttpServer()).get('/candidates').expect(401);
    });

    it('POST /candidates should create a candidate (admin only)', () => {
      return request(app.getHttpServer())
        .post('/candidates')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'John Smith',
          description: 'Candidate for President',
          position: 'President',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('name', 'John Smith');
          expect(res.body).toHaveProperty('position', 'President');
          createdCandidateId = res.body.id;
        });
    });

    it('POST /candidates should fail for non-admin user', () => {
      return request(app.getHttpServer())
        .post('/candidates')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          name: 'Another Candidate',
          position: 'Vice President',
        })
        .expect(403);
    });

    it('PUT /candidates/:id should update a candidate (admin only)', () => {
      return request(app.getHttpServer())
        .put(`/candidates/${createdCandidateId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          description: 'Updated description',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('description', 'Updated description');
        });
    });

    it('DELETE /candidates/:id should delete a candidate (admin only)', () => {
      return request(app.getHttpServer())
        .delete(`/candidates/${createdCandidateId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });
  });

  // ─────────────────────────────────────────
  // Voting Tests
  // ─────────────────────────────────────────
  describe('Voting', () => {
    let candidateId: number;

    beforeAll(async () => {
      // Create a candidate for voting
      const res = await request(app.getHttpServer())
        .post('/candidates')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test Candidate',
          description: 'Test',
          position: 'President',
        });
      candidateId = res.body.id;
    });

    it('POST /votes should cast a vote', () => {
      return request(app.getHttpServer())
        .post('/votes')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          candidateId: candidateId,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
        });
    });

    it('GET /votes/me should return user votes', () => {
      return request(app.getHttpServer())
        .get('/votes/me')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('GET /votes/results should return voting results', () => {
      return request(app.getHttpServer())
        .get('/votes/results')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('POST /votes without auth should fail', () => {
      return request(app.getHttpServer())
        .post('/votes')
        .send({
          candidateId: candidateId,
        })
        .expect(401);
    });
  });

  // ─────────────────────────────────────────
  // Error Handling Tests
  // ─────────────────────────────────────────
  describe('Error Handling', () => {
    it('should return 404 for non-existent route', () => {
      return request(app.getHttpServer())
        .get('/api/nonexistent')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(404);
    });

    it('POST /auth/login with missing fields should fail validation', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          studentId: 'AB123456',
          // missing password
        })
        .expect(400);
    });

    it('PUT /candidates/:id with invalid ID should fail', () => {
      return request(app.getHttpServer())
        .put('/candidates/invalid')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Updated',
        })
        .expect(400);
    });
  });
});
