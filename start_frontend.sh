#!/bin/bash
# SmartKitchen Frontend Startup Script

echo "=========================================="
echo "SmartKitchen Frontend Setup"
echo "=========================================="
echo ""

cd frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo ""
fi

echo "🚀 Starting development server..."
echo "Frontend will be available at: http://localhost:3000"
echo "Make sure the backend is running at: http://localhost:8000"
echo ""
echo "=========================================="
echo ""

npm run dev
