# 🚀 Production Setup Guide

## ✅ What's Done

Your Strapi backend now has:
- ✅ Secure random values for all security keys
- ✅ Production-ready `.env` configuration
- ✅ SQLite setup for quick testing

## 🔐 Security Keys Generated

The following secure values have been generated and added to your `.env`:

- **APP_KEYS**: 3 random 32-byte base64 strings (comma-separated)
- **ADMIN_JWT_SECRET**: 32-byte random key for admin JWT tokens
- **API_TOKEN_SALT**: 16-byte random salt for API tokens
- **TRANSFER_TOKEN_SALT**: 16-byte random salt for transfer tokens
- **ENCRYPTION_KEY**: 32-byte random key for data encryption

## 🗄️ Database Setup Options

### Option 1: SQLite (Quick Setup - Current)
```bash
# Your .env is already configured for SQLite
DATABASE_CLIENT=sqlite
DATABASE_FILENAME=.tmp/data.db
```

**Pros**: Quick setup, no external dependencies
**Cons**: Not suitable for high-traffic production, limited concurrent users

### Option 2: PostgreSQL (Recommended for Production)

#### Install PostgreSQL (macOS)
```bash
brew install postgresql
brew services start postgresql
```

#### Create Database and User
```bash
# Create database
createdb cityshopping_prod

# Connect to PostgreSQL
psql cityshopping_prod

# Create user (replace with your values)
CREATE USER cityshopping_user WITH PASSWORD 'your_secure_password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE cityshopping_prod TO cityshopping_user;

# Exit psql
\q
```

#### Update .env for PostgreSQL
Replace the SQLite section in your `.env` with:
```env
DATABASE_CLIENT=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=cityshopping_prod
DATABASE_USERNAME=cityshopping_user
DATABASE_PASSWORD=your_secure_password
DATABASE_SSL=false
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10
DATABASE_CONNECTION_TIMEOUT=60000
DATABASE_SCHEMA=public
```

### Option 3: MySQL

#### Install MySQL (macOS)
```bash
brew install mysql
brew services start mysql
```

#### Create Database and User
```bash
# Connect to MySQL
mysql -u root -p

# Create database
CREATE DATABASE cityshopping_prod;

# Create user
CREATE USER 'cityshopping_user'@'localhost' IDENTIFIED BY 'your_secure_password';

# Grant privileges
GRANT ALL PRIVILEGES ON cityshopping_prod.* TO 'cityshopping_user'@'localhost';
FLUSH PRIVILEGES;

# Exit MySQL
EXIT;
```

#### Update .env for MySQL
```env
DATABASE_CLIENT=mysql
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_NAME=cityshopping_prod
DATABASE_USERNAME=cityshopping_user
DATABASE_PASSWORD=your_secure_password
DATABASE_SSL=false
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10
DATABASE_CONNECTION_TIMEOUT=60000
```

## 🚀 Starting the Server

### Development Mode
```bash
npm run develop
```

### Production Mode
```bash
NODE_ENV=production npm run start
```

### With PM2 (Recommended for Production)
```bash
# Install PM2 globally
npm install -g pm2

# Start the application
pm2 start "npm run start" --name strapi-api

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

## 🌐 Reverse Proxy Setup (Nginx)

### Install Nginx (macOS)
```bash
brew install nginx
```

### Nginx Configuration
Create `/usr/local/etc/nginx/sites-available/cityshopping`:
```nginx
server {
    listen 80;
    server_name your-domain.com;

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

### Enable Site
```bash
# Create symlink
sudo ln -s /usr/local/etc/nginx/sites-available/cityshopping /usr/local/etc/nginx/sites-enabled/

# Test configuration
nginx -t

# Start/restart Nginx
brew services start nginx
```

## 🔒 SSL Certificate (Let's Encrypt)

### Install Certbot
```bash
brew install certbot
```

### Get SSL Certificate
```bash
sudo certbot --nginx -d your-domain.com
```

## 📱 App Configuration

### React Native App
Update `cityshopping/src/config.js`:
```javascript
// For production
export const API_URL = "https://your-domain.com";

// For Android emulator
// export const API_URL = "http://10.0.2.2:1337";

// For devices on LAN
// export const API_URL = "http://192.168.1.xxx:1337";
```

### Admin Dashboard
Update `LocalVendorHub/.env`:
```env
VITE_API_URL=https://your-domain.com
```

## 🔧 Environment Variables Summary

### Required for Production
- ✅ `APP_KEYS` - Generated
- ✅ `ADMIN_JWT_SECRET` - Generated
- ✅ `API_TOKEN_SALT` - Generated
- ✅ `TRANSFER_TOKEN_SALT` - Generated
- ✅ `ENCRYPTION_KEY` - Generated
- ✅ `DATABASE_*` - Configure based on your choice
- ✅ `NODE_ENV=production`

### Optional
- `WEBHOOKS_POPULATE_RELATIONS=false`
- `HOST=0.0.0.0`
- `PORT=1337`

## 🧪 Testing Your Setup

1. **Start the server**: `npm run develop`
2. **Access admin panel**: `http://localhost:1337/admin`
3. **Test API**: `http://localhost:1337/api/health`
4. **Test orders endpoint**: `http://localhost:1337/api/orders`

## 🔄 Migration from Development

If you have existing data in development:

1. **Export data**:
   ```bash
   npm run strapi export --no-encrypt
   ```

2. **Import data**:
   ```bash
   npm run strapi import -f export_*.tar.gz
   ```

## 🚨 Security Checklist

- ✅ Strong random keys generated
- ✅ Database credentials secured
- ✅ Reverse proxy configured
- ✅ SSL certificate installed
- ✅ Firewall rules set
- ✅ Regular backups scheduled
- ✅ Monitoring/logging enabled

## 📞 Support

If you encounter issues:
1. Check Strapi logs: `pm2 logs strapi-api`
2. Check Nginx logs: `tail -f /usr/local/var/log/nginx/error.log`
3. Verify database connectivity
4. Check firewall settings 