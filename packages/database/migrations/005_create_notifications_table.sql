-- Migration: 005_create_notifications_table.sql
-- Description: Create notifications table for user notifications
-- Created: 2024-01-01
-- Author: CredChain Team

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    status VARCHAR(20) DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'archived', 'deleted')),
    channel VARCHAR(20) DEFAULT 'in_app' CHECK (channel IN ('in_app', 'email', 'sms', 'push', 'webhook')),
    sent_at TIMESTAMP,
    read_at TIMESTAMP,
    archived_at TIMESTAMP,
    expires_at TIMESTAMP,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    error_message TEXT,
    external_id VARCHAR(100),
    template_id VARCHAR(100),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON notifications(priority);
CREATE INDEX IF NOT EXISTS idx_notifications_channel ON notifications(channel);
CREATE INDEX IF NOT EXISTS idx_notifications_sent_at ON notifications(sent_at);
CREATE INDEX IF NOT EXISTS idx_notifications_read_at ON notifications(read_at);
CREATE INDEX IF NOT EXISTS idx_notifications_expires_at ON notifications(expires_at);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_status ON notifications(user_id, status);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_created_at ON notifications(user_id, created_at DESC);

-- Triggers for updated_at
CREATE TRIGGER update_notifications_updated_at 
    BEFORE UPDATE ON notifications 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE notifications IS 'User notifications for CredChain platform';
COMMENT ON COLUMN notifications.type IS 'Type of notification (score_update, payment_reminder, etc.)';
COMMENT ON COLUMN notifications.title IS 'Notification title';
COMMENT ON COLUMN notifications.message IS 'Notification message content';
COMMENT ON COLUMN notifications.data IS 'Additional data for the notification';
COMMENT ON COLUMN notifications.priority IS 'Priority level of the notification';
COMMENT ON COLUMN notifications.status IS 'Current status of the notification';
COMMENT ON COLUMN notifications.channel IS 'Channel used to send the notification';
COMMENT ON COLUMN notifications.sent_at IS 'When the notification was sent';
COMMENT ON COLUMN notifications.read_at IS 'When the notification was read';
COMMENT ON COLUMN notifications.archived_at IS 'When the notification was archived';
COMMENT ON COLUMN notifications.expires_at IS 'When the notification expires';
COMMENT ON COLUMN notifications.retry_count IS 'Number of retry attempts';
COMMENT ON COLUMN notifications.max_retries IS 'Maximum number of retry attempts';
COMMENT ON COLUMN notifications.error_message IS 'Error message if sending failed';
COMMENT ON COLUMN notifications.external_id IS 'External notification system ID';
COMMENT ON COLUMN notifications.template_id IS 'Template used for the notification';
COMMENT ON COLUMN notifications.metadata IS 'Additional metadata';
