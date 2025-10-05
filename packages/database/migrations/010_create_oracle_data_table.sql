-- Migration: 010_create_oracle_data_table.sql
-- Description: Create oracle_data table for external data sources
-- Created: 2024-01-01
-- Author: CredChain Team

CREATE TABLE IF NOT EXISTS oracle_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    data_type VARCHAR(50) NOT NULL,
    source VARCHAR(50) NOT NULL,
    external_id VARCHAR(100),
    data JSONB NOT NULL,
    raw_data JSONB,
    processed_data JSONB,
    confidence DECIMAL(5,4) CHECK (confidence >= 0 AND confidence <= 1),
    quality_score DECIMAL(5,2) CHECK (quality_score >= 0 AND quality_score <= 100),
    validation_status VARCHAR(20) DEFAULT 'pending' CHECK (validation_status IN ('pending', 'validated', 'invalid', 'error')),
    validation_errors JSONB,
    is_verified BOOLEAN DEFAULT false,
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMP,
    expires_at TIMESTAMP,
    last_updated TIMESTAMP,
    update_frequency VARCHAR(20) DEFAULT 'daily' CHECK (update_frequency IN ('realtime', 'hourly', 'daily', 'weekly', 'monthly')),
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    error_message TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_oracle_data_user_id ON oracle_data(user_id);
CREATE INDEX IF NOT EXISTS idx_oracle_data_data_type ON oracle_data(data_type);
CREATE INDEX IF NOT EXISTS idx_oracle_data_source ON oracle_data(source);
CREATE INDEX IF NOT EXISTS idx_oracle_data_external_id ON oracle_data(external_id);
CREATE INDEX IF NOT EXISTS idx_oracle_data_confidence ON oracle_data(confidence);
CREATE INDEX IF NOT EXISTS idx_oracle_data_quality_score ON oracle_data(quality_score);
CREATE INDEX IF NOT EXISTS idx_oracle_data_validation_status ON oracle_data(validation_status);
CREATE INDEX IF NOT EXISTS idx_oracle_data_is_verified ON oracle_data(is_verified);
CREATE INDEX IF NOT EXISTS idx_oracle_data_verified_by ON oracle_data(verified_by);
CREATE INDEX IF NOT EXISTS idx_oracle_data_verified_at ON oracle_data(verified_at);
CREATE INDEX IF NOT EXISTS idx_oracle_data_expires_at ON oracle_data(expires_at);
CREATE INDEX IF NOT EXISTS idx_oracle_data_last_updated ON oracle_data(last_updated);
CREATE INDEX IF NOT EXISTS idx_oracle_data_update_frequency ON oracle_data(update_frequency);
CREATE INDEX IF NOT EXISTS idx_oracle_data_created_at ON oracle_data(created_at);
CREATE INDEX IF NOT EXISTS idx_oracle_data_user_id_data_type ON oracle_data(user_id, data_type);
CREATE INDEX IF NOT EXISTS idx_oracle_data_user_id_source ON oracle_data(user_id, source);

-- Triggers for updated_at
CREATE TRIGGER update_oracle_data_updated_at 
    BEFORE UPDATE ON oracle_data 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE oracle_data IS 'External data from oracles and data providers';
COMMENT ON COLUMN oracle_data.data_type IS 'Type of data (credit_score, payment_history, identity, etc.)';
COMMENT ON COLUMN oracle_data.source IS 'Source of the data (serasa, spc, boa_vista, etc.)';
COMMENT ON COLUMN oracle_data.external_id IS 'External system ID for the data';
COMMENT ON COLUMN oracle_data.data IS 'Processed data in JSON format';
COMMENT ON COLUMN oracle_data.raw_data IS 'Raw data from the source';
COMMENT ON COLUMN oracle_data.processed_data IS 'Data after processing and transformation';
COMMENT ON COLUMN oracle_data.confidence IS 'Confidence level of the data';
COMMENT ON COLUMN oracle_data.quality_score IS 'Quality score of the data';
COMMENT ON COLUMN oracle_data.validation_status IS 'Status of data validation';
COMMENT ON COLUMN oracle_data.validation_errors IS 'Validation errors if any';
COMMENT ON COLUMN oracle_data.is_verified IS 'Whether the data has been verified';
COMMENT ON COLUMN oracle_data.verified_by IS 'User who verified the data';
COMMENT ON COLUMN oracle_data.verified_at IS 'When the data was verified';
COMMENT ON COLUMN oracle_data.expires_at IS 'When the data expires';
COMMENT ON COLUMN oracle_data.last_updated IS 'When the data was last updated';
COMMENT ON COLUMN oracle_data.update_frequency IS 'How often the data should be updated';
COMMENT ON COLUMN oracle_data.retry_count IS 'Number of retry attempts';
COMMENT ON COLUMN oracle_data.max_retries IS 'Maximum number of retry attempts';
COMMENT ON COLUMN oracle_data.error_message IS 'Error message if update failed';
COMMENT ON COLUMN oracle_data.metadata IS 'Additional metadata';
