"""
Strato Quantum AI Agents - Configuration Management
Environment-based settings for AWS deployment
"""

import os
from datetime import datetime
from typing import List, Optional
from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    """Application settings with environment variable support"""
    
    # Application
    APP_NAME: str = "Strato Quantum AI Agents"
    VERSION: str = "2.6.3"
    DEBUG: bool = Field(default=False, env="DEBUG")
    ENVIRONMENT: str = Field(default="development", env="ENVIRONMENT")
    
    # Server
    HOST: str = Field(default="0.0.0.0", env="HOST")
    PORT: int = Field(default=8000, env="PORT")
    WORKERS: int = Field(default=4, env="WORKERS")
    
    # Database
    DATABASE_URL: str = Field(env="DATABASE_URL")
    DATABASE_POOL_SIZE: int = Field(default=20, env="DATABASE_POOL_SIZE")
    DATABASE_MAX_OVERFLOW: int = Field(default=30, env="DATABASE_MAX_OVERFLOW")
    
    # Redis
    REDIS_URL: str = Field(env="REDIS_URL")
    REDIS_PASSWORD: Optional[str] = Field(default=None, env="REDIS_PASSWORD")
    
    # AI Models
    OPENAI_API_KEY: Optional[str] = Field(default=None, env="OPENAI_API_KEY")
    ANTHROPIC_API_KEY: Optional[str] = Field(default=None, env="ANTHROPIC_API_KEY")
    MODEL_PROVIDER: str = Field(default="openai", env="MODEL_PROVIDER")
    DEFAULT_MODEL: str = Field(default="gpt-3.5-turbo", env="DEFAULT_MODEL")
    
    # Security
    SECRET_KEY: str = Field(env="SECRET_KEY")
    JWT_ALGORITHM: str = Field(default="HS256", env="JWT_ALGORITHM")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=30, env="ACCESS_TOKEN_EXPIRE_MINUTES")
    
    # CORS
    ALLOWED_ORIGINS: List[str] = Field(
        default=["http://localhost:3000", "http://localhost:8080"],
        env="ALLOWED_ORIGINS"
    )
    
    # Logging
    LOG_LEVEL: str = Field(default="INFO", env="LOG_LEVEL")
    LOG_FORMAT: str = Field(default="json", env="LOG_FORMAT")
    
    # Monitoring
    ENABLE_METRICS: bool = Field(default=True, env="ENABLE_METRICS")
    SENTRY_DSN: Optional[str] = Field(default=None, env="SENTRY_DSN")
    
    # AWS Configuration
    AWS_REGION: str = Field(default="us-east-1", env="AWS_REGION")
    AWS_ACCESS_KEY_ID: Optional[str] = Field(default=None, env="AWS_ACCESS_KEY_ID")
    AWS_SECRET_ACCESS_KEY: Optional[str] = Field(default=None, env="AWS_SECRET_ACCESS_KEY")
    
    # Agent Configuration
    AGENT_TIMEOUT: int = Field(default=30, env="AGENT_TIMEOUT")
    MAX_CONCURRENT_REQUESTS: int = Field(default=100, env="MAX_CONCURRENT_REQUESTS")
    AGENT_MEMORY_SIZE: int = Field(default=10, env="AGENT_MEMORY_SIZE")
    
    # WebSocket
    WEBSOCKET_HEARTBEAT_INTERVAL: int = Field(default=30, env="WEBSOCKET_HEARTBEAT_INTERVAL")
    WEBSOCKET_TIMEOUT: int = Field(default=60, env="WEBSOCKET_TIMEOUT")
    
    # Rate Limiting
    RATE_LIMIT_REQUESTS: int = Field(default=100, env="RATE_LIMIT_REQUESTS")
    RATE_LIMIT_WINDOW: int = Field(default=60, env="RATE_LIMIT_WINDOW")
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True
    
    @property
    def is_production(self) -> bool:
        """Check if running in production environment"""
        return self.ENVIRONMENT.lower() == "production"
    
    @property
    def is_development(self) -> bool:
        """Check if running in development environment"""
        return self.ENVIRONMENT.lower() == "development"
    
    @property
    def database_config(self) -> dict:
        """Get database configuration"""
        return {
            "url": self.DATABASE_URL,
            "pool_size": self.DATABASE_POOL_SIZE,
            "max_overflow": self.DATABASE_MAX_OVERFLOW,
            "echo": self.DEBUG
        }
    
    @property
    def redis_config(self) -> dict:
        """Get Redis configuration"""
        config = {"url": self.REDIS_URL}
        if self.REDIS_PASSWORD:
            config["password"] = self.REDIS_PASSWORD
        return config
    
    @staticmethod
    def get_timestamp() -> str:
        """Get current timestamp in ISO format"""
        return datetime.utcnow().isoformat() + "Z"
    
    def get_agent_config(self, agent_id: str) -> dict:
        """Get configuration for specific agent"""
        base_config = {
            "timeout": self.AGENT_TIMEOUT,
            "memory_size": self.AGENT_MEMORY_SIZE,
            "model_provider": self.MODEL_PROVIDER,
            "default_model": self.DEFAULT_MODEL
        }
        
        # Agent-specific configurations
        agent_configs = {
            "financeiro": {
                "tools": ["cash_flow_analysis", "budget_analysis", "roi_calculation", "financial_forecast"],
                "model": "gpt-4" if self.is_production else "gpt-3.5-turbo"
            },
            "rh": {
                "tools": ["recruitment_analysis", "performance_analysis", "culture_analysis", "training_analysis"],
                "model": "gpt-3.5-turbo"
            },
            "tecnologia": {
                "tools": ["architecture_review", "security_analysis", "performance_optimization", "code_review"],
                "model": "gpt-4" if self.is_production else "gpt-3.5-turbo"
            },
            "operacoes": {
                "tools": ["process_optimization", "sla_monitoring", "project_management", "incident_analysis"],
                "model": "gpt-3.5-turbo"
            },
            "comercial": {
                "tools": ["lead_qualification", "sales_forecast", "pipeline_analysis", "conversion_optimization"],
                "model": "gpt-3.5-turbo"
            },
            "produto": {
                "tools": ["feature_prioritization", "user_feedback_analysis", "roadmap_planning", "usage_analytics"],
                "model": "gpt-3.5-turbo"
            },
            "marketing": {
                "tools": ["campaign_optimization", "seo_analysis", "content_strategy", "roi_analysis"],
                "model": "gpt-3.5-turbo"
            }
        }
        
        if agent_id in agent_configs:
            base_config.update(agent_configs[agent_id])
        
        return base_config

# Create global settings instance
settings = Settings()

# Validate critical settings
if not settings.DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is required")

if not settings.SECRET_KEY:
    raise ValueError("SECRET_KEY environment variable is required")

# Set up Sentry if configured
if settings.SENTRY_DSN:
    import sentry_sdk
    from sentry_sdk.integrations.fastapi import FastApiIntegration
    from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration
    
    sentry_sdk.init(
        dsn=settings.SENTRY_DSN,
        integrations=[
            FastApiIntegration(auto_enabling_integrations=False),
            SqlalchemyIntegration(),
        ],
        traces_sample_rate=0.1 if settings.is_production else 1.0,
        environment=settings.ENVIRONMENT
    )