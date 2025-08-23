'use strict';

/**
 * cart controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::cart.cart', ({ strapi }) => ({
  // Get cart for current user
  async getUserCart(ctx) {
    try {
      const { user } = ctx.state;
      
      // If user is not authenticated, return empty cart
      if (!user) {
        console.log('🔍 CART: User not authenticated, returning empty cart');
        return ctx.send({
          data: [],
          meta: {
            count: 0
          }
        });
      }

      const cartItems = await strapi.entityService.findMany('api::cart.cart', {
        filters: {
          user: user.id,
          isActive: true
        },
        populate: {
          product: {
            populate: {
              image: true,
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

      return ctx.send({
        data: cartItems,
        meta: {
          count: cartItems.length
        }
      });
    } catch (error) {
      console.error('Error getting user cart:', error);
      return ctx.internalServerError('Error fetching cart');
    }
  },

  // Add item to cart
  async addToCart(ctx) {
    try {
      const { user } = ctx.state;
      const cartData = ctx.request.body.data || ctx.request.body; // Handle both formats

      // If user is not authenticated, return success but don't save to database
      if (!user) {
        console.log('🔍 CART: User not authenticated, skipping database save');
        return ctx.send({
          data: cartData,
          message: 'Item added to local cart (user not authenticated)'
        });
      }

      // Extract data from mobile app format
      const {
        productId,
        productName,
        price,
        image,
        quantity = 1,
        size,
        vendorId,
        vendorName,
        vendorCity,
        vendorState,
        vendorPincode,
        stock,
        categoryName
      } = cartData;

      if (!productId) {
        return ctx.badRequest('Product ID is required');
      }

      // Check if product exists
      const product = await strapi.entityService.findOne('api::product.product', productId, {
        populate: {
          vendor: true
        }
      });

      if (!product) {
        return ctx.notFound('Product not found');
      }

      // Check if item already exists in cart
      const existingCartItem = await strapi.entityService.findMany('api::cart.cart', {
        filters: {
          user: user.id,
          product: productId,
          isActive: true
        }
      });

      if (existingCartItem.length > 0) {
        // Update existing item quantity
        const cartItem = existingCartItem[0];
        const newQuantity = cartItem.quantity + quantity;
        const newTotalPrice = price * newQuantity;

        const updatedCartItem = await strapi.entityService.update('api::cart.cart', cartItem.id, {
          data: {
            quantity: newQuantity,
            totalPrice: newTotalPrice,
            updatedAt: new Date()
          }
        });

        return ctx.send({
          data: updatedCartItem,
          message: 'Cart item updated successfully'
        });
      } else {
        // Create new cart item
        const totalPrice = price * quantity;

        const newCartItem = await strapi.entityService.create('api::cart.cart', {
          data: {
            user: user.id,
            product: productId,
            quantity: quantity,
            price: price,
            totalPrice: totalPrice,
            isActive: true,
            addedAt: new Date(),
            updatedAt: new Date()
          }
        });

        return ctx.send({
          data: newCartItem,
          message: 'Item added to cart successfully'
        });
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      return ctx.internalServerError('Error adding item to cart');
    }
  },

  // Update cart item quantity
  async updateCartItem(ctx) {
    try {
      const { user } = ctx.state;
      const { id } = ctx.params;
      const updateData = ctx.request.body.data || ctx.request.body; // Handle both formats

      // If user is not authenticated, return success but don't update database
      if (!user) {
        console.log('🔍 CART: User not authenticated, skipping database update');
        return ctx.send({
          data: { id, ...updateData },
          message: 'Cart item updated locally (user not authenticated)'
        });
      }

      const { quantity } = updateData;
      if (!quantity || quantity < 1) {
        return ctx.badRequest('Valid quantity is required');
      }

      // Get cart item and verify ownership
      const cartItem = await strapi.entityService.findOne('api::cart.cart', id, {
        populate: {
          product: true,
          user: true
        }
      });

      if (!cartItem) {
        return ctx.notFound('Cart item not found');
      }

      // Check if user field is populated as object or just ID
      const cartItemUserId = cartItem.user?.id || cartItem.user;
      if (cartItemUserId !== user.id) {
        return ctx.forbidden('Not authorized to update this cart item');
      }

      const totalPrice = cartItem.price * quantity;

      const updatedCartItem = await strapi.entityService.update('api::cart.cart', id, {
        data: {
          quantity: quantity,
          totalPrice: totalPrice,
          updatedAt: new Date()
        }
      });

      return ctx.send({
        data: updatedCartItem,
        message: 'Cart item updated successfully'
      });
    } catch (error) {
      console.error('Error updating cart item:', error);
      return ctx.internalServerError('Error updating cart item');
    }
  },

  // Remove item from cart
  async removeFromCart(ctx) {
    try {
      const { user } = ctx.state;
      const { id } = ctx.params;

      // If user is not authenticated, return success but don't update database
      if (!user) {
        console.log('🔍 CART: User not authenticated, skipping database removal');
        return ctx.send({
          message: 'Item removed from local cart (user not authenticated)'
        });
      }

      // Get cart item and verify ownership
      const cartItem = await strapi.entityService.findOne('api::cart.cart', id, {
        populate: {
          user: true
        }
      });

      if (!cartItem) {
        return ctx.notFound('Cart item not found');
      }

      // Check if user field is populated as object or just ID
      const cartItemUserId = cartItem.user?.id || cartItem.user;
      if (cartItemUserId !== user.id) {
        return ctx.forbidden('Not authorized to remove this cart item');
      }

      // Soft delete by setting isActive to false
      await strapi.entityService.update('api::cart.cart', id, {
        data: {
          isActive: false,
          updatedAt: new Date()
        }
      });

      return ctx.send({
        message: 'Item removed from cart successfully'
      });
    } catch (error) {
      console.error('Error removing from cart:', error);
      return ctx.internalServerError('Error removing item from cart');
    }
  },

  // Clear user's cart
  async clearCart(ctx) {
    try {
      const { user } = ctx.state;

      // If user is not authenticated, return success but don't update database
      if (!user) {
        console.log('🔍 CART: User not authenticated, skipping database clear');
        return ctx.send({
          message: 'Local cart cleared (user not authenticated)',
          meta: {
            itemsRemoved: 0
          }
        });
      }

      // Get all active cart items for user
      const cartItems = await strapi.entityService.findMany('api::cart.cart', {
        filters: {
          user: user.id,
          isActive: true
        }
      });

      // Soft delete all items
      for (const item of cartItems) {
        await strapi.entityService.update('api::cart.cart', item.id, {
          data: {
            isActive: false,
            updatedAt: new Date()
          }
        });
      }

      return ctx.send({
        message: 'Cart cleared successfully',
        meta: {
          itemsRemoved: cartItems.length
        }
      });
    } catch (error) {
      console.error('Error clearing cart:', error);
      return ctx.internalServerError('Error clearing cart');
    }
  }
})); 