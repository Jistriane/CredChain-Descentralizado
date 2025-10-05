-- Migration: 009_create_analytics_events_table.sql
-- Description: Create analytics_events table for analytics and metrics
-- Created: 2024-01-01
-- Author: CredChain Team

CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    event_name VARCHAR(100) NOT NULL,
    event_category VARCHAR(50) NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    properties JSONB NOT NULL,
    session_id VARCHAR(100),
    device_id VARCHAR(100),
    platform VARCHAR(20) CHECK (platform IN ('web', 'mobile', 'api', 'system')),
    app_version VARCHAR(20),
    os_version VARCHAR(50),
    browser VARCHAR(50),
    country VARCHAR(2),
    region VARCHAR(50),
    city VARCHAR(100),
    ip_address INET,
    user_agent TEXT,
    referrer VARCHAR(500),
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    utm_term VARCHAR(100),
    utm_content VARCHAR(100),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_name ON analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_category ON analytics_events(event_category);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_device_id ON analytics_events(device_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_platform ON analytics_events(platform);
CREATE INDEX IF NOT EXISTS idx_analytics_events_country ON analytics_events(country);
CREATE INDEX IF NOT EXISTS idx_analytics_events_region ON analytics_events(region);
CREATE INDEX IF NOT EXISTS idx_analytics_events_city ON analytics_events(city);
CREATE INDEX IF NOT EXISTS idx_analytics_events_ip_address ON analytics_events(ip_address);
CREATE INDEX IF NOT EXISTS idx_analytics_events_utm_source ON analytics_events(utm_source);
CREATE INDEX IF NOT EXISTS idx_analytics_events_utm_medium ON analytics_events(utm_medium);
CREATE INDEX IF NOT EXISTS idx_analytics_events_utm_campaign ON analytics_events(utm_campaign);
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON analytics_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id_timestamp ON analytics_events(user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_name_timestamp ON analytics_events(event_name, timestamp DESC);

-- Comments
COMMENT ON TABLE analytics_events IS 'Analytics events for tracking user behavior and system metrics';
COMMENT ON COLUMN analytics_events.event_name IS 'Name of the event (page_view, button_click, etc.)';
COMMENT ON COLUMN analytics_events.event_category IS 'Category of the event (user_action, system_event, etc.)';
COMMENT ON COLUMN analytics_events.event_type IS 'Type of the event (track, identify, page, etc.)';
COMMENT ON COLUMN analytics_events.properties IS 'Event properties and data';
COMMENT ON COLUMN analytics_events.session_id IS 'Session identifier';
COMMENT ON COLUMN analytics_events.device_id IS 'Device identifier';
COMMENT ON COLUMN analytics_events.platform IS 'Platform where the event occurred';
COMMENT ON COLUMN analytics_events.app_version IS 'Application version';
COMMENT ON COLUMN analytics_events.os_version IS 'Operating system version';
COMMENT ON COLUMN analytics_events.browser IS 'Browser used';
COMMENT ON COLUMN analytics_events.country IS 'Country code (ISO 3166-1 alpha-2)';
COMMENT ON COLUMN analytics_events.region IS 'Region or state';
COMMENT ON COLUMN analytics_events.city IS 'City name';
COMMENT ON COLUMN analytics_events.ip_address IS 'IP address of the request';
COMMENT ON COLUMN analytics_events.user_agent IS 'User agent string';
COMMENT ON COLUMN analytics_events.referrer IS 'Referrer URL';
COMMENT ON COLUMN analytics_events.utm_source IS 'UTM source parameter';
COMMENT ON COLUMN analytics_events.utm_medium IS 'UTM medium parameter';
COMMENT ON COLUMN analytics_events.utm_campaign IS 'UTM campaign parameter';
COMMENT ON COLUMN analytics_events.utm_term IS 'UTM term parameter';
COMMENT ON COLUMN analytics_events.utm_content IS 'UTM content parameter';
COMMENT ON COLUMN analytics_events.timestamp IS 'When the event occurred';
