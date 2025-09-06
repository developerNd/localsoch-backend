#!/usr/bin/env node

/**
 * Script to add default shop hours and delivery fees to existing vendors
 * that don't have these settings configured.
 */

const { createStrapi } = require('@strapi/strapi');

async function addDefaultShopSettings() {
  console.log('🚀 Starting to add default shop settings to existing vendors...');
  
  try {
    // Initialize Strapi
    const strapi = await createStrapi();
    
    // Find all vendors
    const vendors = await strapi.entityService.findMany('api::vendor.vendor', {
      populate: ['shopHours', 'deliveryFees']
    });
    
    console.log(`📊 Found ${vendors.length} vendors to check`);
    
    let updatedCount = 0;
    
    for (const vendor of vendors) {
      let needsUpdate = false;
      const updateData = {};
      
      // Check if shop hours need to be added
      if (!vendor.shopHours || Object.keys(vendor.shopHours).length === 0) {
        updateData.shopHours = {
          monday: { isOpen: true, openTime: '09:00:00', closeTime: '18:00:00' },
          tuesday: { isOpen: true, openTime: '09:00:00', closeTime: '18:00:00' },
          wednesday: { isOpen: true, openTime: '09:00:00', closeTime: '18:00:00' },
          thursday: { isOpen: true, openTime: '09:00:00', closeTime: '18:00:00' },
          friday: { isOpen: true, openTime: '09:00:00', closeTime: '18:00:00' },
          saturday: { isOpen: true, openTime: '09:00:00', closeTime: '18:00:00' },
          sunday: { isOpen: false, openTime: '10:00:00', closeTime: '16:00:00' },
          timezone: 'Asia/Kolkata'
        };
        needsUpdate = true;
      }
      
      // Check if delivery fees need to be added
      if (!vendor.deliveryFees || Object.keys(vendor.deliveryFees).length === 0) {
        updateData.deliveryFees = {
          isDeliveryAvailable: true,
          baseDeliveryFee: '50.00',
          freeDeliveryThreshold: '500.00',
          deliveryRadius: '10.00',
          deliveryTime: '1-2 hours'
          // Omit distanceBasedFees and orderValueBasedFees - they're optional and might cause validation issues
        };
        needsUpdate = true;
      }
      
      // Update vendor if needed
      if (needsUpdate) {
        try {
          await strapi.entityService.update('api::vendor.vendor', vendor.id, {
            data: updateData
          });
          updatedCount++;
        } catch (error) {
          console.error(`  ❌ Failed to update vendor ${vendor.name || vendor.id}:`, error.message);
          
          // Try with minimal data if full update fails
          try {
            const minimalData = {};
            if (updateData.shopHours) {
              minimalData.shopHours = {
                monday: { isOpen: true },
                timezone: 'Asia/Kolkata'
              };
            }
            if (updateData.deliveryFees) {
              minimalData.deliveryFees = {
                isDeliveryAvailable: true,
                baseDeliveryFee: '50.00'
              };
            }
            
            await strapi.entityService.update('api::vendor.vendor', vendor.id, {
              data: minimalData
            });
            updatedCount++;
          } catch (minimalError) {
            console.error(`  ❌ Even minimal update failed for vendor ${vendor.name || vendor.id}:`, minimalError.message);
          }
        }
      }
    }
    
    console.log(`\n🎉 Script completed! Updated ${updatedCount} vendors with default shop settings.`);
    
    // Close Strapi
    await strapi.destroy();
    
  } catch (error) {
    console.error('❌ Error running script:', error);
    process.exit(1);
  }
}

// Run the script
addDefaultShopSettings();
