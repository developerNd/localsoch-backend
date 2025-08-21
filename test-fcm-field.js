const strapi = require('@strapi/strapi');

async function testFCMField() {
  console.log('🧪 Testing FCM Field with Strapi Entity Service...\n');

  try {
    // Initialize Strapi
    await strapi().load();
    
    console.log('✅ Strapi loaded successfully');

    // Test updating user with FCM token
    console.log('1️⃣ Updating user with FCM token...');
    const updatedUser = await strapi.entityService.update('plugin::users-permissions.user', 1, {
      data: {
        fcmToken: 'test_fcm_token_from_entity_service'
      }
    });

    console.log('✅ User updated successfully');
    console.log('User ID:', updatedUser.id);
    console.log('FCM Token:', updatedUser.fcmToken);

    // Test getting user with FCM token
    console.log('\n2️⃣ Getting user with FCM token...');
    const user = await strapi.entityService.findOne('plugin::users-permissions.user', 1, {
      fields: ['id', 'username', 'fcmToken']
    });

    console.log('✅ User retrieved successfully');
    console.log('User ID:', user.id);
    console.log('Username:', user.username);
    console.log('FCM Token:', user.fcmToken);

    // Test database directly
    console.log('\n3️⃣ Checking database directly...');
    const { default: knex } = require('knex');
    const dbConfig = require('./config/database.js');
    
    const db = knex(dbConfig.default.connection);
    const result = await db('up_users').where('id', 1).select('id', 'username', 'fcmToken').first();
    
    console.log('✅ Database query successful');
    console.log('User ID:', result.id);
    console.log('Username:', result.username);
    console.log('FCM Token:', result.fcmToken);

    await db.destroy();
    await strapi().destroy();

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testFCMField().catch(console.error); 