-- Migration: 006_create_ai_conversations_table.sql
-- Description: Create ai_conversations table for ElizaOS chat history
-- Created: 2024-01-01
-- Author: CredChain Team

CREATE TABLE IF NOT EXISTS ai_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id VARCHAR(100) NOT NULL,
    agent_name VARCHAR(50) NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'voice', 'video')),
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    content_metadata JSONB,
    sentiment_analysis JSONB,
    topics JSONB,
    intent VARCHAR(100),
    confidence DECIMAL(5,4),
    response_time INTEGER, -- in milliseconds
    tokens_used INTEGER,
    model_used VARCHAR(100),
    temperature DECIMAL(3,2),
    max_tokens INTEGER,
    stop_reason VARCHAR(50),
    error_message TEXT,
    is_flagged BOOLEAN DEFAULT false,
    flag_reason VARCHAR(100),
    parent_message_id UUID REFERENCES ai_conversations(id),
    thread_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id ON ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_session_id ON ai_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_agent_name ON ai_conversations(agent_name);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_role ON ai_conversations(role);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_message_type ON ai_conversations(message_type);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_intent ON ai_conversations(intent);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_created_at ON ai_conversations(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_is_flagged ON ai_conversations(is_flagged);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_parent_message_id ON ai_conversations(parent_message_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_thread_id ON ai_conversations(thread_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id_session_id ON ai_conversations(user_id, session_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id_created_at ON ai_conversations(user_id, created_at DESC);

-- Triggers for updated_at
CREATE TRIGGER update_ai_conversations_updated_at 
    BEFORE UPDATE ON ai_conversations 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE ai_conversations IS 'AI conversations with ElizaOS agents';
COMMENT ON COLUMN ai_conversations.session_id IS 'Unique session identifier';
COMMENT ON COLUMN ai_conversations.agent_name IS 'Name of the AI agent (orchestrator, credit_analyzer, etc.)';
COMMENT ON COLUMN ai_conversations.message_type IS 'Type of message content';
COMMENT ON COLUMN ai_conversations.role IS 'Role of the message sender';
COMMENT ON COLUMN ai_conversations.content IS 'Message content';
COMMENT ON COLUMN ai_conversations.content_metadata IS 'Metadata about the content';
COMMENT ON COLUMN ai_conversations.sentiment_analysis IS 'Sentiment analysis results';
COMMENT ON COLUMN ai_conversations.topics IS 'Topics extracted from the message';
COMMENT ON COLUMN ai_conversations.intent IS 'Detected intent of the message';
COMMENT ON COLUMN ai_conversations.confidence IS 'Confidence level of the intent detection';
COMMENT ON COLUMN ai_conversations.response_time IS 'Time taken to generate response';
COMMENT ON COLUMN ai_conversations.tokens_used IS 'Number of tokens used';
COMMENT ON COLUMN ai_conversations.model_used IS 'AI model used for generation';
COMMENT ON COLUMN ai_conversations.temperature IS 'Temperature setting for generation';
COMMENT ON COLUMN ai_conversations.max_tokens IS 'Maximum tokens for generation';
COMMENT ON COLUMN ai_conversations.stop_reason IS 'Reason for stopping generation';
COMMENT ON COLUMN ai_conversations.error_message IS 'Error message if generation failed';
COMMENT ON COLUMN ai_conversations.is_flagged IS 'Whether the message is flagged for review';
COMMENT ON COLUMN ai_conversations.flag_reason IS 'Reason for flagging the message';
COMMENT ON COLUMN ai_conversations.parent_message_id IS 'Parent message for threaded conversations';
COMMENT ON COLUMN ai_conversations.thread_id IS 'Thread identifier for grouped messages';
