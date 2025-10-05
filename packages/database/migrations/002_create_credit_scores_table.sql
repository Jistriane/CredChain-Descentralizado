-- Migration: 002_create_credit_scores_table.sql
-- Description: Create credit_scores table with blockchain integration
-- Created: 2024-01-01
-- Author: CredChain Team

CREATE TABLE IF NOT EXISTS credit_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 1000),
    grade VARCHAR(2) NOT NULL CHECK (grade IN ('A+', 'A', 'B+', 'B', 'C+', 'C', 'D+', 'D', 'F')),
    factors JSONB NOT NULL,
    calculation_method VARCHAR(50) NOT NULL,
    model_version VARCHAR(20) NOT NULL,
    confidence_score DECIMAL(5,4) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    data_sources JSONB,
    blockchain_tx_hash VARCHAR(66),
    blockchain_block_number BIGINT,
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_credit_scores_user_id ON credit_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_scores_score ON credit_scores(score);
CREATE INDEX IF NOT EXISTS idx_credit_scores_grade ON credit_scores(grade);
CREATE INDEX IF NOT EXISTS idx_credit_scores_calculated_at ON credit_scores(calculated_at);
CREATE INDEX IF NOT EXISTS idx_credit_scores_blockchain_tx_hash ON credit_scores(blockchain_tx_hash);
CREATE INDEX IF NOT EXISTS idx_credit_scores_is_active ON credit_scores(is_active);
CREATE INDEX IF NOT EXISTS idx_credit_scores_user_id_calculated_at ON credit_scores(user_id, calculated_at DESC);

-- Triggers for updated_at
CREATE TRIGGER update_credit_scores_updated_at 
    BEFORE UPDATE ON credit_scores 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE credit_scores IS 'Credit scores calculated by CredChain AI system';
COMMENT ON COLUMN credit_scores.score IS 'Credit score from 0 to 1000';
COMMENT ON COLUMN credit_scores.grade IS 'Letter grade corresponding to score';
COMMENT ON COLUMN credit_scores.factors IS 'Factors that influenced the score in JSON format';
COMMENT ON COLUMN credit_scores.calculation_method IS 'Method used to calculate the score';
COMMENT ON COLUMN credit_scores.model_version IS 'Version of the AI model used';
COMMENT ON COLUMN credit_scores.confidence_score IS 'Confidence level of the calculation';
COMMENT ON COLUMN credit_scores.data_sources IS 'Sources of data used in calculation';
COMMENT ON COLUMN credit_scores.blockchain_tx_hash IS 'Blockchain transaction hash';
COMMENT ON COLUMN credit_scores.blockchain_block_number IS 'Blockchain block number';
COMMENT ON COLUMN credit_scores.expires_at IS 'When the score expires and needs recalculation';
