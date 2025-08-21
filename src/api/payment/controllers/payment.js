const Razorpay = require('razorpay');

// Initialize Razorpay with your credentials
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_lFR1xyqT46S2QF',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'ft49CcyTYxqQbQipbAPDXnfz',
});

module.exports = {
  // Create payment order
  async createOrder(ctx) {
    try {
      const { amount, currency = 'INR', receipt } = ctx.request.body;

      const options = {
        amount: amount * 100, // Convert to paise
        currency,
        receipt: receipt || `receipt_${Date.now()}`,
        notes: {
          source: 'react_native_app'
        }
      };

      const order = await razorpay.orders.create(options);
      
      ctx.send({
        success: true,
        order: {
          id: order.id,
          amount: order.amount,
          currency: order.currency,
          receipt: order.receipt
        }
      });
    } catch (error) {
      console.error('Error creating order:', error);
      ctx.throw(500, 'Failed to create payment order');
    }
  },

  // Verify payment signature
  async verifyPayment(ctx) {
    try {
      const { paymentId, orderId, signature } = ctx.request.body;

      // Verify the payment signature
      const text = orderId + '|' + paymentId;
      const crypto = require('crypto');
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'ft49CcyTYxqQbQipbAPDXnfz')
        .update(text)
        .digest('hex');

      if (expectedSignature === signature) {
        ctx.send({
          success: true,
          verified: true,
          message: 'Payment verified successfully'
        });
      } else {
        ctx.send({
          success: false,
          verified: false,
          message: 'Payment verification failed'
        });
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      ctx.throw(500, 'Failed to verify payment');
    }
  },

  // Complete seller registration after payment
  async completeSellerRegistration(ctx) {
    try {
      const { paymentId, orderId, signature, userId, vendorData, testMode = false } = ctx.request.body;

      // Skip signature verification in test mode
      if (!testMode) {
        // First verify the payment
        const text = orderId + '|' + paymentId;
        const crypto = require('crypto');
        const expectedSignature = crypto
          .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'ft49CcyTYxqQbQipbAPDXnfz')
          .update(text)
          .digest('hex');

        if (expectedSignature !== signature) {
          return ctx.badRequest('Payment verification failed');
        }
      } else {
        console.log('🧪 Test mode: Skipping payment signature verification');
      }

      // Verify the user exists
      const user = await strapi.entityService.findOne('plugin::users-permissions.user', userId);
      if (!user) {
        return ctx.badRequest('User not found');
      }

      // Dynamically find the seller role
      const sellerRole = await strapi.entityService.findMany('plugin::users-permissions.role', {
        filters: {
          name: 'seller'
        }
      });

      if (!sellerRole || sellerRole.length === 0) {
        console.error('❌ Seller role not found in the system');
        return ctx.internalServerError('Seller role not configured in the system');
      }

      const sellerRoleId = sellerRole[0].id;
      console.log('✅ Found seller role with ID:', sellerRoleId);

      // Update user role to seller
      await strapi.entityService.update('plugin::users-permissions.user', userId, {
        data: {
          role: sellerRoleId
        }
      });

      console.log('✅ Updated user role to seller for user ID:', userId);

      // Create vendor profile
      const vendor = await strapi.entityService.create('api::vendor.vendor', {
        data: {
          ...vendorData,
          user: userId,
          isActive: true,
          isApproved: false,
          status: 'pending',
          paymentStatus: 'paid',
          paymentId: paymentId,
          orderId: orderId,
          // Handle business category if provided
          ...(vendorData.businessCategoryId && {
            businessCategory: vendorData.businessCategoryId
          })
        }
      });

      // Handle referral code if provided
      if (vendorData.referralCode) {
        try {
          console.log('🎁 Processing referral code for seller registration:', vendorData.referralCode);
          
          // Use the referral service to apply the code
          const referralService = strapi.service('api::referral.referral');
          const mockCtx = {
            request: {
              body: {
                referralCode: vendorData.referralCode,
                newUserId: userId,
                userType: 'seller'
              }
            },
            send: (data) => {
              console.log('✅ Referral code applied successfully:', data);
              return data;
            },
            badRequest: (message) => {
              console.log('❌ Referral code application failed:', message);
              return { success: false, message };
            }
          };
          
          const referralResponse = await referralService.applyCode(mockCtx);
          
          if (referralResponse && referralResponse.success) {
            console.log('🎉 Referral benefits applied:');
            console.log('   User Reward: ₹', referralResponse.userReward);
            console.log('   Seller Discount: ', referralResponse.sellerDiscount, '%');
          }
        } catch (referralError) {
          console.error('❌ Error processing referral code:', referralError);
          console.warn('⚠️ Vendor created but referral code processing failed');
        }
      }

      console.log('✅ Seller registration completed successfully');
      console.log('   User ID:', userId);
      console.log('   Vendor ID:', vendor.id);
      console.log('   Payment ID:', paymentId);

      return ctx.send({
        success: true,
        data: {
          user: { id: userId, role: 'seller' },
          vendor: vendor,
          payment: {
            paymentId: paymentId,
            orderId: orderId,
            verified: true
          }
        },
        message: 'Seller registration completed successfully'
      });
    } catch (error) {
      console.error('Error completing seller registration:', error);
      return ctx.internalServerError('Failed to complete seller registration');
    }
  }
}; 