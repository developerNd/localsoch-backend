# 🚀 VPS Deployment Checklist

## Before You Start
- [ ] VPS with Ubuntu 20.04+ purchased
- [ ] SSH access to VPS
- [ ] Domain name (optional but recommended)
- [ ] GitHub repository with your backend code

## Step-by-Step Commands

### 1. Connect to VPS
```bash
ssh root@your-vps-ip
```

### 2. Update System
```bash
sudo apt update && sudo apt upgrade -y
```

### 3. Install Dependencies
```bash
# Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Other tools
sudo apt install git nginx postgresql postgresql-contrib certbot python3-certbot-nginx build-essential -y
sudo npm install -g pm2
```

### 4. Create User
```bash
sudo adduser strapi
sudo usermod -aG sudo strapi
su - strapi
```

### 5. Clone Repository
```bash
git clone https://github.com/your-username/cityshopping-backend.git
cd cityshopping-backend
npm install
```

### 6. Setup Database
```bash
sudo -u postgres psql
CREATE DATABASE cityshopping_prod;
CREATE USER strapi_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE cityshopping_prod TO strapi_user;
\q
```

### 7. Configure Environment
```bash
cp env.production.example .env
nano .env
# Update with your values (see VPS_SETUP_GUIDE.md for details)
```

### 8. Build Application
```bash
npm run build
```

### 9. Setup PM2
```bash
mkdir -p /home/strapi/logs
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 10. Configure Nginx
```bash
sudo nano /etc/nginx/sites-available/cityshopping
# Add configuration (see VPS_SETUP_GUIDE.md)

sudo ln -s /etc/nginx/sites-available/cityshopping /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

### 11. Setup SSL (if you have domain)
```bash
sudo certbot --nginx -d your-domain.com
```

### 12. Configure Firewall
```bash
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### 13. Test Setup
```bash
pm2 status
curl http://localhost:1337/api/orders
```

### 14. Setup Backups
```bash
chmod +x backup.sh
crontab -e
# Add: 0 2 * * * /home/strapi/cityshopping-backend/backup.sh
```

## Quick Commands After Setup

### Check Status
```bash
pm2 status
pm2 logs strapi-api
sudo systemctl status nginx
sudo systemctl status postgresql
```

### Deploy Updates
```bash
chmod +x deploy.sh
./deploy.sh
```

### Manual Backup
```bash
./backup.sh
```

### Restart Services
```bash
pm2 restart strapi-api
sudo systemctl restart nginx
sudo systemctl restart postgresql
```

## Troubleshooting

### If Strapi won't start:
```bash
pm2 logs strapi-api
# Check for database connection errors
# Verify .env file is correct
```

### If Nginx won't start:
```bash
sudo nginx -t
sudo tail -f /var/log/nginx/error.log
```

### If database connection fails:
```bash
sudo systemctl status postgresql
sudo -u postgres psql -d cityshopping_prod
```

## Security Notes
- ✅ Change default SSH port
- ✅ Use SSH keys instead of passwords
- ✅ Keep system updated
- ✅ Monitor logs regularly
- ✅ Backup data regularly

## Performance Tips
- Use PM2 cluster mode for multiple CPU cores
- Configure Nginx caching
- Optimize database queries
- Monitor memory usage 