"""
Strato Quantum AI Agents - Agent Manager Service
Manages all AI agents and their lifecycle
"""

import asyncio
import logging
from typing import Dict, Any, Optional, List
from datetime import datetime, timedelta

from ..config import settings
from ..utils.logger import setup_logger
from ...agents.financeiro_agent import FinanceiroAgent
from ...agents.rh_agent import RHAgent

logger = setup_logger(__name__)

class AgentManager:
    """Manages all AI agents and their interactions"""
    
    def __init__(self):
        self.agents: Dict[str, Any] = {}
        self.agent_stats: Dict[str, Dict] = {}
        self.is_initialized = False
        
    async def initialize(self):
        """Initialize all agents"""
        try:
            logger.info("🤖 Initializing AI agents...")
            
            # Initialize agents
            agent_classes = {
                "financeiro": FinanceiroAgent,
                "rh": RHAgent,
                # Add other agents as they're implemented
            }
            
            for agent_id, agent_class in agent_classes.items():
                try:
                    config = settings.get_agent_config(agent_id)
                    agent = agent_class(config)
                    self.agents[agent_id] = agent
                    
                    # Initialize agent stats
                    self.agent_stats[agent_id] = {
                        "status": "online",
                        "total_conversations": 0,
                        "total_messages": 0,
                        "average_response_time": 0,
                        "last_activity": datetime.utcnow(),
                        "error_count": 0,
                        "uptime": datetime.utcnow()
                    }
                    
                    logger.info(f"✅ Agent {agent_id} initialized")
                    
                except Exception as e:
                    logger.error(f"❌ Failed to initialize agent {agent_id}: {e}")
                    self.agent_stats[agent_id] = {
                        "status": "error",
                        "error": str(e),
                        "last_error": datetime.utcnow()
                    }
            
            self.is_initialized = True
            logger.info(f"✅ Agent manager initialized with {len(self.agents)} agents")
            
        except Exception as e:
            logger.error(f"❌ Agent manager initialization failed: {e}")
            raise
    
    async def process_message(self, agent_id: str, message_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process a message through the specified agent"""
        start_time = datetime.utcnow()
        
        try:
            # Validate agent exists
            if agent_id not in self.agents:
                raise ValueError(f"Agent {agent_id} not found")
            
            agent = self.agents[agent_id]
            stats = self.agent_stats[agent_id]
            
            # Check agent status
            if stats["status"] != "online":
                raise ValueError(f"Agent {agent_id} is not available (status: {stats['status']})")
            
            # Extract message content
            user_message = message_data.get("message", "")
            conversation_id = message_data.get("conversation_id")
            user_id = message_data.get("user_id")
            
            if not user_message:
                raise ValueError("Message content is required")
            
            # Process message through agent
            logger.info(f"Processing message for agent {agent_id}: {user_message[:100]}...")
            
            # Call agent's process_query method
            agent_response = await asyncio.to_thread(agent.process_query, user_message)
            
            # Calculate response time
            response_time = (datetime.utcnow() - start_time).total_seconds()
            
            # Update agent stats
            await self._update_agent_stats(agent_id, response_time, success=True)
            
            # Prepare response
            response = {
                "success": True,
                "agent_id": agent_id,
                "conversation_id": conversation_id,
                "user_id": user_id,
                "message": user_message,
                "response": agent_response,
                "response_time": response_time,
                "timestamp": datetime.utcnow().isoformat(),
                "metadata": {
                    "agent_status": stats["status"],
                    "processing_time": response_time,
                    "model_used": settings.get_agent_config(agent_id).get("model", "unknown")
                }
            }
            
            logger.info(f"✅ Message processed for agent {agent_id} in {response_time:.2f}s")
            return response
            
        except Exception as e:
            # Calculate response time even for errors
            response_time = (datetime.utcnow() - start_time).total_seconds()
            
            # Update error stats
            await self._update_agent_stats(agent_id, response_time, success=False)
            
            logger.error(f"❌ Error processing message for agent {agent_id}: {e}")
            
            return {
                "success": False,
                "agent_id": agent_id,
                "error": str(e),
                "response_time": response_time,
                "timestamp": datetime.utcnow().isoformat()
            }
    
    async def _update_agent_stats(self, agent_id: str, response_time: float, success: bool = True):
        """Update agent statistics"""
        if agent_id not in self.agent_stats:
            return
        
        stats = self.agent_stats[agent_id]
        
        # Update counters
        stats["total_messages"] += 1
        stats["last_activity"] = datetime.utcnow()
        
        if success:
            # Update average response time
            current_avg = stats.get("average_response_time", 0)
            total_messages = stats["total_messages"]
            stats["average_response_time"] = (
                (current_avg * (total_messages - 1) + response_time) / total_messages
            )
        else:
            stats["error_count"] += 1
            
            # Set agent to error status if too many errors
            if stats["error_count"] > 10:
                stats["status"] = "error"
                logger.warning(f"Agent {agent_id} set to error status due to high error count")
    
    async def get_agent_status(self, agent_id: str) -> Dict[str, Any]:
        """Get status of a specific agent"""
        if agent_id not in self.agent_stats:
            return {"error": "Agent not found"}
        
        stats = self.agent_stats[agent_id].copy()
        
        # Calculate uptime
        if "uptime" in stats:
            uptime_delta = datetime.utcnow() - stats["uptime"]
            stats["uptime_seconds"] = uptime_delta.total_seconds()
            stats["uptime"] = stats["uptime"].isoformat()
        
        # Format timestamps
        for key in ["last_activity", "last_error"]:
            if key in stats and isinstance(stats[key], datetime):
                stats[key] = stats[key].isoformat()
        
        return stats
    
    async def get_all_agents_status(self) -> Dict[str, Any]:
        """Get status of all agents"""
        return {
            "total_agents": len(self.agents),
            "online_agents": len([s for s in self.agent_stats.values() if s.get("status") == "online"]),
            "agents": {
                agent_id: await self.get_agent_status(agent_id)
                for agent_id in self.agent_stats.keys()
            },
            "manager_status": {
                "initialized": self.is_initialized,
                "uptime": datetime.utcnow().isoformat()
            }
        }
    
    async def restart_agent(self, agent_id: str) -> bool:
        """Restart a specific agent"""
        try:
            if agent_id not in self.agents:
                return False
            
            logger.info(f"🔄 Restarting agent {agent_id}")
            
            # Get agent class
            agent_classes = {
                "financeiro": FinanceiroAgent,
                "rh": RHAgent,
            }
            
            if agent_id not in agent_classes:
                return False
            
            # Reinitialize agent
            config = settings.get_agent_config(agent_id)
            self.agents[agent_id] = agent_classes[agent_id](config)
            
            # Reset stats
            self.agent_stats[agent_id].update({
                "status": "online",
                "error_count": 0,
                "uptime": datetime.utcnow()
            })
            
            logger.info(f"✅ Agent {agent_id} restarted successfully")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to restart agent {agent_id}: {e}")
            return False
    
    async def shutdown(self):
        """Shutdown all agents"""
        logger.info("🛑 Shutting down agent manager")
        
        for agent_id in self.agents:
            self.agent_stats[agent_id]["status"] = "offline"
        
        self.agents.clear()
        self.is_initialized = False
        
        logger.info("✅ Agent manager shutdown completed")

# Create global agent manager instance
agent_manager = AgentManager()