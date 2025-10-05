-- Seed: 002_seed_credit_scores.sql
-- Description: Seed initial credit scores for development and testing
-- Created: 2024-01-01
-- Author: CredChain Team

-- Insert credit scores for test users
INSERT INTO credit_scores (
    id, user_id, score, grade, factors, calculation_method, model_version, 
    confidence_score, data_sources, blockchain_tx_hash, blockchain_block_number, 
    calculated_at, expires_at, is_active, created_at, updated_at
) VALUES (
    '650e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440004', -- joao.silva
    750,
    'A',
    '{"payment_history": 0.35, "credit_utilization": 0.30, "credit_age": 0.15, "credit_mix": 0.10, "new_credit": 0.10}',
    'credchain_ai_v1',
    '1.0.0',
    0.95,
    '["serasa", "spc", "boa_vista", "banking_apis"]',
    '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    12345,
    '2024-01-01 00:00:00',
    '2024-07-01 00:00:00',
    true,
    '2024-01-01 00:00:00',
    '2024-01-01 00:00:00'
), (
    '650e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440005', -- maria.santos
    820,
    'A+',
    '{"payment_history": 0.40, "credit_utilization": 0.25, "credit_age": 0.20, "credit_mix": 0.10, "new_credit": 0.05}',
    'credchain_ai_v1',
    '1.0.0',
    0.98,
    '["serasa", "spc", "boa_vista", "banking_apis"]',
    '0x2345678901bcdef1234567890abcdef1234567890abcdef1234567890abcdef1',
    12346,
    '2024-01-01 00:00:00',
    '2024-07-01 00:00:00',
    true,
    '2024-01-01 00:00:00',
    '2024-01-01 00:00:00'
), (
    '650e8400-e29b-41d4-a716-446655440003',
    '550e8400-e29b-41d4-a716-446655440006', -- pedro.oliveira
    680,
    'B+',
    '{"payment_history": 0.30, "credit_utilization": 0.35, "credit_age": 0.15, "credit_mix": 0.10, "new_credit": 0.10}',
    'credchain_ai_v1',
    '1.0.0',
    0.88,
    '["serasa", "spc", "boa_vista"]',
    '0x3456789012cdef1234567890abcdef1234567890abcdef1234567890abcdef12',
    12347,
    '2024-01-01 00:00:00',
    '2024-07-01 00:00:00',
    true,
    '2024-01-01 00:00:00',
    '2024-01-01 00:00:00'
), (
    '650e8400-e29b-41d4-a716-446655440004',
    '550e8400-e29b-41d4-a716-446655440007', -- ana.costa
    720,
    'A-',
    '{"payment_history": 0.32, "credit_utilization": 0.28, "credit_age": 0.18, "credit_mix": 0.12, "new_credit": 0.10}',
    'credchain_ai_v1',
    '1.0.0',
    0.92,
    '["serasa", "spc", "boa_vista", "banking_apis"]',
    '0x4567890123def1234567890abcdef1234567890abcdef1234567890abcdef123',
    12348,
    '2024-01-01 00:00:00',
    '2024-07-01 00:00:00',
    true,
    '2024-01-01 00:00:00',
    '2024-01-01 00:00:00'
), (
    '650e8400-e29b-41d4-a716-446655440005',
    '550e8400-e29b-41d4-a716-446655440008', -- carlos.ferreira
    580,
    'C+',
    '{"payment_history": 0.25, "credit_utilization": 0.40, "credit_age": 0.15, "credit_mix": 0.10, "new_credit": 0.10}',
    'credchain_ai_v1',
    '1.0.0',
    0.82,
    '["serasa", "spc"]',
    '0x5678901234ef1234567890abcdef1234567890abcdef1234567890abcdef1234',
    12349,
    '2024-01-01 00:00:00',
    '2024-07-01 00:00:00',
    true,
    '2024-01-01 00:00:00',
    '2024-01-01 00:00:00'
);

-- Insert credit scores for institutional users
INSERT INTO credit_scores (
    id, user_id, score, grade, factors, calculation_method, model_version, 
    confidence_score, data_sources, blockchain_tx_hash, blockchain_block_number, 
    calculated_at, expires_at, is_active, created_at, updated_at
) VALUES (
    '650e8400-e29b-41d4-a716-446655440006',
    '550e8400-e29b-41d4-a716-446655440009', -- banco.brasil
    950,
    'A+',
    '{"payment_history": 0.45, "credit_utilization": 0.20, "credit_age": 0.20, "credit_mix": 0.10, "new_credit": 0.05}',
    'credchain_ai_v1',
    '1.0.0',
    0.99,
    '["serasa", "spc", "boa_vista", "banking_apis", "regulatory_data"]',
    '0x6789012345f1234567890abcdef1234567890abcdef1234567890abcdef12345',
    12350,
    '2024-01-01 00:00:00',
    '2024-07-01 00:00:00',
    true,
    '2024-01-01 00:00:00',
    '2024-01-01 00:00:00'
), (
    '650e8400-e29b-41d4-a716-446655440007',
    '550e8400-e29b-41d4-a716-446655440010', -- itau
    920,
    'A+',
    '{"payment_history": 0.42, "credit_utilization": 0.22, "credit_age": 0.20, "credit_mix": 0.11, "new_credit": 0.05}',
    'credchain_ai_v1',
    '1.0.0',
    0.98,
    '["serasa", "spc", "boa_vista", "banking_apis", "regulatory_data"]',
    '0x78901234561234567890abcdef1234567890abcdef1234567890abcdef123456',
    12351,
    '2024-01-01 00:00:00',
    '2024-07-01 00:00:00',
    true,
    '2024-01-01 00:00:00',
    '2024-01-01 00:00:00'
), (
    '650e8400-e29b-41d4-a716-446655440008',
    '550e8400-e29b-41d4-a716-446655440011', -- bradesco
    890,
    'A+',
    '{"payment_history": 0.40, "credit_utilization": 0.25, "credit_age": 0.20, "credit_mix": 0.10, "new_credit": 0.05}',
    'credchain_ai_v1',
    '1.0.0',
    0.97,
    '["serasa", "spc", "boa_vista", "banking_apis", "regulatory_data"]',
    '0x8901234567234567890abcdef1234567890abcdef1234567890abcdef1234567',
    12352,
    '2024-01-01 00:00:00',
    '2024-07-01 00:00:00',
    true,
    '2024-01-01 00:00:00',
    '2024-01-01 00:00:00'
);

-- Insert historical credit scores for joao.silva
INSERT INTO credit_scores (
    id, user_id, score, grade, factors, calculation_method, model_version, 
    confidence_score, data_sources, blockchain_tx_hash, blockchain_block_number, 
    calculated_at, expires_at, is_active, created_at, updated_at
) VALUES (
    '650e8400-e29b-41d4-a716-446655440009',
    '550e8400-e29b-41d4-a716-446655440004', -- joao.silva
    720,
    'A-',
    '{"payment_history": 0.32, "credit_utilization": 0.28, "credit_age": 0.18, "credit_mix": 0.12, "new_credit": 0.10}',
    'credchain_ai_v1',
    '1.0.0',
    0.92,
    '["serasa", "spc", "boa_vista"]',
    '0x901234567834567890abcdef1234567890abcdef1234567890abcdef12345678',
    12340,
    '2023-12-01 00:00:00',
    '2024-06-01 00:00:00',
    false,
    '2023-12-01 00:00:00',
    '2023-12-01 00:00:00'
), (
    '650e8400-e29b-41d4-a716-446655440010',
    '550e8400-e29b-41d4-a716-446655440004', -- joao.silva
    680,
    'B+',
    '{"payment_history": 0.30, "credit_utilization": 0.35, "credit_age": 0.15, "credit_mix": 0.10, "new_credit": 0.10}',
    'credchain_ai_v1',
    '1.0.0',
    0.88,
    '["serasa", "spc"]',
    '0x01234567894567890abcdef1234567890abcdef1234567890abcdef123456789',
    12335,
    '2023-11-01 00:00:00',
    '2024-05-01 00:00:00',
    false,
    '2023-11-01 00:00:00',
    '2023-11-01 00:00:00'
);

-- Comments
COMMENT ON TABLE credit_scores IS 'Credit scores seeded with initial data for development and testing';
