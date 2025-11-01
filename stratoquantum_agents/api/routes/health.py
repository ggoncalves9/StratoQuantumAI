"""
Strato Quantum AI Agents - Health Check Routes
System health and status monitoring endpoints
"""

import asyncio
from typing import Dict, Any
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ..config import settings
from ..database import database
from ..services.agent_manager import agent_manager
from ..utils.logger import setup_logger

logger = setup_logger(__name__)

router = APIRouter()

class HealthResponse(BaseModel):
    status: str
    version: str
    timestamp: str
    uptime: float
    environment: str
    components: Dict[str, Any]

class ComponentHealth(BaseModel):
    status: str
    response_time: float
    details: Dict[str, Any] = {}

@router.get("/", response_model=HealthResponse)
async def health_check():
    """Comprehensive health check endpoint"""
    import time
    import psutil
    
    start_time = time.time()
    
    try:
        # Check all components
        components = {}
        
        # Database health
        db_start = time.time()
        try:
            db_healthy = await database.healthCheck() if hasattr(database, 'healthCheck') else True
            db_time = time.time() - db_start
            components["database"] = ComponentHealth(
                status="healthy" if db_healthy else "unhealthy",
                response_time=db_time,
                details={"connected": db_healthy}
            ).dict()
        except Exception as e:
            components["database"] = ComponentHealth(
                status="unhealthy",
                response_time=time.time() - db_start,
                details={"error": str(e)}
            ).dict()
        
        # Agent Manager health
        agent_start = time.time()
        try:
            agents_status = await agent_manager.get_all_agents_status()
            agent_time = time.time() - agent_start
            online_agents = agents_status.get("online_agents", 0)
            total_agents = agents_status.get("total_agents", 0)
            
            components["agents"] = ComponentHealth(
                status="healthy" if online_agents > 0 else "degraded",
                response_time=agent_time,
                details={
                    "total_agents": total_agents,
                    "online_agents": online_agents,
                    "initialized": agents_status.get("manager_status", {}).get("initialized", False)
                }
            ).dict()
        except Exception as e:
            components["agents"] = ComponentHealth(
                status="unhealthy",
                response_time=time.time() - agent_start,
                details={"error": str(e)}
            ).dict()
        
        # System resources
        try:
            cpu_percent = psutil.cpu_percent(interval=0.1)
            memory = psutil.virtual_memory()
            disk = psutil.disk_usage('/')
            
            components["system"] = ComponentHealth(
                status="healthy",
                response_time=0.1,
                details={
                    "cpu_percent": cpu_percent,
                    "memory_percent": memory.percent,
                    "disk_percent": (disk.used / disk.total) * 100,
                    "memory_available_gb": round(memory.available / (1024**3), 2),
                    "disk_free_gb": round(disk.free / (1024**3), 2)
                }
            ).dict()
        except Exception as e:
            components["system"] = ComponentHealth(
                status="unknown",
                response_time=0,
                details={"error": str(e)}
            ).dict()
        
        # Overall status
        unhealthy_components = [
            name for name, comp in components.items() 
            if comp["status"] == "unhealthy"
        ]
        
        if unhealthy_components:
            overall_status = "unhealthy"
        elif any(comp["status"] == "degraded" for comp in components.values()):
            overall_status = "degraded"
        else:
            overall_status = "healthy"
        
        total_time = time.time() - start_time
        
        response = HealthResponse(
            status=overall_status,
            version=settings.VERSION,
            timestamp=settings.get_timestamp(),
            uptime=total_time,
            environment=settings.ENVIRONMENT,
            components=components
        )
        
        # Log health check
        if overall_status != "healthy":
            logger.warning("Health check failed", 
                         status=overall_status, 
                         unhealthy_components=unhealthy_components)
        
        return response
        
    except Exception as e:
        logger.error("Health check error", error=str(e))
        raise HTTPException(status_code=500, detail="Health check failed")

@router.get("/ready")
async def readiness_check():
    """Kubernetes readiness probe endpoint"""
    try:
        # Check if agents are initialized
        if not agent_manager.is_initialized:
            raise HTTPException(status_code=503, detail="Agents not initialized")
        
        # Check database connection
        if hasattr(database, 'healthCheck'):
            db_healthy = await database.healthCheck()
            if not db_healthy:
                raise HTTPException(status_code=503, detail="Database not ready")
        
        return {"status": "ready", "timestamp": settings.get_timestamp()}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Readiness check failed", error=str(e))
        raise HTTPException(status_code=503, detail="Service not ready")

@router.get("/live")
async def liveness_check():
    """Kubernetes liveness probe endpoint"""
    try:
        # Simple check that the application is running
        return {"status": "alive", "timestamp": settings.get_timestamp()}
        
    except Exception as e:
        logger.error("Liveness check failed", error=str(e))
        raise HTTPException(status_code=500, detail="Service not alive")

@router.get("/startup")
async def startup_check():
    """Kubernetes startup probe endpoint"""
    try:
        # Check if application has completed startup
        if not agent_manager.is_initialized:
            raise HTTPException(status_code=503, detail="Still starting up")
        
        return {"status": "started", "timestamp": settings.get_timestamp()}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Startup check failed", error=str(e))
        raise HTTPException(status_code=503, detail="Startup failed")