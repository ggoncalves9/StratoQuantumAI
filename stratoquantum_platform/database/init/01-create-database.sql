-- Strato Quantum Platform - Database Initialization
-- Create database and user if they don't exist

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create schemas
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS workspaces;
CREATE SCHEMA IF NOT EXISTS agents;
CREATE SCHEMA IF NOT EXISTS analytics;
CREATE SCHEMA IF NOT EXISTS chat;

-- Set search path
ALTER DATABASE stratoquantum SET search_path TO public, auth, workspaces, agents, analytics, chat;

-- Create roles
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'app_user') THEN
        CREATE ROLE app_user LOGIN PASSWORD 'app_password_2025';
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'readonly_user') THEN
        CREATE ROLE readonly_user LOGIN PASSWORD 'readonly_password_2025';
    END IF;
END
$$;

-- Grant permissions
GRANT CONNECT ON DATABASE stratoquantum TO app_user;
GRANT USAGE ON SCHEMA public, auth, workspaces, agents, analytics, chat TO app_user;
GRANT CREATE ON SCHEMA public, auth, workspaces, agents, analytics, chat TO app_user;

GRANT CONNECT ON DATABASE stratoquantum TO readonly_user;
GRANT USAGE ON SCHEMA public, auth, workspaces, agents, analytics, chat TO readonly_user;

-- Create audit function
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        NEW.created_at = COALESCE(NEW.created_at, NOW());
        NEW.updated_at = NOW();
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        NEW.updated_at = NOW();
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;