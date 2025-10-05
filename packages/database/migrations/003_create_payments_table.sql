-- Migration: 003_create_payments_table.sql
-- Description: Create payments table with blockchain integration
-- Created: 2024-01-01
-- Author: CredChain Team

CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(18,2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(3) DEFAULT 'BRL',
    payment_method VARCHAR(50) NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded')),
    due_date DATE NOT NULL,
    paid_date TIMESTAMP,
    description TEXT,
    reference_number VARCHAR(100),
    external_payment_id VARCHAR(100),
    payment_gateway VARCHAR(50),
    gateway_response JSONB,
    fees DECIMAL(18,2) DEFAULT 0,
    net_amount DECIMAL(18,2),
    blockchain_tx_hash VARCHAR(66),
    blockchain_block_number BIGINT,
    proof_hash VARCHAR(66), -- IPFS/Arweave hash
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_status ON payments(payment_status);
CREATE INDEX IF NOT EXISTS idx_payments_due_date ON payments(due_date);
CREATE INDEX IF NOT EXISTS idx_payments_paid_date ON payments(paid_date);
CREATE INDEX IF NOT EXISTS idx_payments_payment_method ON payments(payment_method);
CREATE INDEX IF NOT EXISTS idx_payments_external_payment_id ON payments(external_payment_id);
CREATE INDEX IF NOT EXISTS idx_payments_blockchain_tx_hash ON payments(blockchain_tx_hash);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);
CREATE INDEX IF NOT EXISTS idx_payments_user_id_due_date ON payments(user_id, due_date);

-- Triggers for updated_at
CREATE TRIGGER update_payments_updated_at 
    BEFORE UPDATE ON payments 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE payments IS 'Payment transactions for CredChain platform';
COMMENT ON COLUMN payments.amount IS 'Payment amount in the specified currency';
COMMENT ON COLUMN payments.currency IS 'Payment currency (BRL, USD, etc.)';
COMMENT ON COLUMN payments.payment_method IS 'Method used for payment (PIX, credit_card, etc.)';
COMMENT ON COLUMN payments.payment_status IS 'Current status of the payment';
COMMENT ON COLUMN payments.due_date IS 'When the payment is due';
COMMENT ON COLUMN payments.paid_date IS 'When the payment was actually paid';
COMMENT ON COLUMN payments.reference_number IS 'Internal reference number';
COMMENT ON COLUMN payments.external_payment_id IS 'External payment system ID';
COMMENT ON COLUMN payments.payment_gateway IS 'Payment gateway used';
COMMENT ON COLUMN payments.gateway_response IS 'Response from payment gateway';
COMMENT ON COLUMN payments.fees IS 'Fees charged for the payment';
COMMENT ON COLUMN payments.net_amount IS 'Net amount after fees';
COMMENT ON COLUMN payments.blockchain_tx_hash IS 'Blockchain transaction hash';
COMMENT ON COLUMN payments.blockchain_block_number IS 'Blockchain block number';
COMMENT ON COLUMN payments.proof_hash IS 'IPFS/Arweave hash for payment proof';
COMMENT ON COLUMN payments.metadata IS 'Additional payment metadata';
