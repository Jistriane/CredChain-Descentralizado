-- CredChain Database Schema
-- PostgreSQL initialization script

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Schema principal
CREATE SCHEMA IF NOT EXISTS credchain;

-- Tabela de usuários
CREATE TABLE credchain.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_address VARCHAR(48) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    kyc_status VARCHAR(20) DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'approved', 'rejected')),
    is_active BOOLEAN DEFAULT true,
    metadata JSONB
);

-- Tabela de scores de crédito
CREATE TABLE credchain.credit_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES credchain.users(id) ON DELETE CASCADE,
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 1000),
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    blockchain_tx VARCHAR(66), -- Hash da transação
    is_verified BOOLEAN DEFAULT false,
    verification_count INTEGER DEFAULT 0,
    score_hash VARCHAR(66), -- Hash único do score
    factors JSONB, -- Fatores que influenciaram o score
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de pagamentos
CREATE TABLE credchain.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES credchain.users(id) ON DELETE CASCADE,
    amount DECIMAL(18,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    due_date DATE NOT NULL,
    paid_date DATE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'late', 'defaulted')),
    proof_hash VARCHAR(66), -- IPFS/Arweave hash
    blockchain_tx VARCHAR(66), -- Hash da transação blockchain
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de fatores de score
CREATE TABLE credchain.score_factors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES credchain.users(id) ON DELETE CASCADE,
    factor_type VARCHAR(50) NOT NULL,
    value INTEGER NOT NULL,
    weight INTEGER NOT NULL CHECK (weight >= 1 AND weight <= 100),
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- Tabela de histórico de scores
CREATE TABLE credchain.score_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES credchain.users(id) ON DELETE CASCADE,
    old_score INTEGER,
    new_score INTEGER NOT NULL,
    change_reason VARCHAR(50) NOT NULL,
    factors JSONB,
    blockchain_tx VARCHAR(66),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de verificação de identidade
CREATE TABLE credchain.identity_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES credchain.users(id) ON DELETE CASCADE,
    verification_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
    document_hash VARCHAR(66), -- Hash do documento
    verification_data JSONB,
    verified_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de logs de auditoria
CREATE TABLE credchain.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL,
    actor_id UUID,
    actor_type VARCHAR(20) DEFAULT 'user' CHECK (actor_type IN ('user', 'system', 'admin')),
    old_values JSONB,
    new_values JSONB,
    metadata JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de integração com oráculos
CREATE TABLE credchain.oracle_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source VARCHAR(50) NOT NULL,
    data_type VARCHAR(50) NOT NULL,
    data_value JSONB NOT NULL,
    confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    blockchain_tx VARCHAR(66),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Tabela de notificações
CREATE TABLE credchain.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES credchain.users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_users_wallet_address ON credchain.users(wallet_address);
CREATE INDEX idx_users_email ON credchain.users(email);
CREATE INDEX idx_users_kyc_status ON credchain.users(kyc_status);

CREATE INDEX idx_credit_scores_user_id ON credchain.credit_scores(user_id);
CREATE INDEX idx_credit_scores_score ON credchain.credit_scores(score);
CREATE INDEX idx_credit_scores_calculated_at ON credchain.credit_scores(calculated_at);
CREATE INDEX idx_credit_scores_blockchain_tx ON credchain.credit_scores(blockchain_tx);

CREATE INDEX idx_payments_user_id ON credchain.payments(user_id);
CREATE INDEX idx_payments_status ON credchain.payments(status);
CREATE INDEX idx_payments_due_date ON credchain.payments(due_date);
CREATE INDEX idx_payments_blockchain_tx ON credchain.payments(blockchain_tx);

CREATE INDEX idx_score_factors_user_id ON credchain.score_factors(user_id);
CREATE INDEX idx_score_factors_factor_type ON credchain.score_factors(factor_type);
CREATE INDEX idx_score_factors_is_active ON credchain.score_factors(is_active);

CREATE INDEX idx_score_history_user_id ON credchain.score_history(user_id);
CREATE INDEX idx_score_history_created_at ON credchain.score_history(created_at);

CREATE INDEX idx_identity_verifications_user_id ON credchain.identity_verifications(user_id);
CREATE INDEX idx_identity_verifications_status ON credchain.identity_verifications(status);
CREATE INDEX idx_identity_verifications_verification_type ON credchain.identity_verifications(verification_type);

CREATE INDEX idx_audit_logs_entity ON credchain.audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_actor ON credchain.audit_logs(actor_id);
CREATE INDEX idx_audit_logs_created_at ON credchain.audit_logs(created_at);

CREATE INDEX idx_oracle_data_source ON credchain.oracle_data(source);
CREATE INDEX idx_oracle_data_type ON credchain.oracle_data(data_type);
CREATE INDEX idx_oracle_data_created_at ON credchain.oracle_data(created_at);

CREATE INDEX idx_notifications_user_id ON credchain.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON credchain.notifications(is_read);
CREATE INDEX idx_notifications_created_at ON credchain.notifications(created_at);

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION credchain.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON credchain.users
    FOR EACH ROW EXECUTE FUNCTION credchain.update_updated_at_column();

CREATE TRIGGER update_credit_scores_updated_at BEFORE UPDATE ON credchain.credit_scores
    FOR EACH ROW EXECUTE FUNCTION credchain.update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON credchain.payments
    FOR EACH ROW EXECUTE FUNCTION credchain.update_updated_at_column();

-- Função para calcular score médio
CREATE OR REPLACE FUNCTION credchain.calculate_average_score(p_user_id UUID)
RETURNS DECIMAL AS $$
DECLARE
    avg_score DECIMAL;
BEGIN
    SELECT AVG(score) INTO avg_score
    FROM credchain.credit_scores
    WHERE user_id = p_user_id
    AND calculated_at >= NOW() - INTERVAL '1 year';
    
    RETURN COALESCE(avg_score, 0);
END;
$$ LANGUAGE plpgsql;

-- Função para obter histórico de pagamentos
CREATE OR REPLACE FUNCTION credchain.get_payment_history(p_user_id UUID, p_months INTEGER DEFAULT 12)
RETURNS TABLE (
    month_year TEXT,
    total_payments INTEGER,
    on_time_payments INTEGER,
    late_payments INTEGER,
    defaulted_payments INTEGER,
    payment_rate DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        TO_CHAR(created_at, 'YYYY-MM') as month_year,
        COUNT(*)::INTEGER as total_payments,
        COUNT(CASE WHEN status = 'paid' AND paid_date <= due_date THEN 1 END)::INTEGER as on_time_payments,
        COUNT(CASE WHEN status = 'late' THEN 1 END)::INTEGER as late_payments,
        COUNT(CASE WHEN status = 'defaulted' THEN 1 END)::INTEGER as defaulted_payments,
        ROUND(
            (COUNT(CASE WHEN status = 'paid' AND paid_date <= due_date THEN 1 END)::DECIMAL / 
             NULLIF(COUNT(*), 0)) * 100, 2
        ) as payment_rate
    FROM credchain.payments
    WHERE user_id = p_user_id
    AND created_at >= NOW() - (p_months || ' months')::INTERVAL
    GROUP BY TO_CHAR(created_at, 'YYYY-MM')
    ORDER BY month_year DESC;
END;
$$ LANGUAGE plpgsql;

-- Inserir dados iniciais
INSERT INTO credchain.users (wallet_address, email, kyc_status) VALUES
('5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY', 'admin@credchain.io', 'approved'),
('5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty', 'test@credchain.io', 'approved');

-- Comentários das tabelas
COMMENT ON TABLE credchain.users IS 'Usuários do sistema CredChain';
COMMENT ON TABLE credchain.credit_scores IS 'Scores de crédito dos usuários';
COMMENT ON TABLE credchain.payments IS 'Histórico de pagamentos';
COMMENT ON TABLE credchain.score_factors IS 'Fatores que influenciam o score';
COMMENT ON TABLE credchain.score_history IS 'Histórico de mudanças de score';
COMMENT ON TABLE credchain.identity_verifications IS 'Verificações de identidade';
COMMENT ON TABLE credchain.audit_logs IS 'Logs de auditoria do sistema';
COMMENT ON TABLE credchain.oracle_data IS 'Dados de oráculos externos';
COMMENT ON TABLE credchain.notifications IS 'Notificações dos usuários';
