-- Seed: 004_seed_notifications.sql
-- Description: Seed initial notifications for development and testing
-- Created: 2024-01-01
-- Author: CredChain Team

-- Insert notifications for test users
INSERT INTO notifications (
    id, user_id, type, title, message, data, priority, status, channel, 
    sent_at, read_at, expires_at, external_id, template_id, metadata, 
    created_at, updated_at
) VALUES (
    '850e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440004', -- joao.silva
    'score_update',
    'Seu score de crédito foi atualizado!',
    'Seu score de crédito foi atualizado para 750 pontos (Nota A). Continue assim!',
    '{"score": 750, "grade": "A", "previous_score": 720, "change": 30}',
    'high',
    'read',
    'in_app',
    '2024-01-01 10:00:00',
    '2024-01-01 10:05:00',
    '2024-01-08 10:00:00',
    'NOTIF-001',
    'score_update_template',
    '{"category": "credit_score", "importance": "high"}',
    '2024-01-01 10:00:00',
    '2024-01-01 10:05:00'
), (
    '850e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440004', -- joao.silva
    'payment_reminder',
    'Lembrete de pagamento',
    'Você tem um pagamento de R$ 1.500,00 vencendo em 2 dias.',
    '{"amount": 1500.00, "due_date": "2024-01-15", "days_until_due": 2}',
    'normal',
    'unread',
    'in_app',
    '2024-01-13 09:00:00',
    NULL,
    '2024-01-20 09:00:00',
    'NOTIF-002',
    'payment_reminder_template',
    '{"category": "payment", "importance": "normal"}',
    '2024-01-13 09:00:00',
    '2024-01-13 09:00:00'
), (
    '850e8400-e29b-41d4-a716-446655440003',
    '550e8400-e29b-41d4-a716-446655440005', -- maria.santos
    'score_update',
    'Parabéns! Seu score subiu!',
    'Seu score de crédito foi atualizado para 820 pontos (Nota A+). Excelente trabalho!',
    '{"score": 820, "grade": "A+", "previous_score": 750, "change": 70}',
    'high',
    'read',
    'in_app',
    '2024-01-01 11:00:00',
    '2024-01-01 11:02:00',
    '2024-01-08 11:00:00',
    'NOTIF-003',
    'score_update_template',
    '{"category": "credit_score", "importance": "high"}',
    '2024-01-01 11:00:00',
    '2024-01-01 11:02:00'
), (
    '850e8400-e29b-41d4-a716-446655440004',
    '550e8400-e29b-41d4-a716-446655440005', -- maria.santos
    'payment_confirmation',
    'Pagamento confirmado',
    'Seu pagamento de R$ 2.000,00 foi processado com sucesso.',
    '{"amount": 2000.00, "payment_method": "credit_card", "transaction_id": "CC-987654321"}',
    'normal',
    'read',
    'in_app',
    '2024-01-19 14:25:00',
    '2024-01-19 14:30:00',
    '2024-01-26 14:25:00',
    'NOTIF-004',
    'payment_confirmation_template',
    '{"category": "payment", "importance": "normal"}',
    '2024-01-19 14:25:00',
    '2024-01-19 14:30:00'
), (
    '850e8400-e29b-41d4-a716-446655440005',
    '550e8400-e29b-41d4-a716-446655440006', -- pedro.oliveira
    'score_update',
    'Seu score de crédito foi atualizado',
    'Seu score de crédito foi atualizado para 680 pontos (Nota B+). Há espaço para melhoria.',
    '{"score": 680, "grade": "B+", "previous_score": 650, "change": 30}',
    'normal',
    'unread',
    'in_app',
    '2024-01-01 12:00:00',
    NULL,
    '2024-01-08 12:00:00',
    'NOTIF-005',
    'score_update_template',
    '{"category": "credit_score", "importance": "normal"}',
    '2024-01-01 12:00:00',
    '2024-01-01 12:00:00'
), (
    '850e8400-e29b-41d4-a716-446655440006',
    '550e8400-e29b-41d4-a716-446655440006', -- pedro.oliveira
    'payment_reminder',
    'Pagamento em atraso',
    'Você tem um pagamento de R$ 1.200,00 em atraso há 5 dias.',
    '{"amount": 1200.00, "due_date": "2024-04-15", "days_overdue": 5}',
    'urgent',
    'unread',
    'in_app',
    '2024-04-20 08:00:00',
    NULL,
    '2024-04-27 08:00:00',
    'NOTIF-006',
    'payment_overdue_template',
    '{"category": "payment", "importance": "urgent"}',
    '2024-04-20 08:00:00',
    '2024-04-20 08:00:00'
), (
    '850e8400-e29b-41d4-a716-446655440007',
    '550e8400-e29b-41d4-a716-446655440007', -- ana.costa
    'kyc_verification',
    'Verificação de identidade pendente',
    'Sua verificação de identidade está em análise. Aguarde o resultado.',
    '{"status": "under_review", "submitted_at": "2024-01-01", "estimated_time": "3-5 dias úteis"}',
    'normal',
    'unread',
    'in_app',
    '2024-01-01 13:00:00',
    NULL,
    '2024-01-08 13:00:00',
    'NOTIF-007',
    'kyc_verification_template',
    '{"category": "kyc", "importance": "normal"}',
    '2024-01-01 13:00:00',
    '2024-01-01 13:00:00'
), (
    '850e8400-e29b-41d4-a716-446655440008',
    '550e8400-e29b-41d4-a716-446655440008', -- carlos.ferreira
    'payment_failed',
    'Pagamento não processado',
    'Seu pagamento de R$ 300,00 não foi processado. Verifique seus dados e tente novamente.',
    '{"amount": 300.00, "error": "insufficient_funds", "retry_available": true}',
    'high',
    'unread',
    'in_app',
    '2024-02-28 10:00:00',
    NULL,
    '2024-03-07 10:00:00',
    'NOTIF-008',
    'payment_failed_template',
    '{"category": "payment", "importance": "high"}',
    '2024-02-28 10:00:00',
    '2024-02-28 10:00:00'
);

-- Insert system notifications
INSERT INTO notifications (
    id, user_id, type, title, message, data, priority, status, channel, 
    sent_at, read_at, expires_at, external_id, template_id, metadata, 
    created_at, updated_at
) VALUES (
    '850e8400-e29b-41d4-a716-446655440009',
    '550e8400-e29b-41d4-a716-446655440001', -- admin
    'system_maintenance',
    'Manutenção programada',
    'O sistema passará por uma manutenção programada no domingo, 07/01, das 02:00 às 04:00.',
    '{"maintenance_date": "2024-01-07", "start_time": "02:00", "end_time": "04:00", "affected_services": ["api", "blockchain"]}',
    'normal',
    'read',
    'in_app',
    '2024-01-05 18:00:00',
    '2024-01-05 18:05:00',
    '2024-01-12 18:00:00',
    'NOTIF-009',
    'system_maintenance_template',
    '{"category": "system", "importance": "normal"}',
    '2024-01-05 18:00:00',
    '2024-01-05 18:05:00'
), (
    '850e8400-e29b-41d4-a716-446655440010',
    '550e8400-e29b-41d4-a716-446655440001', -- admin
    'security_alert',
    'Alerta de segurança',
    'Detectamos uma tentativa de acesso suspeita à sua conta. Verifique suas atividades recentes.',
    '{"alert_type": "suspicious_login", "ip_address": "192.168.1.100", "location": "São Paulo, SP", "device": "Chrome/Windows"}',
    'urgent',
    'unread',
    'in_app',
    '2024-01-15 14:30:00',
    NULL,
    '2024-01-22 14:30:00',
    'NOTIF-010',
    'security_alert_template',
    '{"category": "security", "importance": "urgent"}',
    '2024-01-15 14:30:00',
    '2024-01-15 14:30:00'
);

-- Insert marketing notifications
INSERT INTO notifications (
    id, user_id, type, title, message, data, priority, status, channel, 
    sent_at, read_at, expires_at, external_id, template_id, metadata, 
    created_at, updated_at
) VALUES (
    '850e8400-e29b-41d4-a716-446655440011',
    '550e8400-e29b-41d4-a716-446655440004', -- joao.silva
    'marketing',
    'Novo recurso disponível!',
    'Agora você pode acompanhar seu score de crédito em tempo real. Confira!',
    '{"feature": "real_time_score", "benefits": ["monitoring", "alerts", "insights"]}',
    'low',
    'unread',
    'in_app',
    '2024-01-10 16:00:00',
    NULL,
    '2024-01-17 16:00:00',
    'NOTIF-011',
    'marketing_template',
    '{"category": "marketing", "importance": "low"}',
    '2024-01-10 16:00:00',
    '2024-01-10 16:00:00'
), (
    '850e8400-e29b-41d4-a716-446655440012',
    '550e8400-e29b-41d4-a716-446655440005', -- maria.santos
    'marketing',
    'Dicas para melhorar seu score',
    'Confira nossas dicas exclusivas para aumentar seu score de crédito ainda mais!',
    '{"tips": ["pagar_em_dia", "diversificar_contas", "manter_histórico"], "personalized": true}',
    'low',
    'read',
    'in_app',
    '2024-01-12 10:00:00',
    '2024-01-12 10:15:00',
    '2024-01-19 10:00:00',
    'NOTIF-012',
    'marketing_template',
    '{"category": "marketing", "importance": "low"}',
    '2024-01-12 10:00:00',
    '2024-01-12 10:15:00'
);

-- Comments
COMMENT ON TABLE notifications IS 'Notifications seeded with initial data for development and testing';
