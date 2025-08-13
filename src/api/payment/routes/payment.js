module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/payment/create-order',
      handler: 'payment.createOrder',
      config: {
        auth: false, // Allow unauthenticated access for payment creation
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/payment/verify',
      handler: 'payment.verifyPayment',
      config: {
        auth: false, // Allow unauthenticated access for payment verification
        policies: [],
        middlewares: [],
      },
    },
  ],
}; 