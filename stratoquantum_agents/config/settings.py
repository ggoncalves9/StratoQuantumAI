"""
StratoQuantum AI Agents - Configuration Settings
"""
import os
from typing import List, Optional
from pydantic import BaseSettings, validator
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings with environment variable support."""
    
    # Application Settings
    app_name: str = "StratoQuantum Agents"
    app_version: str = "2.6.8"
    environment: str = "development"
    debug: bool = True
    host: str = "0.0.0.0"
    port: int = 8000
    workers: int = 4
    
    # Database Configuration
    database_url: str = "postgresql://stratoquantum:stratoquantum2025@localhost:5432/stratoquantum"
    database_host: str = "localhost"
    database_port: int = 5432
    database_name: str = "stratoquantum"
    database_user: str = "stratoquantum"
    database_password: str = "stratoquantum2025"
    database_pool_size: int = 20
    database_max_overflow: int = 30
    database_ssl: bool = False
    
    # Redis Configuration
    redis_url: str = "redis://localhost:6379"
    redis_host: str = "localhost"
    redis_port: int = 6379
    redis_password: str = "stratoquantum2025"
    redis_db: int = 1
    
    # Security
    secret_key: str = "your-super-secret-key-change-in-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    api_key: str = "your-agents-api-key-for-platform-communication"
    
    # AI Models Configuration
    openai_api_key: Optional[str] = None
    openai_model: str = "gpt-4"
    openai_max_tokens: int = 4000
    openai_temperature: float = 0.7
    
    anthropic_api_key: Optional[str] = None
    anthropic_model: str = "claude-3-sonnet-20240229"
    
    local_ai_url: str = "http://localhost:11434"
    local_ai_model: str = "deepseek-coder"
    local_ai_enabled: bool = False
    
    model_provider: str = "openai"
    default_model: str = "gpt-4"
    fallback_model: str = "gpt-3.5-turbo"
    
    # Agent Configuration
    agent_timeout: int = 30
    max_concurrent_requests: int = 100
    agent_memory_size: int = 10
    agent_max_retries: int = 3
    agent_response_timeout: int = 60
    
    # CrewAI Configuration
    crew_max_agents: int = 7
    crew_execution_timeout: int = 300
    crew_memory_enabled: bool = True
    
    # Platform Integration
    platform_api_url: str = "http://localhost:3000"
    platform_api_key: str = "your-platform-api-key"
    platform_webhook_secret: str = "your-webhook-secret"
    
    # WebSocket Configuration
    websocket_enabled: bool = True
    websocket_heartbeat_interval: int = 30
    websocket_timeout: int = 60
    websocket_max_connections: int = 500
    
    # CORS & Security
    allowed_origins: List[str] = [
        "http://localhost:3000",
        "http://localhost:8080", 
        "http://127.0.0.1:5500"
    ]
    allowed_methods: List[str] = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    cors_credentials: bool = True
    
    # Rate Limiting
    rate_limit_requests: int = 100
    rate_limit_window: int = 60
    rate_limit_skip_successful: bool = True
    
    # Logging & Monitoring
    log_level: str = "INFO"
    log_format: str = "json"
    log_file_enabled: bool = True
    log_file_path: str = "./logs/agents.log"
    
    enable_metrics: bool = True
    metrics_port: int = 9091
    sentry_dsn: Optional[str] = None
    
    # External Services
    aws_region: str = "us-east-1"
    aws_access_key_id: Optional[str] = None
    aws_secret_access_key: Optional[str] = None
    
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_user: Optional[str] = None
    smtp_password: Optional[str] = None
    
    # Agent Specializations
    financial_agent_enabled: bool = True
    hr_agent_enabled: bool = True
    tech_agent_enabled: bool = True
    ops_agent_enabled: bool = True
    commercial_agent_enabled: bool = True
    product_agent_enabled: bool = True
    marketing_agent_enabled: bool = True
    
    # Development Settings
    hot_reload: bool = True
    auto_reload: bool = True
    debug_agents: bool = True
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False
    
    @validator("allowed_origins", pre=True)
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            try:
                import json
                return json.loads(v)
            except json.JSONDecodeError:
                return [origin.strip() for origin in v.split(",")]
        return v
    
    @validator("allowed_methods", pre=True)
    def parse_cors_methods(cls, v):
        if isinstance(v, str):
            try:
                import json
                return json.loads(v)
            except json.JSONDecodeError:
                return [method.strip() for method in v.split(",")]
        return v
    
    @validator("secret_key")
    def validate_secret_key(cls, v):
        if len(v) < 32:
            raise ValueError("SECRET_KEY must be at least 32 characters long")
        return v
    
    @property
    def is_development(self) -> bool:
        return self.environment == "development"
    
    @property
    def is_production(self) -> bool:
        return self.environment == "production"
    
    @property
    def is_testing(self) -> bool:
        return self.environment == "test"
    
    @property
    def database_url_sync(self) -> str:
        """Synchronous database URL for SQLAlchemy."""
        return self.database_url.replace("postgresql://", "postgresql+psycopg2://")
    
    @property
    def database_url_async(self) -> str:
        """Asynchronous database URL for asyncpg."""
        return self.database_url.replace("postgresql://", "postgresql+asyncpg://")
    
    @property
    def redis_url_full(self) -> str:
        """Full Redis URL with password and database."""
        if self.redis_password:
            return f"redis://:{self.redis_password}@{self.redis_host}:{self.redis_port}/{self.redis_db}"
        return f"redis://{self.redis_host}:{self.redis_port}/{self.redis_db}"
    
    def get_cors_origins(self) -> List[str]:
        """Get CORS origins based on environment."""
        if self.is_production:
            return [
                "https://stratoquantum.com",
                "https://app.stratoquantum.com",
                "https://agents.stratoquantum.com"
            ]
        return self.allowed_origins
    
    def get_ai_model_config(self) -> dict:
        """Get AI model configuration based on provider."""
        config = {
            "provider": self.model_provider,
            "default_model": self.default_model,
            "fallback_model": self.fallback_model,
            "timeout": self.agent_timeout,
            "max_retries": self.agent_max_retries
        }
        
        if self.model_provider == "openai" and self.openai_api_key:
            config.update({
                "api_key": self.openai_api_key,
                "model": self.openai_model,
                "max_tokens": self.openai_max_tokens,
                "temperature": self.openai_temperature
            })
        elif self.model_provider == "anthropic" and self.anthropic_api_key:
            config.update({
                "api_key": self.anthropic_api_key,
                "model": self.anthropic_model
            })
        elif self.model_provider == "local" and self.local_ai_enabled:
            config.update({
                "base_url": self.local_ai_url,
                "model": self.local_ai_model
            })
        
        return config


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()


# Export settings instance
settings = get_settings()