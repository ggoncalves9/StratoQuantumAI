# Strato Quantum - Agente Comercial - Individual Container for AWS Bedrock
FROM python:3.11-slim as base

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    AGENT_ID=comercial

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN groupadd -r agent && useradd -r -g agent agent

# Set working directory
WORKDIR /app

# Copy requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy agent-specific code
COPY agents/comercial_agent.py ./agent.py
COPY agents/tools/ ./tools/
COPY api/bedrock_runtime.py ./runtime.py
COPY api/utils/ ./utils/

# Copy configuration
COPY agents/comercial/config.json ./config.json

# Create logs directory
RUN mkdir -p /app/logs && chown -R agent:agent /app

# Switch to non-root user
USER agent

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Expose port
EXPOSE 8080

# Start agent runtime
CMD ["python", "runtime.py"]
