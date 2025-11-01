"""
Strato Quantum AI Agents - Agents API Routes
RESTful endpoints for agent management and communication
"""

from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from pydantic import BaseModel, Field

from ..services.agent_manager import agent_manager
from ..config import settings
from ..utils.logger import setup_logger

logger = setup_logger(__name__)

router = APIRouter()

# Pydantic models
class MessageRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=5000, description="User message to the agent")
    conversation_id: Optional[str] = Field(None, description="Conversation ID for context")
    user_id: Optional[str] = Field(None, description="User ID for tracking")
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Additional metadata")

class MessageResponse(BaseModel):
    success: bool
    agent_id: str
    conversation_id: Optional[str]
    user_id: Optional[str]
    message: str
    response: str
    response_time: float
    timestamp: str
    metadata: Dict[str, Any]

class AgentStatus(BaseModel):
    status: str
    total_conversations: int
    total_messages: int
    average_response_time: float
    last_activity: str
    error_count: int
    uptime: str

class AgentInfo(BaseModel):
    id: str
    name: str
    description: str
    capabilities: List[str]
    status: str
    config: Dict[str, Any]

# Agent information
AGENT_INFO = {
    "financeiro": {
        "id": "financeiro",
        "name": "Agente Financeiro",
        "description": "Especialista em análise financeira, fluxo de caixa e previsões",
        "capabilities": ["cash_flow_analysis", "budget_analysis", "roi_calculation", "financial_forecast"],
        "workspace": "financeiro"
    },
    "rh": {
        "id": "rh",
        "name": "Agente RH",
        "description": "Especialista em gestão de pessoas, recrutamento e desenvolvimento",
        "capabilities": ["recruitment_analysis", "performance_analysis", "culture_analysis", "training_analysis"],
        "workspace": "rh"
    },
    "tecnologia": {
        "id": "tecnologia",
        "name": "Agente Tecnologia",
        "description": "Especialista em arquitetura, DevOps e segurança",
        "capabilities": ["architecture_review", "security_analysis", "performance_optimization", "code_review"],
        "workspace": "tecnologia"
    },
    "operacoes": {
        "id": "operacoes",
        "name": "Agente Operações",
        "description": "Especialista em processos, SLA e gestão de projetos",
        "capabilities": ["process_optimization", "sla_monitoring", "project_management", "incident_analysis"],
        "workspace": "operacoes"
    },
    "comercial": {
        "id": "comercial",
        "name": "Agente Comercial",
        "description": "Especialista em vendas, CRM e pipeline",
        "capabilities": ["lead_qualification", "sales_forecast", "pipeline_analysis", "conversion_optimization"],
        "workspace": "comercial"
    },
    "produto": {
        "id": "produto",
        "name": "Agente Produto",
        "description": "Especialista em roadmap, features e feedback",
        "capabilities": ["feature_prioritization", "user_feedback_analysis", "roadmap_planning", "usage_analytics"],
        "workspace": "produto"
    },
    "marketing": {
        "id": "marketing",
        "name": "Agente Marketing",
        "description": "Especialista em campanhas, SEO e performance",
        "capabilities": ["campaign_optimization", "seo_analysis", "content_strategy", "roi_analysis"],
        "workspace": "marketing"
    }
}

@router.get("/", response_model=List[AgentInfo])
async def list_agents():
    """List all available agents"""
    try:
        agents_status = await agent_manager.get_all_agents_status()
        
        agents_list = []
        for agent_id, info in AGENT_INFO.items():
            agent_status = agents_status.get("agents", {}).get(agent_id, {})
            
            agent_info = AgentInfo(
                id=info["id"],
                name=info["name"],
                description=info["description"],
                capabilities=info["capabilities"],
                status=agent_status.get("status", "unknown"),
                config=settings.get_agent_config(agent_id)
            )
            agents_list.append(agent_info)
        
        return agents_list
        
    except Exception as e:
        logger.error(f"Error listing agents: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve agents list")

@router.get("/{agent_id}", response_model=AgentInfo)
async def get_agent(agent_id: str):
    """Get information about a specific agent"""
    if agent_id not in AGENT_INFO:
        raise HTTPException(status_code=404, detail=f"Agent {agent_id} not found")
    
    try:
        agent_status = await agent_manager.get_agent_status(agent_id)
        info = AGENT_INFO[agent_id]
        
        return AgentInfo(
            id=info["id"],
            name=info["name"],
            description=info["description"],
            capabilities=info["capabilities"],
            status=agent_status.get("status", "unknown"),
            config=settings.get_agent_config(agent_id)
        )
        
    except Exception as e:
        logger.error(f"Error getting agent {agent_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve agent {agent_id}")

@router.get("/{agent_id}/status", response_model=AgentStatus)
async def get_agent_status(agent_id: str):
    """Get detailed status of a specific agent"""
    if agent_id not in AGENT_INFO:
        raise HTTPException(status_code=404, detail=f"Agent {agent_id} not found")
    
    try:
        status = await agent_manager.get_agent_status(agent_id)
        
        if "error" in status:
            raise HTTPException(status_code=404, detail=status["error"])
        
        return AgentStatus(**status)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting agent status {agent_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get status for agent {agent_id}")

@router.post("/{agent_id}/chat", response_model=MessageResponse)
async def chat_with_agent(agent_id: str, request: MessageRequest, background_tasks: BackgroundTasks):
    """Send a message to a specific agent"""
    if agent_id not in AGENT_INFO:
        raise HTTPException(status_code=404, detail=f"Agent {agent_id} not found")
    
    try:
        # Prepare message data
        message_data = {
            "message": request.message,
            "conversation_id": request.conversation_id,
            "user_id": request.user_id,
            "metadata": request.metadata
        }
        
        # Process message through agent
        response = await agent_manager.process_message(agent_id, message_data)
        
        if not response.get("success", False):
            raise HTTPException(
                status_code=500, 
                detail=f"Agent processing failed: {response.get('error', 'Unknown error')}"
            )
        
        # Log interaction in background
        background_tasks.add_task(log_agent_interaction, agent_id, request.message, response)
        
        return MessageResponse(**response)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error chatting with agent {agent_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to process message for agent {agent_id}")

@router.post("/{agent_id}/restart")
async def restart_agent(agent_id: str):
    """Restart a specific agent"""
    if agent_id not in AGENT_INFO:
        raise HTTPException(status_code=404, detail=f"Agent {agent_id} not found")
    
    try:
        success = await agent_manager.restart_agent(agent_id)
        
        if not success:
            raise HTTPException(status_code=500, detail=f"Failed to restart agent {agent_id}")
        
        return {
            "success": True,
            "message": f"Agent {agent_id} restarted successfully",
            "timestamp": settings.get_timestamp()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error restarting agent {agent_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to restart agent {agent_id}")

@router.get("/status/all")
async def get_all_agents_status():
    """Get status of all agents"""
    try:
        status = await agent_manager.get_all_agents_status()
        return {
            "success": True,
            "data": status,
            "timestamp": settings.get_timestamp()
        }
        
    except Exception as e:
        logger.error(f"Error getting all agents status: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve agents status")

# Background task functions
async def log_agent_interaction(agent_id: str, message: str, response: Dict[str, Any]):
    """Log agent interaction for analytics"""
    try:
        # This would typically save to database
        logger.info(f"Agent interaction logged: {agent_id} - {len(message)} chars - {response.get('response_time', 0):.2f}s")
    except Exception as e:
        logger.error(f"Failed to log agent interaction: {e}")