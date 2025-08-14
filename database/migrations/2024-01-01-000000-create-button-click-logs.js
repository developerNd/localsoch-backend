'use strict';

/**
 * Migration to create button-click-logs table
 * This migration ensures the button-click-logs collection is properly created
 */

module.exports = {
  async up(knex) {
    // This migration is handled by Strapi's content type system
    // The table will be created automatically when Strapi starts
    console.log('Button-click-logs table will be created by Strapi content type system');
  },

  async down(knex) {
    // Drop the table if needed
    await knex.schema.dropTableIfExists('button_click_logs');
  }
}; 