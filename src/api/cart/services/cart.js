'use strict';

/**
 * cart service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::cart.cart', ({ strapi }) => ({
  // Get cart items for a specific user
  async getUserCartItems(userId) {
    return await strapi.entityService.findMany('api::cart.cart', {
      filters: {
        user: userId,
        isActive: true
      },
      populate: {
        product: {
          populate: {
            images: true,
            vendor: {
              populate: {
                businessCategory: true
              }
            }
          }
        }
      }
    });
  },

  // Calculate cart total
  async calculateCartTotal(userId) {
    const cartItems = await this.getUserCartItems(userId);
    return cartItems.reduce((total, item) => total + parseFloat(item.totalPrice), 0);
  },

  // Check if product exists in user's cart
  async isProductInCart(userId, productId) {
    const existingItem = await strapi.entityService.findMany('api::cart.cart', {
      filters: {
        user: userId,
        product: productId,
        isActive: true
      }
    });
    return existingItem.length > 0 ? existingItem[0] : null;
  },

  // Add or update cart item
  async addOrUpdateCartItem(userId, productId, quantity) {
    const product = await strapi.entityService.findOne('api::product.product', productId);
    if (!product) {
      throw new Error('Product not found');
    }

    const existingItem = await this.isProductInCart(userId, productId);
    
    if (existingItem) {
      // Update existing item
      const newQuantity = existingItem.quantity + quantity;
      const newTotalPrice = product.price * newQuantity;
      
      return await strapi.entityService.update('api::cart.cart', existingItem.id, {
        data: {
          quantity: newQuantity,
          totalPrice: newTotalPrice,
          updatedAt: new Date()
        }
      });
    } else {
      // Create new item
      const totalPrice = product.price * quantity;
      
      return await strapi.entityService.create('api::cart.cart', {
        data: {
          user: userId,
          product: productId,
          quantity: quantity,
          price: product.price,
          totalPrice: totalPrice,
          isActive: true,
          addedAt: new Date(),
          updatedAt: new Date()
        }
      });
    }
  },

  // Update cart item quantity
  async updateCartItemQuantity(cartItemId, userId, quantity) {
    const cartItem = await strapi.entityService.findOne('api::cart.cart', cartItemId, {
      populate: {
        product: true
      }
    });

    if (!cartItem) {
      throw new Error('Cart item not found');
    }

    if (cartItem.user !== userId) {
      throw new Error('Not authorized to update this cart item');
    }

    const totalPrice = cartItem.product.price * quantity;

    return await strapi.entityService.update('api::cart.cart', cartItemId, {
      data: {
        quantity: quantity,
        totalPrice: totalPrice,
        updatedAt: new Date()
      }
    });
  },

  // Remove cart item (soft delete)
  async removeCartItem(cartItemId, userId) {
    const cartItem = await strapi.entityService.findOne('api::cart.cart', cartItemId);

    if (!cartItem) {
      throw new Error('Cart item not found');
    }

    if (cartItem.user !== userId) {
      throw new Error('Not authorized to remove this cart item');
    }

    return await strapi.entityService.update('api::cart.cart', cartItemId, {
      data: {
        isActive: false,
        updatedAt: new Date()
      }
    });
  },

  // Clear user's cart (soft delete all items)
  async clearUserCart(userId) {
    const cartItems = await this.getUserCartItems(userId);
    
    for (const item of cartItems) {
      await strapi.entityService.update('api::cart.cart', item.id, {
        data: {
          isActive: false,
          updatedAt: new Date()
        }
      });
    }

    return {
      message: 'Cart cleared successfully',
      itemsRemoved: cartItems.length
    };
  },

  // Get cart summary for user
  async getCartSummary(userId) {
    const cartItems = await this.getUserCartItems(userId);
    const total = await this.calculateCartTotal(userId);
    
    return {
      items: cartItems,
      total: total,
      itemCount: cartItems.length
    };
  }
})); 