'use strict';

/**
 * product service.
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::product.product', ({ strapi }) => ({
  // Check and update expired offers
  async checkExpiredOffers() {
    try {
      const now = new Date();
      console.log(`🕐 CHECKING EXPIRED OFFERS at ${now.toISOString()}`);
      
      // Find all products with active offers that have expired
      const expiredOffers = await strapi.entityService.findMany('api::product.product', {
        filters: {
          isOfferActive: true,
          offerEndDate: {
            $lt: now
          }
        },
        populate: ['vendor']
      });

      console.log(`🔍 Found ${expiredOffers.length} products with expired offers`);
      
      if (expiredOffers.length > 0) {
        console.log('📋 Products with expired offers:');
        expiredOffers.forEach((product, index) => {
          console.log(`\n📦 EXPIRED PRODUCT ${index + 1}: ${product.attributes?.name || product.name}`);
          console.log(`   - ID: ${product.id}`);
          console.log(`   - isOfferActive: ${product.attributes?.isOfferActive || product.isOfferActive}`);
          console.log(`   - offerStartDate: ${product.attributes?.offerStartDate || product.offerStartDate}`);
          console.log(`   - offerEndDate: ${product.attributes?.offerEndDate || product.offerEndDate}`);
          console.log(`   - currentPrice: ₹${product.attributes?.price || product.price}`);
          console.log(`   - originalPrice: ₹${product.attributes?.originalPrice || product.originalPrice}`);
          console.log(`   - discount: ${product.attributes?.discount || product.discount}%`);
          console.log(`   - MRP: ₹${product.attributes?.mrp || product.mrp}`);
          console.log(`   - stock: ${product.attributes?.stock || product.stock}`);
          console.log(`   - isActive: ${product.attributes?.isActive || product.isActive}`);
          console.log(`   - isApproved: ${product.attributes?.isApproved || product.isApproved}`);
          console.log(`   - approvalStatus: ${product.attributes?.approvalStatus || product.approvalStatus}`);
          console.log(`   - vendor: ${product.vendor?.data?.attributes?.name || product.vendor?.name || 'N/A'}`);
          console.log(`   - category: ${product.category?.data?.attributes?.name || product.category?.name || 'N/A'}`);
          console.log(`   - createdAt: ${product.attributes?.createdAt || product.createdAt}`);
          console.log(`   - updatedAt: ${product.attributes?.updatedAt || product.updatedAt}`);
        });
      }

      let updatedCount = 0;
      
      for (const product of expiredOffers) {
        try {
          // Revert to original price or MRP
          const newPrice = product.originalPrice || product.mrp;
          
          console.log(`🔄 Updating expired offer for product ${product.id} (${product.name})`);
          console.log(`   - Current price: ₹${product.price}`);
          console.log(`   - Reverting to: ₹${newPrice}`);
          
          await strapi.entityService.update('api::product.product', product.id, {
            data: {
              price: newPrice,
              discount: 0,
              isOfferActive: false,
              offerStartDate: null,
              offerEndDate: null
            }
          });
          
          updatedCount++;
          console.log(`✅ Offer expired for product ${product.id} (${product.name}), price reverted to ₹${newPrice}`);
          
        } catch (error) {
          console.error(`❌ Error updating expired offer for product ${product.id}:`, error);
        }
      }
      
      console.log(`✅ Checked expired offers: ${updatedCount} products updated out of ${expiredOffers.length} found`);
      return { updatedCount, totalChecked: expiredOffers.length };
      
    } catch (error) {
      console.error('❌ Error checking expired offers:', error);
      throw error;
    }
  },

  // Activate offer for a product
  async activateOffer(productId, offerData) {
    try {
      const product = await strapi.entityService.findOne('api::product.product', productId);
      
      if (!product) {
        throw new Error('Product not found');
      }

      // Calculate discount percentage
      const originalPrice = product.originalPrice || product.mrp;
      const discountPercentage = ((originalPrice - offerData.price) / originalPrice) * 100;
      
      // Update product with offer details
      const updatedProduct = await strapi.entityService.update('api::product.product', productId, {
        data: {
          price: offerData.price,
          discount: Math.round(discountPercentage * 100) / 100, // Round to 2 decimal places
          offerStartDate: offerData.startDate || new Date(),
          offerEndDate: offerData.endDate,
          isOfferActive: true,
          originalPrice: originalPrice
        }
      });

      console.log(`🎯 Offer activated for product ${productId}: ${discountPercentage.toFixed(1)}% off until ${offerData.endDate}`);
      return updatedProduct;
      
    } catch (error) {
      console.error('Error activating offer:', error);
      throw error;
    }
  },

  // Deactivate offer for a product
  async deactivateOffer(productId) {
    try {
      const product = await strapi.entityService.findOne('api::product.product', productId);
      
      if (!product) {
        throw new Error('Product not found');
      }

      // Revert to original price
      const originalPrice = product.originalPrice || product.mrp;
      
      const updatedProduct = await strapi.entityService.update('api::product.product', productId, {
        data: {
          price: originalPrice,
          discount: 0,
          offerStartDate: null,
          offerEndDate: null,
          isOfferActive: false
        }
      });

      console.log(`❌ Offer deactivated for product ${productId}, price reverted to ₹${originalPrice}`);
      return updatedProduct;
      
    } catch (error) {
      console.error('Error deactivating offer:', error);
      throw error;
    }
  },

  // Get products with active offers
  async getActiveOffers() {
    try {
      const now = new Date();
      console.log(`🔍 GETTING ACTIVE OFFERS at ${now.toISOString()}`);
      
      const activeOffers = await strapi.entityService.findMany('api::product.product', {
        filters: {
          isOfferActive: true,
          offerEndDate: {
            $gt: now
          },
          discount: {
            $gt: 0
          }
        },
        populate: ['vendor', 'category', 'image'],
        sort: { offerEndDate: 'asc' } // Sort by expiry date
      });

      console.log(`📊 Found ${activeOffers.length} active offers`);
      
      if (activeOffers.length > 0) {
        console.log('🎯 Active offers details:');
        activeOffers.forEach((offer, index) => {
          console.log(`\n📦 PRODUCT ${index + 1}: ${offer.attributes?.name || offer.name}`);
          console.log(`   - ID: ${offer.id}`);
          console.log(`   - isOfferActive: ${offer.attributes?.isOfferActive || offer.isOfferActive}`);
          console.log(`   - offerStartDate: ${offer.attributes?.offerStartDate || offer.offerStartDate}`);
          console.log(`   - offerEndDate: ${offer.attributes?.offerEndDate || offer.offerEndDate}`);
          console.log(`   - currentPrice: ₹${offer.attributes?.price || offer.price}`);
          console.log(`   - originalPrice: ₹${offer.attributes?.originalPrice || offer.originalPrice}`);
          console.log(`   - discount: ${offer.attributes?.discount || offer.discount}%`);
          console.log(`   - MRP: ₹${offer.attributes?.mrp || offer.mrp}`);
          console.log(`   - stock: ${offer.attributes?.stock || offer.stock}`);
          console.log(`   - isActive: ${offer.attributes?.isActive || offer.isActive}`);
          console.log(`   - isApproved: ${offer.attributes?.isApproved || offer.isApproved}`);
          console.log(`   - approvalStatus: ${offer.attributes?.approvalStatus || offer.approvalStatus}`);
          console.log(`   - vendor: ${offer.vendor?.data?.attributes?.name || offer.vendor?.name || 'N/A'}`);
          console.log(`   - category: ${offer.category?.data?.attributes?.name || offer.category?.name || 'N/A'}`);
          console.log(`   - image: ${offer.image?.data?.attributes?.url || offer.image?.url || 'N/A'}`);
          console.log(`   - createdAt: ${offer.attributes?.createdAt || offer.createdAt}`);
          console.log(`   - updatedAt: ${offer.attributes?.updatedAt || offer.updatedAt}`);
        });
      } else {
        console.log('⚠️ No active offers found. Checking why...');
        
        // Let's check what products exist with isOfferActive = true
        const allActiveOffers = await strapi.entityService.findMany('api::product.product', {
          filters: {
            isOfferActive: true
          },
          populate: ['vendor']
        });
        
        console.log(`🔍 Found ${allActiveOffers.length} products with isOfferActive = true`);
        
        if (allActiveOffers.length > 0) {
          console.log('📋 Products with isOfferActive = true:');
          allActiveOffers.forEach((product, index) => {
            console.log(`\n📦 PRODUCT ${index + 1}: ${product.attributes?.name || product.name}`);
            console.log(`   - ID: ${product.id}`);
            console.log(`   - isOfferActive: ${product.attributes?.isOfferActive || product.isOfferActive}`);
            console.log(`   - offerStartDate: ${product.attributes?.offerStartDate || product.offerStartDate}`);
            console.log(`   - offerEndDate: ${product.attributes?.offerEndDate || product.offerEndDate}`);
            console.log(`   - currentPrice: ₹${product.attributes?.price || product.price}`);
            console.log(`   - originalPrice: ₹${product.attributes?.originalPrice || product.originalPrice}`);
            console.log(`   - discount: ${product.attributes?.discount || product.discount}%`);
            console.log(`   - MRP: ₹${product.attributes?.mrp || product.mrp}`);
            console.log(`   - stock: ${product.attributes?.stock || product.stock}`);
            console.log(`   - isActive: ${product.attributes?.isActive || product.isActive}`);
            console.log(`   - isApproved: ${product.attributes?.isApproved || product.isApproved}`);
            console.log(`   - approvalStatus: ${product.attributes?.approvalStatus || product.approvalStatus}`);
            console.log(`   - vendor: ${product.vendor?.data?.attributes?.name || product.vendor?.name || 'N/A'}`);
            console.log(`   - offerEndDate > now: ${product.attributes?.offerEndDate ? new Date(product.attributes.offerEndDate) > now : 'N/A'}`);
            console.log(`   - discount > 0: ${(product.attributes?.discount || product.discount) > 0}`);
          });
        }
      }

      return activeOffers;
      
    } catch (error) {
      console.error('❌ Error getting active offers:', error);
      throw error;
    }
  }
})); 