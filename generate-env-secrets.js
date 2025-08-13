const crypto = require('crypto');

console.log('🔐 Generating secure values for Strapi environment variables...\n');

// Generate APP_KEYS (comma-separated)
const appKeys = Array.from({ length: 3 }, () => crypto.randomBytes(32).toString('base64'));
console.log('APP_KEYS=' + appKeys.join(','));

// Generate ADMIN_JWT_SECRET
const adminJwtSecret = crypto.randomBytes(32).toString('base64');
console.log('ADMIN_JWT_SECRET=' + adminJwtSecret);

// Generate API_TOKEN_SALT
const apiTokenSalt = crypto.randomBytes(16).toString('base64');
console.log('API_TOKEN_SALT=' + apiTokenSalt);

// Generate TRANSFER_TOKEN_SALT
const transferTokenSalt = crypto.randomBytes(16).toString('base64');
console.log('TRANSFER_TOKEN_SALT=' + transferTokenSalt);

// Generate ENCRYPTION_KEY
const encryptionKey = crypto.randomBytes(32).toString('base64');
console.log('ENCRYPTION_KEY=' + encryptionKey);

console.log('\n📝 Copy these values to your .env file');
console.log('⚠️  Keep these secrets secure and never commit them to version control!'); 