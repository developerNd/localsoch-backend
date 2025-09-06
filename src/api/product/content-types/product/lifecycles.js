module.exports = {
  async beforeCreate(event) {
    // Set original price when creating a product with discount
    if (event.params.data.discount && event.params.data.discount > 0) {
      event.params.data.originalPrice = event.params.data.price;
      event.params.data.isOfferActive = true;
      
      // Set default offer dates if not provided
      if (!event.params.data.offerStartDate) {
        event.params.data.offerStartDate = new Date();
      }
      
      if (!event.params.data.offerEndDate) {
        const defaultEndDate = new Date();
        defaultEndDate.setDate(defaultEndDate.getDate() + 10);
        event.params.data.offerEndDate = defaultEndDate;
      }
    }
  },

  async beforeUpdate(event) {
    // Log current product state from database
    try {
      const currentProduct = await strapi.entityService.findOne('api::product.product', event.params.where.id);
    } catch (error) {
      // Silent error handling - no need to log for normal operations
    }
    
    // Check isOfferActive FIRST - this has highest priority
    if (event.params.data.isOfferActive === false) {
      // Always clear offer data when isOfferActive is false
      if (event.params.data.originalPrice) {
        event.params.data.price = event.params.data.originalPrice;
      } else if (event.params.data.mrp) {
        event.params.data.price = event.params.data.mrp;
      }
      
      // Clear all offer-related fields
      event.params.data.discount = 0;
      event.params.data.offerStartDate = null;
      event.params.data.offerEndDate = null;
      event.params.data.originalPrice = null; // Clear originalPrice as well
      
      // Return early - don't process other logic
      return;
    }

    // Handle offer activation when isOfferActive is set to true
    if (event.params.data.isOfferActive === true) {
      if (!event.params.data.originalPrice && event.params.data.mrp) {
        event.params.data.originalPrice = event.params.data.mrp;
      }
      
      // Calculate discount if not provided but price and originalPrice are available
      if (!event.params.data.discount && event.params.data.price && event.params.data.originalPrice) {
        const calculatedDiscount = ((event.params.data.originalPrice - event.params.data.price) / event.params.data.originalPrice) * 100;
        event.params.data.discount = Math.round(calculatedDiscount * 100) / 100;
      }
      
      // Ensure offer dates are set if not provided
      if (!event.params.data.offerStartDate) {
        event.params.data.offerStartDate = new Date();
      }
      
      if (!event.params.data.offerEndDate) {
        const defaultEndDate = new Date();
        defaultEndDate.setDate(defaultEndDate.getDate() + 10);
        event.params.data.offerEndDate = defaultEndDate;
      }
    }

    // Handle discount calculation ONLY if isOfferActive is not explicitly set
    if (event.params.data.discount && event.params.data.discount > 0) {
      // If discount is being added, store original price and activate offer
      if (!event.params.data.originalPrice) {
        event.params.data.originalPrice = event.params.data.price;
      }
      event.params.data.isOfferActive = true;
    } else if (event.params.data.discount === 0 || event.params.data.discount === null) {
      // If discount is removed, revert to original price and deactivate offer
      if (event.params.data.originalPrice) {
        event.params.data.price = event.params.data.originalPrice;
        event.params.data.isOfferActive = false;
        event.params.data.offerStartDate = null;
        event.params.data.offerEndDate = null;
      }
    }
  },

  async afterFindOne(event) {
    // No automatic expired offers checking - handled by scheduled job instead
  },

  async afterFindMany(event) {
    // No automatic expired offers checking - handled by scheduled job instead
  }
}; 