#!/bin/bash
set -e

echo "Starting SmartKitchen Backend..."

# Navigate to backend directory
cd backend

# Run database migrations if needed
# python -m alembic upgrade head

# Start the FastAPI application
exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8080}
