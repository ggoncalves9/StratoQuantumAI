-- Strato Quantum Platform - Table Creation
-- Create all necessary tables for the platform

-- Users table (auth schema)
CREATE TABLE IF NOT EXISTS auth.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User sessions table
CREATE TABLE IF NOT EXISTS auth.user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    refresh_token_hash VARCHAR(255),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

-- Workspaces table
CREATE TABLE IF NOT EXISTS workspaces.workspaces (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(10),
    color VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workspace modules table
CREATE TABLE IF NOT EXISTS workspaces.modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id VARCHAR(50) REFERENCES workspaces.workspaces(id),
    module_id VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(workspace_id, module_id)
);

-- User workspace access
CREATE TABLE IF NOT EXISTS workspaces.user_access (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    workspace_id VARCHAR(50) REFERENCES workspaces.workspaces(id),
    role VARCHAR(50) DEFAULT 'viewer', -- viewer, editor, admin
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    granted_by UUID REFERENCES auth.users(id),
    UNIQUE(user_id, workspace_id)
);

-- AI Agents table
CREATE TABLE IF NOT EXISTS agents.agents (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    short_name VARCHAR(10),
    description TEXT,
    workspace_id VARCHAR(50) REFERENCES workspaces.workspaces(id),
    status VARCHAR(20) DEFAULT 'online', -- online, offline, maintenance
    capabilities JSONB DEFAULT '[]',
    config JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agent conversations
CREATE TABLE IF NOT EXISTS agents.conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id VARCHAR(50) REFERENCES agents.agents(id),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    conversation_id VARCHAR(255), -- For grouping messages
    title VARCHAR(255),
    status VARCHAR(20) DEFAULT 'active', -- active, archived, deleted
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agent messages
CREATE TABLE IF NOT EXISTS agents.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES agents.conversations(id) ON DELETE CASCADE,
    sender_type VARCHAR(20) NOT NULL, -- user, agent
    sender_id VARCHAR(255), -- user_id or agent_id
    message_text TEXT NOT NULL,
    message_type VARCHAR(50) DEFAULT 'text', -- text, image, file, action
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team chat conversations
CREATE TABLE IF NOT EXISTS chat.team_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255),
    type VARCHAR(20) DEFAULT 'direct', -- direct, group, channel
    participants JSONB NOT NULL, -- Array of user IDs or persona IDs
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team chat messages
CREATE TABLE IF NOT EXISTS chat.team_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES chat.team_conversations(id) ON DELETE CASCADE,
    sender_id VARCHAR(255) NOT NULL, -- user_id or persona_id
    sender_type VARCHAR(20) DEFAULT 'user', -- user, persona
    message_text TEXT NOT NULL,
    message_type VARCHAR(50) DEFAULT 'text',
    reply_to UUID REFERENCES chat.team_messages(id),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_read BOOLEAN DEFAULT false
);

-- Analytics events
CREATE TABLE IF NOT EXISTS analytics.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    event_type VARCHAR(100) NOT NULL,
    event_name VARCHAR(255) NOT NULL,
    workspace_id VARCHAR(50),
    module_id VARCHAR(50),
    agent_id VARCHAR(50),
    properties JSONB DEFAULT '{}',
    session_id VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System metrics
CREATE TABLE IF NOT EXISTS analytics.system_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_name VARCHAR(100) NOT NULL,
    metric_value NUMERIC NOT NULL,
    metric_unit VARCHAR(20),
    tags JSONB DEFAULT '{}',
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON auth.users(email);
CREATE INDEX IF NOT EXISTS idx_users_active ON auth.users(is_active);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON auth.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON auth.user_sessions(expires_at);

CREATE INDEX IF NOT EXISTS idx_modules_workspace ON workspaces.modules(workspace_id);
CREATE INDEX IF NOT EXISTS idx_user_access_user ON workspaces.user_access(user_id);
CREATE INDEX IF NOT EXISTS idx_user_access_workspace ON workspaces.user_access(workspace_id);

CREATE INDEX IF NOT EXISTS idx_conversations_agent ON agents.conversations(agent_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user ON agents.conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON agents.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON agents.messages(created_at);

CREATE INDEX IF NOT EXISTS idx_team_messages_conversation ON chat.team_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_team_messages_sender ON chat.team_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_team_messages_created ON chat.team_messages(created_at);

CREATE INDEX IF NOT EXISTS idx_events_user ON analytics.events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_type ON analytics.events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_created ON analytics.events(created_at);
CREATE INDEX IF NOT EXISTS idx_metrics_name ON analytics.system_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_metrics_recorded ON analytics.system_metrics(recorded_at);

-- Create triggers for updated_at
CREATE TRIGGER users_updated_at BEFORE UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER workspaces_updated_at BEFORE UPDATE ON workspaces.workspaces
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER modules_updated_at BEFORE UPDATE ON workspaces.modules
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER agents_updated_at BEFORE UPDATE ON agents.agents
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER conversations_updated_at BEFORE UPDATE ON agents.conversations
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER team_conversations_updated_at BEFORE UPDATE ON chat.team_conversations
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();