#!/bin/bash
# SmartKitchen API Server Startup Script

echo "Starting SmartKitchen API Server..."
echo "=================================="

# Load environment variables
export $(cat .env | xargs)

# Start uvicorn server
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
