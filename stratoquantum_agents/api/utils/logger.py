"""
Strato Quantum AI Agents - Logging Utilities
Structured logging for production environments
"""

import logging
import sys
from typing import Any, Dict
import structlog
from structlog.stdlib import LoggerFactory

from ..config import settings

def setup_logger(name: str) -> structlog.stdlib.BoundLogger:
    """Setup structured logger for the application"""
    
    # Configure structlog
    structlog.configure(
        processors=[
            structlog.stdlib.filter_by_level,
            structlog.stdlib.add_logger_name,
            structlog.stdlib.add_log_level,
            structlog.stdlib.PositionalArgumentsFormatter(),
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.processors.StackInfoRenderer(),
            structlog.processors.format_exc_info,
            structlog.processors.UnicodeDecoder(),
            structlog.processors.JSONRenderer() if settings.LOG_FORMAT == "json" else structlog.dev.ConsoleRenderer()
        ],
        context_class=dict,
        logger_factory=LoggerFactory(),
        wrapper_class=structlog.stdlib.BoundLogger,
        cache_logger_on_first_use=True,
    )
    
    # Configure standard library logging
    logging.basicConfig(
        format="%(message)s",
        stream=sys.stdout,
        level=getattr(logging, settings.LOG_LEVEL.upper())
    )
    
    # Get logger
    logger = structlog.get_logger(name)
    
    return logger

def log_agent_interaction(
    agent_id: str,
    user_message: str,
    agent_response: str,
    response_time: float,
    success: bool = True,
    error: str = None,
    metadata: Dict[str, Any] = None
):
    """Log agent interaction for analytics"""
    logger = setup_logger("agent_interaction")
    
    log_data = {
        "agent_id": agent_id,
        "message_length": len(user_message),
        "response_length": len(agent_response) if agent_response else 0,
        "response_time": response_time,
        "success": success,
        "timestamp": settings.get_timestamp()
    }
    
    if error:
        log_data["error"] = error
    
    if metadata:
        log_data["metadata"] = metadata
    
    if success:
        logger.info("Agent interaction completed", **log_data)
    else:
        logger.error("Agent interaction failed", **log_data)

def log_system_metric(metric_name: str, value: float, tags: Dict[str, str] = None):
    """Log system metrics"""
    logger = setup_logger("system_metrics")
    
    log_data = {
        "metric_name": metric_name,
        "value": value,
        "timestamp": settings.get_timestamp()
    }
    
    if tags:
        log_data["tags"] = tags
    
    logger.info("System metric recorded", **log_data)