const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing .env file with clean values...\n');

const cleanEnvContent = `# ========================================
# STRAPI PRODUCTION ENVIRONMENT
# ========================================

# Server Configuration
HOST=localhost
PORT=1337

# Security Keys (Generated securely)
APP_KEYS=mn8dyFLyFmlFkGzyPmiPRhqnRXH85bJhJbKt0XSzt3c=,6gMELhJfZSPOnOKPoJBSuwq0gQsusKPR3WeiNozRraA=,6NtkORJZOCM9Gvung34dkq8brQWHQ846F771FUTelYA=
ADMIN_JWT_SECRET=i6W3Q6evtmYbShi/W7TylE0SDGz1eZZoohSHmZq7ehc=
API_TOKEN_SALT=ixnAOEiOmd1WPh5aD/tdgQ==
TRANSFER_TOKEN_SALT=xHQqzmBYn3DNxAVpwfYxRQ==
ENCRYPTION_KEY=YpaIUtwUzIbXoXaPpNoKTskJQTTe8Ia/+zKLUqxWekk=
JWT_SECRET=your-jwt-secret

# Payment Gateway (Razorpay)
RAZORPAY_KEY_ID=rzp_test_lFR1xyqT46S2QF
RAZORPAY_KEY_SECRET=ft49CcyTYxqQbQipbAPDXnfz

# Webhooks
WEBHOOKS_POPULATE_RELATIONS=false

# ========================================
# DATABASE CONFIGURATION (SQLite for quick setup)
# ========================================
DATABASE_CLIENT=sqlite
DATABASE_FILENAME=.tmp/data.db

# ========================================
# ENVIRONMENT
# ========================================
NODE_ENV=development
`;

const envPath = path.join(__dirname, '.env');

// Backup existing .env
if (fs.existsSync(envPath)) {
  const backupPath = path.join(__dirname, '.env.backup');
  fs.copyFileSync(envPath, backupPath);
  console.log('✅ Backed up existing .env to .env.backup');
}

// Write clean .env
fs.writeFileSync(envPath, cleanEnvContent);
console.log('✅ Created clean .env file with correct values');

console.log('\n📋 What was fixed:');
console.log('- ✅ Removed duplicate APP_KEYS and ADMIN_JWT_SECRET');
console.log('- ✅ Fixed HOST from 0.0.0.0 to localhost');
console.log('- ✅ Set DATABASE_CLIENT to sqlite for quick setup');
console.log('- ✅ Added NODE_ENV=development');
console.log('- ✅ Kept your Razorpay keys');
console.log('- ✅ Organized the file structure');

console.log('\n🚀 You can now start the server with: npm run develop'); 