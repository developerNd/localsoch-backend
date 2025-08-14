#!/bin/bash

echo "🚀 Starting deployment..."

# Navigate to project directory
cd /home/strapi/cityshopping-backend

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin main

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the application
echo "🔨 Building application..."
npm run build

# Restart the application
echo "🔄 Restarting application..."
pm2 restart strapi-api

# Check status
echo "✅ Checking application status..."
pm2 status

echo "🎉 Deployment completed!"
echo "📊 Check logs with: pm2 logs strapi-api" 