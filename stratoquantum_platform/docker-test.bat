@echo off
REM Strato Quantum Platform - Docker Test Script for Windows
REM This script tests the Docker setup on Windows

echo 🚀 Testing Strato Quantum Platform v2.6.0 Docker Setup...
echo.

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running. Please start Docker Desktop and try again.
    pause
    exit /b 1
)

echo ✅ Docker is running

REM Check if docker-compose is available
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ docker-compose is not available. Please install Docker Desktop with docker-compose.
    pause
    exit /b 1
)

echo ✅ docker-compose is available

REM Create .env file if it doesn't exist
if not exist "backend\.env" (
    echo 📝 Creating .env file from template...
    copy "backend\.env.example" "backend\.env"
    echo ✅ .env file created
) else (
    echo ℹ️  .env file already exists
)

REM Stop any running containers
echo 🛑 Stopping any running containers...
docker-compose down --remove-orphans

REM Build and start development services
echo 🔨 Building and starting development services...
docker-compose --profile development up --build -d

REM Wait for services
echo ⏳ Waiting for services to start...
timeout /t 15 /nobreak >nul

REM Check services
echo 🔍 Checking service health...

REM Check PostgreSQL
docker-compose exec postgres pg_isready -U stratoquantum -d stratoquantum >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ PostgreSQL is ready
) else (
    echo ⚠️  PostgreSQL is starting up...
)

REM Check Redis
docker-compose exec redis redis-cli ping >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Redis is ready
) else (
    echo ⚠️  Redis is starting up...
)

REM Check application (with retry)
set /a attempts=0
:check_app
set /a attempts+=1
curl -f http://localhost:3000/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Application is ready
    goto app_ready
)
if %attempts% lss 10 (
    echo ⏳ Application starting... (attempt %attempts%/10)
    timeout /t 3 /nobreak >nul
    goto check_app
)
echo ⚠️  Application is taking longer to start

:app_ready
echo.
echo 🎉 Strato Quantum Platform is running!
echo.
echo 📊 Services:
echo    • Frontend: http://localhost:3000
echo    • Backend API: http://localhost:3000/api
echo    • Health Check: http://localhost:3000/health
echo    • PostgreSQL: localhost:5432
echo    • Redis: localhost:6379
echo.
echo 🔧 Management:
echo    • View logs: docker-compose logs -f app-dev
echo    • Stop services: docker-compose down
echo    • Restart: docker-compose restart app-dev
echo.
echo 💡 Features:
echo    • 🤖 Floating AI Agents Toolbar
echo    • 👥 Team Chat with 4 Personas  
echo    • 📊 7 Business Workspaces
echo    • 🗄️  PostgreSQL Database
echo.

REM Ask if user wants to see logs
set /p show_logs="Show application logs? (y/n): "
if /i "%show_logs%"=="y" (
    echo 📋 Showing application logs (Ctrl+C to exit)...
    docker-compose logs -f app-dev
)

echo.
echo ✅ Test completed successfully!
pause