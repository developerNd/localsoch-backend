#!/bin/bash

# Backup script for Strapi application
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/strapi/backups"
PROJECT_DIR="/home/strapi/cityshopping-backend"

# Create backup directory
mkdir -p $BACKUP_DIR

echo "🔄 Starting backup at $(date)..."

# Backup database (PostgreSQL)
if command -v pg_dump &> /dev/null; then
    echo "📊 Backing up database..."
    pg_dump cityshopping_prod > $BACKUP_DIR/db_backup_$DATE.sql
    echo "✅ Database backup completed: db_backup_$DATE.sql"
else
    echo "⚠️  PostgreSQL not found, skipping database backup"
fi

# Backup uploads directory
if [ -d "$PROJECT_DIR/public/uploads" ]; then
    echo "📁 Backing up uploads..."
    tar -czf $BACKUP_DIR/uploads_backup_$DATE.tar.gz -C $PROJECT_DIR/public uploads/
    echo "✅ Uploads backup completed: uploads_backup_$DATE.tar.gz"
else
    echo "⚠️  Uploads directory not found"
fi

# Backup .env file
if [ -f "$PROJECT_DIR/.env" ]; then
    echo "🔐 Backing up environment file..."
    cp $PROJECT_DIR/.env $BACKUP_DIR/env_backup_$DATE
    echo "✅ Environment backup completed: env_backup_$DATE"
fi

# Keep only last 7 days of backups
echo "🧹 Cleaning old backups..."
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
find $BACKUP_DIR -name "env_backup_*" -mtime +7 -delete

# Show backup size
BACKUP_SIZE=$(du -sh $BACKUP_DIR | cut -f1)
echo "📈 Total backup size: $BACKUP_SIZE"

echo "✅ Backup completed at $(date)" 