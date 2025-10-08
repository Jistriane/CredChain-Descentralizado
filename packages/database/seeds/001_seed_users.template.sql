-- Seed: 001_seed_users.sql
-- Description: Template for seeding initial users
-- Created: 2024-01-01
-- Author: CredChain Team
-- WARNING: This is a template. Replace with actual production data.

-- Insert admin users (REPLACE WITH ACTUAL ADMIN DATA)
INSERT INTO users (
    id, username, email, password_hash, first_name, last_name, cpf, phone, 
    date_of_birth, address, kyc_status, kyc_verified_at, role, is_active, 
    is_verified, created_at, updated_at
) VALUES (
    'REPLACE_WITH_ACTUAL_ADMIN_ID',
    'REPLACE_WITH_ACTUAL_ADMIN_USERNAME',
    'REPLACE_WITH_ACTUAL_ADMIN_EMAIL',
    'REPLACE_WITH_ACTUAL_PASSWORD_HASH',
    'REPLACE_WITH_ACTUAL_FIRST_NAME',
    'REPLACE_WITH_ACTUAL_LAST_NAME',
    'REPLACE_WITH_ACTUAL_CPF',
    'REPLACE_WITH_ACTUAL_PHONE',
    'REPLACE_WITH_ACTUAL_DATE_OF_BIRTH',
    'REPLACE_WITH_ACTUAL_ADDRESS_JSON',
    'approved',
    'REPLACE_WITH_ACTUAL_VERIFICATION_DATE',
    'admin',
    true,
    true,
    'REPLACE_WITH_ACTUAL_CREATION_DATE',
    'REPLACE_WITH_ACTUAL_UPDATE_DATE'
);

-- Comments
COMMENT ON TABLE users IS 'Users table - PRODUCTION DATA ONLY';
