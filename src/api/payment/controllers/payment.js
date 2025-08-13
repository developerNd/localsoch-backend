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
  }
}; 