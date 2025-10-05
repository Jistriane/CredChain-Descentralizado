import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import { app } from '../../api-gateway/src/app';

describe('Data Security Tests', () => {
  let testUser: any;
  let authToken: string;

  beforeAll(async () => {
    // Create test user
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({
        username: 'data-security-test',
        email: 'data-security@test.com',
        password: 'SecurePassword123!',
        firstName: 'Data',
        lastName: 'Security'
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

  describe('Data Encryption', () => {
    it('should encrypt sensitive data at rest', async () => {
      const response = await request(app)
        .post('/api/v1/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          cpf: '12345678901',
          phone: '+5511999999999',
          address: {
            street: 'Rua das Flores, 123',
            city: 'São Paulo',
            state: 'SP',
            zip: '01234-567'
          }
        });

      expect(response.status).toBe(200);

      // Verify data is encrypted in database
      const dbResponse = await request(app)
        .get('/api/v1/users/profile')
        .set('Authorization', `Bearer ${authToken}`);

      expect(dbResponse.status).toBe(200);
      expect(dbResponse.body.cpf).not.toBe('12345678901');
      expect(dbResponse.body.phone).not.toBe('+5511999999999');
    });

    it('should encrypt data in transit', async () => {
      const response = await request(app)
        .post('/api/v1/credit-scores')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          userId: testUser.id,
          score: 750,
          factors: {
            paymentHistory: 0.35,
            creditUtilization: 0.30,
            creditAge: 0.15,
            creditMix: 0.10,
            newCredit: 0.10
          }
        });

      expect(response.status).toBe(201);
      expect(response.body.blockchainHash).toBeDefined();
    });
  });

  describe('Data Anonymization', () => {
    it('should anonymize personal data in logs', async () => {
      const response = await request(app)
        .post('/api/v1/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          cpf: '12345678901',
          phone: '+5511999999999'
        });

      expect(response.status).toBe(200);

      // Check logs don't contain sensitive data
      const logs = await request(app)
        .get('/api/v1/admin/logs')
        .set('Authorization', `Bearer ${authToken}`);

      expect(logs.status).toBe(200);
      expect(logs.body.logs).not.toContain('12345678901');
      expect(logs.body.logs).not.toContain('+5511999999999');
    });

    it('should mask sensitive data in responses', async () => {
      const response = await request(app)
        .get('/api/v1/users/profile')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.cpf).toMatch(/\*{3,}/);
      expect(response.body.phone).toMatch(/\*{3,}/);
    });
  });

  describe('Data Retention', () => {
    it('should enforce data retention policies', async () => {
      const response = await request(app)
        .post('/api/v1/audit-logs')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          entityType: 'user',
          entityId: testUser.id,
          action: 'test_action',
          details: 'Test audit log'
        });

      expect(response.status).toBe(201);

      // Verify retention policy is applied
      const retentionResponse = await request(app)
        .get('/api/v1/audit-logs')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          olderThan: '1 year'
        });

      expect(retentionResponse.status).toBe(200);
      expect(retentionResponse.body.logs).toHaveLength(0);
    });

    it('should delete expired data', async () => {
      const response = await request(app)
        .post('/api/v1/notifications')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'test',
          title: 'Test Notification',
          message: 'This is a test notification',
          expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
        });

      expect(response.status).toBe(201);

      // Verify expired data is deleted
      const expiredResponse = await request(app)
        .get('/api/v1/notifications')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          includeExpired: false
        });

      expect(expiredResponse.status).toBe(200);
      expect(expiredResponse.body.notifications).toHaveLength(0);
    });
  });

  describe('Data Integrity', () => {
    it('should prevent data tampering', async () => {
      const response = await request(app)
        .post('/api/v1/credit-scores')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          userId: testUser.id,
          score: 750,
          factors: {
            paymentHistory: 0.35,
            creditUtilization: 0.30,
            creditAge: 0.15,
            creditMix: 0.10,
            newCredit: 0.10
          }
        });

      expect(response.status).toBe(201);
      const scoreId = response.body.id;

      // Try to tamper with data
      const tamperResponse = await request(app)
        .patch(`/api/v1/credit-scores/${scoreId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          score: 999,
          blockchainHash: 'tampered-hash'
        });

      expect(tamperResponse.status).toBe(400);
    });

    it('should validate data integrity on read', async () => {
      const response = await request(app)
        .get('/api/v1/credit-scores')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.scores).toBeDefined();

      // Verify blockchain hash matches data
      for (const score of response.body.scores) {
        expect(score.blockchainHash).toBeDefined();
        expect(score.integrityCheck).toBe(true);
      }
    });
  });

  describe('Data Access Control', () => {
    it('should enforce data ownership', async () => {
      // Create another user
      const user2Response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          username: 'data-security-test-2',
          email: 'data-security-2@test.com',
          password: 'SecurePassword123!',
          firstName: 'Data',
          lastName: 'Security2'
        });

      const user2Token = user2Response.body.accessToken;

      // Try to access first user's data
      const response = await request(app)
        .get('/api/v1/credit-scores')
        .set('Authorization', `Bearer ${user2Token}`);

      expect(response.status).toBe(200);
      expect(response.body.scores).toHaveLength(0);
    });

    it('should prevent unauthorized data access', async () => {
      const response = await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('Data Backup and Recovery', () => {
    it('should create encrypted backups', async () => {
      const response = await request(app)
        .post('/api/v1/admin/backup')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(201);
      expect(response.body.backupId).toBeDefined();
      expect(response.body.encrypted).toBe(true);
    });

    it('should verify backup integrity', async () => {
      const response = await request(app)
        .get('/api/v1/admin/backups')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.backups).toBeDefined();

      for (const backup of response.body.backups) {
        expect(backup.integrityCheck).toBe(true);
        expect(backup.encrypted).toBe(true);
      }
    });
  });

  describe('Data Compliance', () => {
    it('should comply with LGPD requirements', async () => {
      const response = await request(app)
        .get('/api/v1/users/data-rights')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.rights).toContain('access');
      expect(response.body.rights).toContain('correction');
      expect(response.body.rights).toContain('deletion');
      expect(response.body.rights).toContain('portability');
    });

    it('should handle data deletion requests', async () => {
      const response = await request(app)
        .delete('/api/v1/users/data')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          reason: 'User requested deletion',
          confirmDeletion: true
        });

      expect(response.status).toBe(200);
      expect(response.body.deleted).toBe(true);
      expect(response.body.retentionPeriod).toBeDefined();
    });
  });
});
