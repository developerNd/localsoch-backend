#!/bin/bash

echo "🚀 Starting CityShopping Backend..."
echo "=================================="

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found. Please create one with your database configuration."
    echo "   You can copy from .env.example if available."
fi

echo "🔧 Starting Strapi development server..."
echo "   API will be available at: http://localhost:1337"
echo "   Admin panel at: http://localhost:1337/admin"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the development server
npm run develop 