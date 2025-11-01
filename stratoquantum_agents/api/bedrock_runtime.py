"""
Strato Quantum AI Agents - AWS Bedrock Runtime
Individual agent runtime for Amazon Bedrock Agents Core
"""

import json
import os
import asyncio
import logging
from typing import Dict, Any, Optional
from datetime import datetime
import boto3
from botocore.exceptions import ClientError

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
import uvicorn

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class BedrockAgentRuntime:
    """AWS Bedrock Agent Runtime for individual agents"""
    
    def __init__(self, config_path: str = "config.json"):
        self.config = self._load_config(config_path)
        self.agent_id = os.getenv("AGENT_ID", self.config["agent"]["id"])
        self.bedrock_client = None
        self.agent_instance = None
        self._initialize_aws_clients()
        self._initialize_agent()
    
    def _load_config(self, config_path: str) -> Dict[str, Any]:
        """Load agent configuration"""
        try:
            with open(config_path, 'r') as f:
                config = json.load(f)
            logger.info(f"Configuration loaded for agent: {config['agent']['id']}")
            return config
        except Exception as e:
            logger.error(f"Failed to load config: {e}")
            raise
    
    def _initialize_aws_clients(self):
        """Initialize AWS Bedrock client"""
        try:
            session = boto3.Session(
                region_name=self.config["bedrock"]["region"]
            )
            
            self.bedrock_client = session.client(
                service_name='bedrock-runtime',
                region_name=self.config["bedrock"]["region"]
            )
            
            logger.info("AWS Bedrock client initialized")
            
        except Exception as e:
            logger.error(f"Failed to initialize AWS clients: {e}")
            raise
    
    def _initialize_agent(self):
        """Initialize the specific agent instance"""
        try:
            # Import the specific agent class
            if self.agent_id == "financeiro":
                from agents.financeiro_agent import FinanceiroAgent
                self.agent_instance = FinanceiroAgent(self.config)
            elif self.agent_id == "rh":
                from agents.rh_agent import RHAgent
                self.agent_instance = RHAgent(self.config)
            else:
                raise ValueError(f"Unknown agent ID: {self.agent_id}")
            
            logger.info(f"Agent {self.agent_id} initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize agent {self.agent_id}: {e}")
            raise
    
    async def invoke_bedrock_model(self, prompt: str, tools_context: Dict = None) -> str:
        """Invoke Bedrock model with the prompt"""
        try:
            # Prepare the request body for Claude
            request_body = {
                "anthropic_version": "bedrock-2023-05-31",
                "max_tokens": self.config["bedrock"]["max_tokens"],
                "temperature": self.config["bedrock"]["temperature"],
                "messages": [
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            }
            
            # Add tools context if available
            if tools_context:
                system_prompt = f"""
                Você é o {self.config['agent']['name']}, {self.config['agent']['description']}.
                
                Ferramentas disponíveis: {json.dumps(self.config['tools'], indent=2)}
                
                Contexto adicional: {json.dumps(tools_context, indent=2)}
                
                Responda de forma profissional, técnica e acionável.
                """
                request_body["system"] = system_prompt
            
            # Invoke Bedrock
            response = self.bedrock_client.invoke_model(
                modelId=self.config["bedrock"]["model_id"],
                body=json.dumps(request_body)
            )
            
            # Parse response
            response_body = json.loads(response['body'].read())
            return response_body['content'][0]['text']
            
        except ClientError as e:
            logger.error(f"Bedrock invocation failed: {e}")
            raise HTTPException(status_code=500, detail=f"Bedrock error: {str(e)}")
        except Exception as e:
            logger.error(f"Unexpected error in Bedrock invocation: {e}")
            raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")
    
    async def process_agent_request(self, message: str, context: Dict = None) -> Dict[str, Any]:
        """Process request through the agent"""
        start_time = datetime.utcnow()
        
        try:
            # Use local agent if available, otherwise use Bedrock
            if self.agent_instance:
                # Process through local CrewAI agent
                response = await asyncio.to_thread(
                    self.agent_instance.process_query, 
                    message
                )
            else:
                # Process through Bedrock
                response = await self.invoke_bedrock_model(message, context)
            
            # Calculate response time
            response_time = (datetime.utcnow() - start_time).total_seconds()
            
            return {
                "success": True,
                "agent_id": self.agent_id,
                "message": message,
                "response": response,
                "response_time": response_time,
                "timestamp": datetime.utcnow().isoformat(),
                "model_used": self.config["bedrock"]["model_id"],
                "metadata": {
                    "agent_version": self.config["agent"]["version"],
                    "runtime": "bedrock",
                    "tools_available": len(self.config["tools"])
                }
            }
            
        except Exception as e:
            response_time = (datetime.utcnow() - start_time).total_seconds()
            logger.error(f"Agent processing failed: {e}")
            
            return {
                "success": False,
                "agent_id": self.agent_id,
                "error": str(e),
                "response_time": response_time,
                "timestamp": datetime.utcnow().isoformat()
            }

# Create FastAPI app for the individual agent
def create_agent_app(runtime: BedrockAgentRuntime) -> FastAPI:
    """Create FastAPI application for individual agent"""
    
    app = FastAPI(
        title=f"Strato Quantum - {runtime.config['agent']['name']}",
        description=runtime.config['agent']['description'],
        version=runtime.config['agent']['version']
    )
    
    @app.get("/")
    async def root():
        """Agent information endpoint"""
        return {
            "agent": runtime.config["agent"],
            "status": "operational",
            "capabilities": runtime.config["capabilities"],
            "tools": len(runtime.config["tools"]),
            "runtime": "bedrock"
        }
    
    @app.get("/health")
    async def health_check():
        """Health check endpoint for AWS"""
        try:
            # Test Bedrock connection
            test_response = await runtime.invoke_bedrock_model("Test connection")
            
            return {
                "status": "healthy",
                "agent_id": runtime.agent_id,
                "timestamp": datetime.utcnow().isoformat(),
                "bedrock_connection": "ok",
                "agent_initialized": runtime.agent_instance is not None
            }
        except Exception as e:
            logger.error(f"Health check failed: {e}")
            return JSONResponse(
                status_code=503,
                content={
                    "status": "unhealthy",
                    "agent_id": runtime.agent_id,
                    "error": str(e),
                    "timestamp": datetime.utcnow().isoformat()
                }
            )
    
    @app.post("/invoke")
    async def invoke_agent(request: Request):
        """Main invocation endpoint for Bedrock Agents"""
        try:
            body = await request.json()
            
            # Extract message from Bedrock request format
            message = body.get("inputText", body.get("message", ""))
            context = body.get("context", {})
            
            if not message:
                raise HTTPException(status_code=400, detail="Message is required")
            
            # Process through agent
            result = await runtime.process_agent_request(message, context)
            
            # Return in Bedrock-compatible format
            if result["success"]:
                return {
                    "response": {
                        "messageVersion": "1.0",
                        "response": {
                            "actionGroup": runtime.agent_id,
                            "function": "process_query",
                            "functionResponse": {
                                "responseBody": {
                                    "TEXT": {
                                        "body": result["response"]
                                    }
                                }
                            }
                        }
                    }
                }
            else:
                raise HTTPException(status_code=500, detail=result["error"])
                
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Invocation failed: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    
    @app.get("/tools")
    async def list_tools():
        """List available tools for this agent"""
        return {
            "agent_id": runtime.agent_id,
            "tools": runtime.config["tools"],
            "capabilities": runtime.config["capabilities"]
        }
    
    return app

# Main execution
if __name__ == "__main__":
    # Initialize runtime
    runtime = BedrockAgentRuntime()
    
    # Create FastAPI app
    app = create_agent_app(runtime)
    
    # Get configuration
    port = runtime.config["runtime"]["port"]
    log_level = runtime.config["runtime"]["log_level"].lower()
    
    logger.info(f"Starting {runtime.config['agent']['name']} on port {port}")
    
    # Run the application
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=port,
        log_level=log_level,
        access_log=True
    )