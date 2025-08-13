const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up production environment...\n');

// Read the current .env file
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, 'env.production.example');

if (!fs.existsSync(envPath)) {
  console.log('❌ No .env file found. Creating one...');
  
  if (fs.existsSync(envExamplePath)) {
    // Copy the example and modify for SQLite
    let envContent = fs.readFileSync(envExamplePath, 'utf8');
    
    // Comment out PostgreSQL and enable SQLite for quick setup
    envContent = envContent.replace(
      /DATABASE_CLIENT=postgres/,
      '# DATABASE_CLIENT=postgres'
    );
    envContent = envContent.replace(
      /# DATABASE_CLIENT=sqlite/,
      'DATABASE_CLIENT=sqlite'
    );
    envContent = envContent.replace(
      /# DATABASE_FILENAME=\.tmp\/data\.db/,
      'DATABASE_FILENAME=.tmp/data.db'
    );
    
    // Comment out PostgreSQL URL
    envContent = envContent.replace(
      /DATABASE_URL=postgres:\/\/username:password@localhost:5432\/cityshopping_prod/,
      '# DATABASE_URL=postgres://username:password@localhost:5432/cityshopping_prod'
    );
    
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Created .env file with SQLite configuration for quick setup');
  } else {
    console.log('❌ env.production.example not found');
    process.exit(1);
  }
} else {
  console.log('✅ .env file already exists');
}

console.log('\n📋 Next steps:');
console.log('1. For SQLite (quick setup): Your .env is ready to use');
console.log('2. For PostgreSQL:');
console.log('   - Install PostgreSQL');
console.log('   - Create database: cityshopping_prod');
console.log('   - Update .env with your database credentials');
console.log('   - Uncomment PostgreSQL lines and comment SQLite lines');
console.log('3. Start the server: npm run develop');
console.log('4. Access admin panel: http://localhost:1337/admin');

console.log('\n🔧 Database Setup Commands:');
console.log('\nPostgreSQL:');
console.log('  # Install PostgreSQL (macOS)');
console.log('  brew install postgresql');
console.log('  brew services start postgresql');
console.log('  createdb cityshopping_prod');
console.log('  psql cityshopping_prod');
console.log('  # Create user if needed');
console.log('  CREATE USER your_user WITH PASSWORD \'your_password\';');
console.log('  GRANT ALL PRIVILEGES ON DATABASE cityshopping_prod TO your_user;');

console.log('\nMySQL:');
console.log('  # Install MySQL (macOS)');
console.log('  brew install mysql');
console.log('  brew services start mysql');
console.log('  mysql -u root -p');
console.log('  CREATE DATABASE cityshopping_prod;');
console.log('  CREATE USER \'your_user\'@\'localhost\' IDENTIFIED BY \'your_password\';');
console.log('  GRANT ALL PRIVILEGES ON cityshopping_prod.* TO \'your_user\'@\'localhost\';');
console.log('  FLUSH PRIVILEGES;'); 