'use strict';

/**
 * Safe migration to add FCM token fields to users and vendors
 * This migration is designed to preserve all existing data
 */

async function up(knex) {
  try {
    // For SQLite, we'll use a try-catch approach to check if columns exist
    // since SQLite doesn't have information_schema.columns
    
    // Check if fcmToken column already exists in users table
    try {
      await knex.schema.alterTable('up_users', (table) => {
        table.string('fcmToken').nullable();
      });
      console.log('✅ Added fcmToken column to up_users table');
    } catch (error) {
      if (error.message.includes('duplicate column name') || error.message.includes('already exists')) {
        console.log('ℹ️ fcmToken column already exists in up_users table');
      } else {
        throw error;
      }
    }

    // Check if fcmToken column already exists in vendors table
    try {
      await knex.schema.alterTable('vendors', (table) => {
        table.string('fcmToken').nullable();
      });
      console.log('✅ Added fcmToken column to vendors table');
    } catch (error) {
      if (error.message.includes('duplicate column name') || error.message.includes('already exists')) {
        console.log('ℹ️ fcmToken column already exists in vendors table');
      } else {
        throw error;
      }
    }

    console.log('✅ Safe migration completed - all existing data preserved');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

async function down(knex) {
  try {
    // For SQLite, we'll use a try-catch approach to check if columns exist
    // since SQLite doesn't have information_schema.columns
    
    // Remove fcmToken column from users table (only if it exists)
    try {
      await knex.schema.alterTable('up_users', (table) => {
        table.dropColumn('fcmToken');
      });
      console.log('✅ Removed fcmToken column from up_users table');
    } catch (error) {
      if (error.message.includes('no such column') || error.message.includes('does not exist')) {
        console.log('ℹ️ fcmToken column does not exist in up_users table');
      } else {
        throw error;
      }
    }

    // Remove fcmToken column from vendors table (only if it exists)
    try {
      await knex.schema.alterTable('vendors', (table) => {
        table.dropColumn('fcmToken');
      });
      console.log('✅ Removed fcmToken column from vendors table');
    } catch (error) {
      if (error.message.includes('no such column') || error.message.includes('does not exist')) {
        console.log('ℹ️ fcmToken column does not exist in vendors table');
      } else {
        throw error;
      }
    }

    console.log('✅ Rollback completed');
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    throw error;
  }
}

module.exports = { up, down }; 