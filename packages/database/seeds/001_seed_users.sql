-- Seed: 001_seed_users.sql
-- Description: Seed initial users for development and testing
-- Created: 2024-01-01
-- Author: CredChain Team

-- Insert admin users
INSERT INTO users (
    id, username, email, password_hash, first_name, last_name, cpf, phone, 
    date_of_birth, address, kyc_status, kyc_verified_at, role, is_active, 
    is_verified, created_at, updated_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440001',
    'admin',
    'admin@credchain.io',
    '$2b$10$rQZ8K9vQZ8K9vQZ8K9vQZ8O', -- password: admin123
    'Admin',
    'CredChain',
    '12345678901',
    '+5511999999999',
    '1990-01-01',
    '{"street": "Rua das Flores, 123", "city": "São Paulo", "state": "SP", "zip": "01234-567", "country": "BR"}',
    'approved',
    '2024-01-01 00:00:00',
    'admin',
    true,
    true,
    '2024-01-01 00:00:00',
    '2024-01-01 00:00:00'
), (
    '550e8400-e29b-41d4-a716-446655440002',
    'moderator',
    'moderator@credchain.io',
    '$2b$10$rQZ8K9vQZ8K9vQZ8K9vQZ8O', -- password: moderator123
    'Moderator',
    'CredChain',
    '12345678902',
    '+5511999999998',
    '1990-01-01',
    '{"street": "Rua das Flores, 124", "city": "São Paulo", "state": "SP", "zip": "01234-568", "country": "BR"}',
    'approved',
    '2024-01-01 00:00:00',
    'moderator',
    true,
    true,
    '2024-01-01 00:00:00',
    '2024-01-01 00:00:00'
), (
    '550e8400-e29b-41d4-a716-446655440003',
    'analyst',
    'analyst@credchain.io',
    '$2b$10$rQZ8K9vQZ8K9vQZ8K9vQZ8O', -- password: analyst123
    'Analyst',
    'CredChain',
    '12345678903',
    '+5511999999997',
    '1990-01-01',
    '{"street": "Rua das Flores, 125", "city": "São Paulo", "state": "SP", "zip": "01234-569", "country": "BR"}',
    'approved',
    '2024-01-01 00:00:00',
    'analyst',
    true,
    true,
    '2024-01-01 00:00:00',
    '2024-01-01 00:00:00'
);

-- Insert test users
INSERT INTO users (
    id, username, email, password_hash, first_name, last_name, cpf, phone, 
    date_of_birth, address, kyc_status, kyc_verified_at, role, is_active, 
    is_verified, created_at, updated_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440004',
    'joao.silva',
    'joao.silva@email.com',
    '$2b$10$rQZ8K9vQZ8K9vQZ8K9vQZ8O', -- password: user123
    'João',
    'Silva',
    '12345678904',
    '+5511999999996',
    '1985-05-15',
    '{"street": "Rua das Palmeiras, 456", "city": "São Paulo", "state": "SP", "zip": "01234-570", "country": "BR"}',
    'approved',
    '2024-01-01 00:00:00',
    'user',
    true,
    true,
    '2024-01-01 00:00:00',
    '2024-01-01 00:00:00'
), (
    '550e8400-e29b-41d4-a716-446655440005',
    'maria.santos',
    'maria.santos@email.com',
    '$2b$10$rQZ8K9vQZ8K9vQZ8K9vQZ8O', -- password: user123
    'Maria',
    'Santos',
    '12345678905',
    '+5511999999995',
    '1990-08-22',
    '{"street": "Rua das Rosas, 789", "city": "Rio de Janeiro", "state": "RJ", "zip": "20000-000", "country": "BR"}',
    'approved',
    '2024-01-01 00:00:00',
    'user',
    true,
    true,
    '2024-01-01 00:00:00',
    '2024-01-01 00:00:00'
), (
    '550e8400-e29b-41d4-a716-446655440006',
    'pedro.oliveira',
    'pedro.oliveira@email.com',
    '$2b$10$rQZ8K9vQZ8K9vQZ8K9vQZ8O', -- password: user123
    'Pedro',
    'Oliveira',
    '12345678906',
    '+5511999999994',
    '1988-12-10',
    '{"street": "Rua das Margaridas, 321", "city": "Belo Horizonte", "state": "MG", "zip": "30000-000", "country": "BR"}',
    'pending',
    NULL,
    'user',
    true,
    false,
    '2024-01-01 00:00:00',
    '2024-01-01 00:00:00'
), (
    '550e8400-e29b-41d4-a716-446655440007',
    'ana.costa',
    'ana.costa@email.com',
    '$2b$10$rQZ8K9vQZ8K9vQZ8K9vQZ8O', -- password: user123
    'Ana',
    'Costa',
    '12345678907',
    '+5511999999993',
    '1992-03-25',
    '{"street": "Rua das Orquídeas, 654", "city": "Salvador", "state": "BA", "zip": "40000-000", "country": "BR"}',
    'under_review',
    NULL,
    'user',
    true,
    false,
    '2024-01-01 00:00:00',
    '2024-01-01 00:00:00'
), (
    '550e8400-e29b-41d4-a716-446655440008',
    'carlos.ferreira',
    'carlos.ferreira@email.com',
    '$2b$10$rQZ8K9vQZ8K9vQZ8K9vQZ8O', -- password: user123
    'Carlos',
    'Ferreira',
    '12345678908',
    '+5511999999992',
    '1987-11-18',
    '{"street": "Rua das Tulipas, 987", "city": "Porto Alegre", "state": "RS", "zip": "90000-000", "country": "BR"}',
    'rejected',
    NULL,
    'user',
    false,
    false,
    '2024-01-01 00:00:00',
    '2024-01-01 00:00:00'
);

-- Insert institutional users
INSERT INTO users (
    id, username, email, password_hash, first_name, last_name, cpf, phone, 
    date_of_birth, address, kyc_status, kyc_verified_at, role, is_active, 
    is_verified, created_at, updated_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440009',
    'banco.brasil',
    'contato@bancodobrasil.com.br',
    '$2b$10$rQZ8K9vQZ8K9vQZ8K9vQZ8O', -- password: bank123
    'Banco do Brasil',
    'S.A.',
    '00000000000191',
    '+5511300000000',
    '1808-10-12',
    '{"street": "Setor Bancário Sul, Quadra 1, Bloco A", "city": "Brasília", "state": "DF", "zip": "70000-000", "country": "BR"}',
    'approved',
    '2024-01-01 00:00:00',
    'user',
    true,
    true,
    '2024-01-01 00:00:00',
    '2024-01-01 00:00:00'
), (
    '550e8400-e29b-41d4-a716-446655440010',
    'itau',
    'contato@itau.com.br',
    '$2b$10$rQZ8K9vQZ8K9vQZ8K9vQZ8O', -- password: bank123
    'Itaú Unibanco',
    'S.A.',
    '00000000000192',
    '+5511300000001',
    '1944-11-04',
    '{"street": "Praça Alfredo Egydio de Souza Aranha, 100", "city": "São Paulo", "state": "SP", "zip": "01000-000", "country": "BR"}',
    'approved',
    '2024-01-01 00:00:00',
    'user',
    true,
    true,
    '2024-01-01 00:00:00',
    '2024-01-01 00:00:00'
), (
    '550e8400-e29b-41d4-a716-446655440011',
    'bradesco',
    'contato@bradesco.com.br',
    '$2b$10$rQZ8K9vQZ8K9vQZ8K9vQZ8O', -- password: bank123
    'Banco Bradesco',
    'S.A.',
    '00000000000193',
    '+5511300000002',
    '1943-03-10',
    '{"street": "Cidade de Deus, s/n", "city": "Osasco", "state": "SP", "zip": "06000-000", "country": "BR"}',
    'approved',
    '2024-01-01 00:00:00',
    'user',
    true,
    true,
    '2024-01-01 00:00:00',
    '2024-01-01 00:00:00'
);

-- Comments
COMMENT ON TABLE users IS 'Users table seeded with initial data for development and testing';
