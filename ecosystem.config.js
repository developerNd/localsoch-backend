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
    time: true,
    // Additional settings for production
    min_uptime: '10s',
    max_restarts: 10,
    restart_delay: 4000,
    // Environment variables
    env_production: {
      NODE_ENV: 'production',
      PORT: 1337
    }
  }]
}; 