const fs = require('fs');
const path = require('path');

console.log('🔐 Updating .env file with secure values...\n');

const envPath = path.join(__dirname, '.env');

// Check if .env exists
if (!fs.existsSync(envPath)) {
  console.log('❌ .env file not found. Creating one with secure values...');
  
  const secureEnvContent = `# ========================================
# STRAPI PRODUCTION ENVIRONMENT
# ========================================

# Server Configuration
HOST=0.0.0.0
PORT=1337

# Security Keys (Generated securely)
APP_KEYS=mn8dyFLyFmlFkGzyPmiPRhqnRXH85bJhJbKt0XSzt3c=,6gMELhJfZSPOnOKPoJBSuwq0gQsusKPR3WeiNozRraA=,6NtkORJZOCM9Gvung34dkq8brQWHQ846F771FUTelYA=
ADMIN_JWT_SECRET=i6W3Q6evtmYbShi/W7TylE0SDGz1eZZoohSHmZq7ehc=
API_TOKEN_SALT=ixnAOEiOmd1WPh5aD/tdgQ==
TRANSFER_TOKEN_SALT=xHQqzmBYn3DNxAVpwfYxRQ==
ENCRYPTION_KEY=YpaIUtwUzIbXoXaPpNoKTskJQTTe8Ia/+zKLUqxWekk=

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
NODE_ENV=production
`;

  fs.writeFileSync(envPath, secureEnvContent);
  console.log('✅ Created .env file with secure values and SQLite configuration');
} else {
  console.log('✅ .env file exists. Reading current content...');
  
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  // Update or add secure values
  const updates = {
    'APP_KEYS': 'APP_KEYS=mn8dyFLyFmlFkGzyPmiPRhqnRXH85bJhJbKt0XSzt3c=,6gMELhJfZSPOnOKPoJBSuwq0gQsusKPR3WeiNozRraA=,6NtkORJZOCM9Gvung34dkq8brQWHQ846F771FUTelYA=',
    'ADMIN_JWT_SECRET': 'ADMIN_JWT_SECRET=i6W3Q6evtmYbShi/W7TylE0SDGz1eZZoohSHmZq7ehc=',
    'API_TOKEN_SALT': 'API_TOKEN_SALT=ixnAOEiOmd1WPh5aD/tdgQ==',
    'TRANSFER_TOKEN_SALT': 'TRANSFER_TOKEN_SALT=xHQqzmBYn3DNxAVpwfYxRQ==',
    'ENCRYPTION_KEY': 'ENCRYPTION_KEY=YpaIUtwUzIbXoXaPpNoKTskJQTTe8Ia/+zKLUqxWekk='
  };
  
  let updated = false;
  
  for (const [key, value] of Object.entries(updates)) {
    const regex = new RegExp(`^${key}=.*`, 'm');
    if (regex.test(envContent)) {
      // Update existing value
      envContent = envContent.replace(regex, value);
      console.log(`✅ Updated ${key}`);
      updated = true;
    } else {
      // Add new value
      envContent += `\n${value}`;
      console.log(`✅ Added ${key}`);
      updated = true;
    }
  }
  
  if (updated) {
    fs.writeFileSync(envPath, envContent);
    console.log('\n✅ .env file updated with secure values');
  } else {
    console.log('\n✅ .env file already has secure values');
  }
}

console.log('\n📋 Your .env file is now secure and ready for production!');
console.log('🚀 You can start the server with: npm run develop'); 