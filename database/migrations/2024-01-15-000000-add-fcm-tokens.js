'use strict';

/**
 * Migration to add FCM token fields to users and vendors
 */

async function up(knex) {
  // Add fcmToken column to users table
  await knex.schema.alterTable('up_users', (table) => {
    table.string('fcmToken').nullable();
  });

  // Add fcmToken column to vendors table
  await knex.schema.alterTable('vendors', (table) => {
    table.string('fcmToken').nullable();
  });

  console.log('✅ Added fcmToken columns to users and vendors tables');
}

async function down(knex) {
  // Remove fcmToken column from users table
  await knex.schema.alterTable('up_users', (table) => {
    table.dropColumn('fcmToken');
  });

  // Remove fcmToken column from vendors table
  await knex.schema.alterTable('vendors', (table) => {
    table.dropColumn('fcmToken');
  });

  console.log('✅ Removed fcmToken columns from users and vendors tables');
}

module.exports = { up, down }; 