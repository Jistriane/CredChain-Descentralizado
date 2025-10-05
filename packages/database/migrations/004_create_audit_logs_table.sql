-- Migration: 004_create_audit_logs_table.sql
-- Description: Create audit_logs table for compliance and security
-- Created: 2024-01-01
-- Author: CredChain Team

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL,
    actor_id UUID REFERENCES users(id),
    actor_type VARCHAR(20) DEFAULT 'user' CHECK (actor_type IN ('user', 'system', 'admin', 'api')),
    old_values JSONB,
    new_values JSONB,
    changes JSONB,
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(100),
    request_id VARCHAR(100),
    endpoint VARCHAR(255),
    method VARCHAR(10),
    status_code INTEGER,
    response_time INTEGER, -- in milliseconds
    error_message TEXT,
    severity VARCHAR(20) DEFAULT 'info' CHECK (severity IN ('debug', 'info', 'warn', 'error', 'critical')),
    tags JSONB,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_id ON audit_logs(entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_type ON audit_logs(actor_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_severity ON audit_logs(severity);
CREATE INDEX IF NOT EXISTS idx_audit_logs_ip_address ON audit_logs(ip_address);
CREATE INDEX IF NOT EXISTS idx_audit_logs_session_id ON audit_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_request_id ON audit_logs(request_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type_entity_id ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id_created_at ON audit_logs(actor_id, created_at DESC);

-- Comments
COMMENT ON TABLE audit_logs IS 'Audit logs for compliance and security tracking';
COMMENT ON COLUMN audit_logs.entity_type IS 'Type of entity being audited (user, payment, score, etc.)';
COMMENT ON COLUMN audit_logs.entity_id IS 'ID of the entity being audited';
COMMENT ON COLUMN audit_logs.action IS 'Action performed (create, update, delete, login, etc.)';
COMMENT ON COLUMN audit_logs.actor_id IS 'ID of the user/system performing the action';
COMMENT ON COLUMN audit_logs.actor_type IS 'Type of actor (user, system, admin, api)';
COMMENT ON COLUMN audit_logs.old_values IS 'Previous values before the change';
COMMENT ON COLUMN audit_logs.new_values IS 'New values after the change';
COMMENT ON COLUMN audit_logs.changes IS 'Summary of changes made';
COMMENT ON COLUMN audit_logs.ip_address IS 'IP address of the request';
COMMENT ON COLUMN audit_logs.user_agent IS 'User agent of the request';
COMMENT ON COLUMN audit_logs.session_id IS 'Session ID of the request';
COMMENT ON COLUMN audit_logs.request_id IS 'Unique request ID';
COMMENT ON COLUMN audit_logs.endpoint IS 'API endpoint accessed';
COMMENT ON COLUMN audit_logs.method IS 'HTTP method used';
COMMENT ON COLUMN audit_logs.status_code IS 'HTTP status code returned';
COMMENT ON COLUMN audit_logs.response_time IS 'Response time in milliseconds';
COMMENT ON COLUMN audit_logs.error_message IS 'Error message if any';
COMMENT ON COLUMN audit_logs.severity IS 'Severity level of the log entry';
COMMENT ON COLUMN audit_logs.tags IS 'Tags for categorization';
COMMENT ON COLUMN audit_logs.metadata IS 'Additional metadata';
