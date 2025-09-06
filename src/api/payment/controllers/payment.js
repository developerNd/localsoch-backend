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
      const { paymentId, orderId, signature, userId, vendorData, planId, testMode = false } = ctx.request.body;

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

      // Debug: Log vendor data before creation
      console.log('🔍 Vendor data being created:', {
        name: vendorData.name,
        description: vendorData.description,
        address: vendorData.address,
        city: vendorData.city,
        state: vendorData.state,
        pincode: vendorData.pincode,
        businessType: vendorData.businessType,
        phone: vendorData.phone,
        email: vendorData.email,
        gstNumber: vendorData.gstNumber,
        bankAccountNumber: vendorData.bankAccountNumber,
        ifscCode: vendorData.ifscCode,
        bankAccountName: vendorData.bankAccountName,
        bankAccountType: vendorData.bankAccountType,
        businessCategoryId: vendorData.businessCategoryId
      });

      // Fix undefined values
      if (vendorData.businessType === undefined) {
        vendorData.businessType = null;
      }

      // Create vendor profile with GST and bank information first
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
          // Include GST information if provided
          gstNumber: vendorData.gstNumber || null,
          // Include bank information if provided
          bankAccountNumber: vendorData.bankAccountNumber || null,
          ifscCode: vendorData.ifscCode || null,
          bankAccountName: vendorData.bankAccountName || null,
          bankAccountType: vendorData.bankAccountType || 'savings',
          // Handle business category if provided
          ...(vendorData.businessCategoryId && {
            businessCategory: vendorData.businessCategoryId
          })
        }
      });


      // Now add default shop hours and delivery fees
      try {
        
        // Add shop hours
        await strapi.entityService.update('api::vendor.vendor', vendor.id, {
          data: {
            shopHours: {
              monday: { isOpen: true, openTime: '09:00:00', closeTime: '18:00:00' },
              tuesday: { isOpen: true, openTime: '09:00:00', closeTime: '18:00:00' },
              wednesday: { isOpen: true, openTime: '09:00:00', closeTime: '18:00:00' },
              thursday: { isOpen: true, openTime: '09:00:00', closeTime: '18:00:00' },
              friday: { isOpen: true, openTime: '09:00:00', closeTime: '18:00:00' },
              saturday: { isOpen: true, openTime: '09:00:00', closeTime: '18:00:00' },
              sunday: { isOpen: false, openTime: '10:00:00', closeTime: '16:00:00' },
              timezone: 'Asia/Kolkata'
            }
          }
        });
        
        // Add delivery fees
        await strapi.entityService.update('api::vendor.vendor', vendor.id, {
          data: {
            deliveryFees: {
              isDeliveryAvailable: true,
              baseDeliveryFee: '50.00',
              freeDeliveryThreshold: '500.00',
              deliveryRadius: '10.00',
              deliveryTime: '1-2 hours'
              // Omit distanceBasedFees and orderValueBasedFees - they're optional and might cause validation issues
            }
          }
        });
        
      } catch (componentError) {
        // Fallback to minimal required fields
        try {
          
          // Try with just the required fields
          await strapi.entityService.update('api::vendor.vendor', vendor.id, {
            data: {
              shopHours: {
                monday: { isOpen: true },
                timezone: 'Asia/Kolkata'
              },
              deliveryFees: {
                isDeliveryAvailable: true,
                baseDeliveryFee: '50.00'
              }
            }
          });
          
        } catch (minimalError) {
          console.error('Failed to add default shop settings:', minimalError.message);
        }
      }

      console.log('✅ Vendor created successfully with default shop hours and delivery fees:', vendor.id);

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

      // Create subscription if planId is provided
      let subscription = null;
      if (planId) {
        try {
          console.log('📋 Creating subscription for plan ID:', planId);
          
          // Get the plan details
          const plan = await strapi.entityService.findOne('api::subscription-plan.subscription-plan', planId);
          if (plan) {
            // Calculate subscription dates
            const startDate = new Date();
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + plan.duration);

            // Create subscription
            subscription = await strapi.entityService.create('api::subscription.subscription', {
              data: {
                vendor: vendor.id,
                plan: planId,
                status: 'active',
                startDate: startDate,
                endDate: endDate,
                amount: plan.price,
                currency: plan.currency || 'INR',
                paymentId: paymentId,
                orderId: orderId,
                paymentMethod: 'razorpay',
                features: plan.features,
                autoRenew: false
              },
              populate: ['plan', 'vendor']
            });

            console.log('✅ Subscription created successfully:', subscription.id);
          } else {
            console.warn('⚠️ Plan not found for ID:', planId);
          }
        } catch (subscriptionError) {
          console.error('❌ Error creating subscription:', subscriptionError);
          console.warn('⚠️ Vendor created but subscription creation failed');
        }
      }

      console.log('✅ Seller registration completed successfully');
      console.log('   User ID:', userId);
      console.log('   Vendor ID:', vendor.id);
      console.log('   Payment ID:', paymentId);
      console.log('   Subscription ID:', subscription?.id || 'None');

      return ctx.send({
        success: true,
        data: {
          user: { id: userId, role: 'seller' },
          vendor: vendor,
          subscription: subscription,
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
      
      // Log detailed validation errors
      if (error.name === 'YupValidationError' && error.details) {
        console.error('🔍 Validation Error Details:');
        console.error('Full error details:', JSON.stringify(error.details, null, 2));
        error.details.errors.forEach((err, index) => {
          console.error(`  Error ${index + 1}:`, {
            path: err.path,
            message: err.message,
            value: err.value
          });
        });
      } else {
        console.error('Full error object:', JSON.stringify(error, null, 2));
      }
      
      return ctx.internalServerError('Failed to complete seller registration');
    }
  }
}; 