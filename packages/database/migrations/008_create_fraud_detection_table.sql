-- Migration: 008_create_fraud_detection_table.sql
-- Description: Create fraud_detection table for fraud monitoring
-- Created: 2024-01-01
-- Author: CredChain Team

CREATE TABLE IF NOT EXISTS fraud_detection (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    risk_score DECIMAL(5,2) CHECK (risk_score >= 0 AND risk_score <= 100),
    confidence DECIMAL(5,4) CHECK (confidence >= 0 AND confidence <= 1),
    indicators JSONB NOT NULL,
    patterns JSONB,
    anomalies JSONB,
    ml_model VARCHAR(100),
    model_version VARCHAR(20),
    detection_method VARCHAR(50),
    false_positive BOOLEAN DEFAULT false,
    investigation_status VARCHAR(20) DEFAULT 'pending' CHECK (investigation_status IN ('pending', 'investigating', 'resolved', 'dismissed')),
    investigated_by UUID REFERENCES users(id),
    investigated_at TIMESTAMP,
    resolution_notes TEXT,
    action_taken VARCHAR(100),
    blocked BOOLEAN DEFAULT false,
    blocked_until TIMESTAMP,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_fraud_detection_user_id ON fraud_detection(user_id);
CREATE INDEX IF NOT EXISTS idx_fraud_detection_event_type ON fraud_detection(event_type);
CREATE INDEX IF NOT EXISTS idx_fraud_detection_severity ON fraud_detection(severity);
CREATE INDEX IF NOT EXISTS idx_fraud_detection_risk_score ON fraud_detection(risk_score);
CREATE INDEX IF NOT EXISTS idx_fraud_detection_confidence ON fraud_detection(confidence);
CREATE INDEX IF NOT EXISTS idx_fraud_detection_ml_model ON fraud_detection(ml_model);
CREATE INDEX IF NOT EXISTS idx_fraud_detection_detection_method ON fraud_detection(detection_method);
CREATE INDEX IF NOT EXISTS idx_fraud_detection_false_positive ON fraud_detection(false_positive);
CREATE INDEX IF NOT EXISTS idx_fraud_detection_investigation_status ON fraud_detection(investigation_status);
CREATE INDEX IF NOT EXISTS idx_fraud_detection_investigated_by ON fraud_detection(investigated_by);
CREATE INDEX IF NOT EXISTS idx_fraud_detection_investigated_at ON fraud_detection(investigated_at);
CREATE INDEX IF NOT EXISTS idx_fraud_detection_blocked ON fraud_detection(blocked);
CREATE INDEX IF NOT EXISTS idx_fraud_detection_blocked_until ON fraud_detection(blocked_until);
CREATE INDEX IF NOT EXISTS idx_fraud_detection_created_at ON fraud_detection(created_at);
CREATE INDEX IF NOT EXISTS idx_fraud_detection_user_id_severity ON fraud_detection(user_id, severity);
CREATE INDEX IF NOT EXISTS idx_fraud_detection_user_id_created_at ON fraud_detection(user_id, created_at DESC);

-- Triggers for updated_at
CREATE TRIGGER update_fraud_detection_updated_at 
    BEFORE UPDATE ON fraud_detection 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE fraud_detection IS 'Fraud detection events and monitoring';
COMMENT ON COLUMN fraud_detection.event_type IS 'Type of fraud event detected';
COMMENT ON COLUMN fraud_detection.severity IS 'Severity level of the fraud event';
COMMENT ON COLUMN fraud_detection.risk_score IS 'Risk score from 0 to 100';
COMMENT ON COLUMN fraud_detection.confidence IS 'Confidence level of the detection';
COMMENT ON COLUMN fraud_detection.indicators IS 'Fraud indicators that triggered the detection';
COMMENT ON COLUMN fraud_detection.patterns IS 'Patterns identified in the data';
COMMENT ON COLUMN fraud_detection.anomalies IS 'Anomalies detected in the data';
COMMENT ON COLUMN fraud_detection.ml_model IS 'Machine learning model used';
COMMENT ON COLUMN fraud_detection.model_version IS 'Version of the ML model';
COMMENT ON COLUMN fraud_detection.detection_method IS 'Method used for detection';
COMMENT ON COLUMN fraud_detection.false_positive IS 'Whether this was a false positive';
COMMENT ON COLUMN fraud_detection.investigation_status IS 'Status of the investigation';
COMMENT ON COLUMN fraud_detection.investigated_by IS 'User who investigated the event';
COMMENT ON COLUMN fraud_detection.investigated_at IS 'When the investigation was performed';
COMMENT ON COLUMN fraud_detection.resolution_notes IS 'Notes about the resolution';
COMMENT ON COLUMN fraud_detection.action_taken IS 'Action taken as a result';
COMMENT ON COLUMN fraud_detection.blocked IS 'Whether the user is blocked';
COMMENT ON COLUMN fraud_detection.blocked_until IS 'Until when the user is blocked';
COMMENT ON COLUMN fraud_detection.metadata IS 'Additional metadata';
