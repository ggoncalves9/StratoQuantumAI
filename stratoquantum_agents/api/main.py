"""
Strato Quantum AI Agents - FastAPI Main Application
Version: 2.6.3 - AWS Agents Core Ready
"""

import asyncio
import logging
from contextlib import asynccontextmanager
from typing import Dict, Any

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
import uvicorn

from .config import settings
from .database import database
from .routes import agents, chat, health, analytics
from .websocket_manager import WebSocketManager
from .middleware import LoggingMiddleware, MetricsMiddleware
from .utils.logger import setup_logger

# Setup logging
logger = setup_logger(__name__)

# WebSocket manager
websocket_manager = WebSocketManager()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    # Startup
    logger.info("🚀 Starting Strato Quantum AI Agents v2.6.3")
    
    try:
        # Connect to database
        await database.connect()
        logger.info("✅ Database connected")
        
        # Initialize agents
        from .services.agent_manager import agent_manager
        await agent_manager.initialize()
        logger.info("✅ AI Agents initialized")
        
        # Start background tasks
        asyncio.create_task(websocket_manager.start_heartbeat())
        logger.info("✅ WebSocket manager started")
        
        yield
        
    except Exception as e:
        logger.error(f"❌ Startup failed: {e}")
        raise
    finally:
        # Shutdown
        logger.info("🛑 Shutting down Strato Quantum AI Agents")
        await database.disconnect()
        await websocket_manager.cleanup()
        logger.info("✅ Shutdown completed")

# Create FastAPI application
app = FastAPI(
    title="Strato Quantum AI Agents",
    description="Specialized AI agents for enterprise automation and optimization",
    version="2.6.3",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    lifespan=lifespan
)

# Add middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(LoggingMiddleware)
app.add_middleware(MetricsMiddleware)

# Include routers
app.include_router(health.router, prefix="/health", tags=["Health"])
app.include_router(agents.router, prefix="/api/agents", tags=["Agents"])
app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "name": "Strato Quantum AI Agents",
        "version": "2.6.3",
        "description": "Specialized AI agents for enterprise automation",
        "status": "operational",
        "agents": {
            "total": 7,
            "available": ["financeiro", "rh", "tecnologia", "operacoes", "comercial", "produto", "marketing"]
        },
        "endpoints": {
            "health": "/health",
            "agents": "/api/agents",
            "chat": "/api/chat",
            "websocket": "/ws",
            "docs": "/docs" if settings.DEBUG else "disabled"
        }
    }

@app.websocket("/ws/{agent_id}")
async def websocket_endpoint(websocket: WebSocket, agent_id: str):
    """WebSocket endpoint for real-time agent communication"""
    try:
        await websocket_manager.connect(websocket, agent_id)
        logger.info(f"WebSocket connected for agent: {agent_id}")
        
        while True:
            # Receive message from client
            data = await websocket.receive_json()
            
            # Process message through agent
            from .services.agent_manager import agent_manager
            response = await agent_manager.process_message(agent_id, data)
            
            # Send response back to client
            await websocket_manager.send_message(websocket, response)
            
    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected for agent: {agent_id}")
        await websocket_manager.disconnect(websocket, agent_id)
    except Exception as e:
        logger.error(f"WebSocket error for agent {agent_id}: {e}")
        await websocket_manager.disconnect(websocket, agent_id)

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """Custom HTTP exception handler"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "message": exc.detail,
            "timestamp": settings.get_timestamp()
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """General exception handler"""
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "message": "Internal server error",
            "timestamp": settings.get_timestamp()
        }
    )

# Metrics endpoint for Prometheus
@app.get("/metrics")
async def metrics():
    """Prometheus metrics endpoint"""
    from .middleware import metrics_middleware
    return metrics_middleware.generate_metrics()

if __name__ == "__main__":
    uvicorn.run(
        "api.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level="info"
    )