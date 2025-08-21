const bcrypt = require('bcryptjs');
const knex = require('knex')({
  client: 'sqlite3',
  connection: {
    filename: './.tmp/data.db'
  },
  useNullAsDefault: true
});

async function resetAdminPassword() {
  console.log('🔧 Resetting admin password...\n');

  try {
    // Hash the new password
    const newPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    console.log('🔐 New password will be:', newPassword);
    console.log('🔑 Hashed password:', hashedPassword.substring(0, 20) + '...');

    // Update the admin user's password
    const result = await knex('up_users')
      .where('id', 3)
      .update({
        password: hashedPassword,
        updatedAt: new Date()
      });

    if (result > 0) {
      console.log('✅ Admin password updated successfully');
      console.log('👤 Admin user ID: 3');
      console.log('📧 Email: admin@gmail.com');
      console.log('🔐 New password: admin123');
    } else {
      console.log('❌ Failed to update admin password');
    }

  } catch (error) {
    console.error('❌ Error resetting admin password:', error);
  } finally {
    await knex.destroy();
  }
}

resetAdminPassword().catch(console.error); 