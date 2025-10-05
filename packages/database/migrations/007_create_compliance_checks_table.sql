-- Migration: 007_create_compliance_checks_table.sql
-- Description: Create compliance_checks table for regulatory compliance
-- Created: 2024-01-01
-- Author: CredChain Team

CREATE TABLE IF NOT EXISTS compliance_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    check_type VARCHAR(50) NOT NULL,
    regulation VARCHAR(20) NOT NULL CHECK (regulation IN ('LGPD', 'GDPR', 'Basel_III', 'PSD2', 'Open_Banking')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'passed', 'failed', 'warning', 'error')),
    score DECIMAL(5,2) CHECK (score >= 0 AND score <= 100),
    details JSONB NOT NULL,
    requirements JSONB,
    violations JSONB,
    recommendations JSONB,
    automated BOOLEAN DEFAULT true,
    checked_by UUID REFERENCES users(id),
    checked_at TIMESTAMP,
    expires_at TIMESTAMP,
    next_check_at TIMESTAMP,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    error_message TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_compliance_checks_user_id ON compliance_checks(user_id);
CREATE INDEX IF NOT EXISTS idx_compliance_checks_check_type ON compliance_checks(check_type);
CREATE INDEX IF NOT EXISTS idx_compliance_checks_regulation ON compliance_checks(regulation);
CREATE INDEX IF NOT EXISTS idx_compliance_checks_status ON compliance_checks(status);
CREATE INDEX IF NOT EXISTS idx_compliance_checks_score ON compliance_checks(score);
CREATE INDEX IF NOT EXISTS idx_compliance_checks_automated ON compliance_checks(automated);
CREATE INDEX IF NOT EXISTS idx_compliance_checks_checked_by ON compliance_checks(checked_by);
CREATE INDEX IF NOT EXISTS idx_compliance_checks_checked_at ON compliance_checks(checked_at);
CREATE INDEX IF NOT EXISTS idx_compliance_checks_expires_at ON compliance_checks(expires_at);
CREATE INDEX IF NOT EXISTS idx_compliance_checks_next_check_at ON compliance_checks(next_check_at);
CREATE INDEX IF NOT EXISTS idx_compliance_checks_created_at ON compliance_checks(created_at);
CREATE INDEX IF NOT EXISTS idx_compliance_checks_user_id_regulation ON compliance_checks(user_id, regulation);
CREATE INDEX IF NOT EXISTS idx_compliance_checks_user_id_status ON compliance_checks(user_id, status);

-- Triggers for updated_at
CREATE TRIGGER update_compliance_checks_updated_at 
    BEFORE UPDATE ON compliance_checks 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE compliance_checks IS 'Compliance checks for regulatory requirements';
COMMENT ON COLUMN compliance_checks.check_type IS 'Type of compliance check (data_protection, consent, etc.)';
COMMENT ON COLUMN compliance_checks.regulation IS 'Regulation being checked (LGPD, GDPR, etc.)';
COMMENT ON COLUMN compliance_checks.status IS 'Status of the compliance check';
COMMENT ON COLUMN compliance_checks.score IS 'Compliance score from 0 to 100';
COMMENT ON COLUMN compliance_checks.details IS 'Detailed results of the check';
COMMENT ON COLUMN compliance_checks.requirements IS 'Requirements that were checked';
COMMENT ON COLUMN compliance_checks.violations IS 'Any violations found';
COMMENT ON COLUMN compliance_checks.recommendations IS 'Recommendations for improvement';
COMMENT ON COLUMN compliance_checks.automated IS 'Whether the check was automated';
COMMENT ON COLUMN compliance_checks.checked_by IS 'User who performed the check';
COMMENT ON COLUMN compliance_checks.checked_at IS 'When the check was performed';
COMMENT ON COLUMN compliance_checks.expires_at IS 'When the compliance check expires';
COMMENT ON COLUMN compliance_checks.next_check_at IS 'When the next check should be performed';
COMMENT ON COLUMN compliance_checks.retry_count IS 'Number of retry attempts';
COMMENT ON COLUMN compliance_checks.max_retries IS 'Maximum number of retry attempts';
COMMENT ON COLUMN compliance_checks.error_message IS 'Error message if check failed';
COMMENT ON COLUMN compliance_checks.metadata IS 'Additional metadata';
