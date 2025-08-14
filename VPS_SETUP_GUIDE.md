# 🚀 VPS Setup Guide for Strapi Backend

## Prerequisites
- VPS with Ubuntu 20.04+ (recommended)
- SSH access to your VPS
- Domain name (optional but recommended)

## Step 1: Connect to Your VPS

```bash
# Connect via SSH
ssh root@your-vps-ip

# Or if you have a different user
ssh username@your-vps-ip
```

## Step 2: Update System and Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+ (required for Strapi)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Git
sudo apt install git -y

# Install PM2 (process manager)
sudo npm install -g pm2

# Install Nginx (reverse proxy)
sudo apt install nginx -y

# Install PostgreSQL (recommended for production)
sudo apt install postgresql postgresql-contrib -y

# Install Certbot (for SSL certificates)
sudo apt install certbot python3-certbot-nginx -y

# Install build tools (for native dependencies)
sudo apt install build-essential -y
```

## Step 3: Create Application User

```bash
# Create a new user for the application
sudo adduser strapi
sudo usermod -aG sudo strapi

# Switch to the new user
su - strapi
```

## Step 4: Clone Your Repository

```bash
# Clone your GitHub repository
git clone https://github.com/your-username/cityshopping-backend.git
cd cityshopping-backend

# Install dependencies
npm install
```

## Step 5: Set Up Database

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE cityshopping_prod;
CREATE USER strapi_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE cityshopping_prod TO strapi_user;
\q
```

## Step 6: Configure Environment Variables

```bash
# Create production .env file
cp env.production.example .env

# Edit the .env file
nano .env
```

**Update these values in .env:**
```env
# Server Configuration
HOST=0.0.0.0
PORT=1337

# Security Keys (use the ones we generated)
APP_KEYS=mn8dyFLyFmlFkGzyPmiPRhqnRXH85bJhJbKt0XSzt3c=,6gMELhJfZSPOnOKPoJBSuwq0gQsusKPR3WeiNozRraA=,6NtkORJZOCM9Gvung34dkq8brQWHQ846F771FUTelYA=
ADMIN_JWT_SECRET=i6W3Q6evtmYbShi/W7TylE0SDGz1eZZoohSHmZq7ehc=
API_TOKEN_SALT=ixnAOEiOmd1WPh5aD/tdgQ==
TRANSFER_TOKEN_SALT=xHQqzmBYn3DNxAVpwfYxRQ==
ENCRYPTION_KEY=YpaIUtwUzIbXoXaPpNoKTskJQTTe8Ia/+zKLUqxWekk=

# Database Configuration
DATABASE_CLIENT=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=cityshopping_prod
DATABASE_USERNAME=strapi_user
DATABASE_PASSWORD=your_secure_password
DATABASE_SSL=false
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10
DATABASE_CONNECTION_TIMEOUT=60000
DATABASE_SCHEMA=public

# Environment
NODE_ENV=production

# Payment Gateway (update with your production keys)
RAZORPAY_KEY_ID=your_production_razorpay_key
RAZORPAY_KEY_SECRET=your_production_razorpay_secret
```

## Step 7: Build the Application

```bash
# Build the admin panel
npm run build

# Or if you want to build and start
npm run start
```

## Step 8: Configure PM2

```bash
# Create PM2 ecosystem file
nano ecosystem.config.js
```

**Add this content:**
```javascript
module.exports = {
  apps: [{
    name: 'strapi-api',
    script: 'npm',
    args: 'start',
    cwd: '/home/strapi/cityshopping-backend',
    env: {
      NODE_ENV: 'production',
      PORT: 1337
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    error_file: '/home/strapi/logs/err.log',
    out_file: '/home/strapi/logs/out.log',
    log_file: '/home/strapi/logs/combined.log',
    time: true
  }]
};
```

```bash
# Create logs directory
mkdir -p /home/strapi/logs

# Start the application with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

## Step 9: Configure Nginx

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/cityshopping
```

**Add this content:**
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:1337;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Increase body size for file uploads
        client_max_body_size 10M;
    }
}
```

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/cityshopping /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

## Step 10: Set Up SSL Certificate (if you have a domain)

```bash
# Get SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

## Step 11: Configure Firewall

```bash
# Allow SSH, HTTP, HTTPS
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

## Step 12: Test Your Setup

```bash
# Check if Strapi is running
pm2 status

# Check logs
pm2 logs strapi-api

# Test API endpoint
curl http://localhost:1337/api/orders

# Test admin panel
curl -I http://localhost:1337/admin
```

## Step 13: Update Your Applications

### React Native App
Update `cityshopping/src/config.js`:
```javascript
export const API_URL = "https://your-domain.com";
```

### Admin Dashboard
Update `LocalVendorHub/.env`:
```env
VITE_API_URL=https://your-domain.com
```

## Step 14: Import Data (if needed)

```bash
# If you have existing data to import
npm run strapi import -f export_*.tar.gz
```

## Step 15: Monitor and Maintain

```bash
# Check application status
pm2 status

# View logs
pm2 logs strapi-api

# Restart application
pm2 restart strapi-api

# Update application
cd /home/strapi/cityshopping-backend
git pull
npm install
npm run build
pm2 restart strapi-api
```

## Troubleshooting

### Check if services are running:
```bash
# Check PM2
pm2 status

# Check Nginx
sudo systemctl status nginx

# Check PostgreSQL
sudo systemctl status postgresql

# Check logs
pm2 logs strapi-api
sudo tail -f /var/log/nginx/error.log
```

### Common Issues:
1. **Port 1337 not accessible**: Check firewall and PM2 status
2. **Database connection error**: Verify PostgreSQL is running and credentials are correct
3. **Permission denied**: Check file permissions and user ownership
4. **SSL certificate issues**: Verify domain DNS is pointing to your VPS

## Security Checklist

- ✅ Strong passwords for database and admin panel
- ✅ Firewall configured
- ✅ SSL certificate installed
- ✅ Regular backups scheduled
- ✅ PM2 process manager configured
- ✅ Nginx reverse proxy configured
- ✅ Non-root user for application
- ✅ Automatic security updates enabled

## Backup Strategy

```bash
# Create backup script
nano /home/strapi/backup.sh
```

**Add this content:**
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/strapi/backups"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
pg_dump cityshopping_prod > $BACKUP_DIR/db_backup_$DATE.sql

# Backup uploads
tar -czf $BACKUP_DIR/uploads_backup_$DATE.tar.gz -C /home/strapi/cityshopping-backend/public uploads/

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
```

```bash
# Make executable and add to crontab
chmod +x /home/strapi/backup.sh
crontab -e

# Add this line for daily backups at 2 AM
0 2 * * * /home/strapi/backup.sh
``` 