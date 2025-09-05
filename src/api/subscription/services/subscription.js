'use strict';

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::subscription.subscription', ({ strapi }) => ({
  /**
   * Generate invoice data for a subscription
   */
  generateSubscriptionInvoiceData(subscription) {
    const invoiceNumber = `INV-${subscription.id}-${Date.now().toString().slice(-4)}`;
    const invoiceDate = new Date().toISOString().split('T')[0];
    
    // Handle plan data properly - check multiple possible locations
    let plan = subscription.plan || subscription.subscriptionPlan;
    
    // If plan is just an ID, we need to fetch the full plan data
    if (plan && typeof plan === 'number') {
      // For now, we'll use the subscription's own data
      plan = null;
    }
    
    // If no plan found, try to get data from subscription itself
    if (!plan) {
      plan = {
        name: subscription.planName || 'Subscription Plan',
        description: subscription.planDescription || '',
        duration: subscription.planDuration || 30,
        durationType: subscription.planDurationType || 'days',
        price: subscription.amount || 0,
        currency: subscription.currency || 'INR',
        features: subscription.features || []
      };
    }
    
    const planFeatures = plan?.features || [];
    
    // Convert features to array if it's a string or object
    let featuresArray = [];
    if (Array.isArray(planFeatures)) {
      featuresArray = planFeatures;
    } else if (typeof planFeatures === 'string') {
      try {
        featuresArray = JSON.parse(planFeatures);
      } catch {
        featuresArray = [planFeatures];
      }
    } else if (planFeatures && typeof planFeatures === 'object') {
      featuresArray = Object.values(planFeatures);
    }
    
    return {
      invoiceNumber,
      invoiceDate,
      subscriptionId: subscription.id,
      subscriptionDate: new Date(subscription.createdAt).toISOString().split('T')[0],
      vendorName: subscription.vendor?.name || 'Vendor',
      vendorEmail: subscription.vendor?.email || '',
      vendorPhone: subscription.vendor?.contact || '',
      vendorAddress: subscription.vendor?.address || '',
      vendorCity: subscription.vendor?.city || '',
      vendorState: subscription.vendor?.state || '',
      vendorPincode: subscription.vendor?.pincode || '',
      planName: plan?.name || 'Subscription Plan',
      planDescription: plan?.description || '',
      planDuration: plan?.duration || 30, // Default to 30 days
      planDurationType: plan?.durationType || 'days',
      startDate: new Date(subscription.startDate).toISOString().split('T')[0],
      endDate: new Date(subscription.endDate).toISOString().split('T')[0],
      amount: subscription.amount || plan?.price || 0,
      currency: subscription.currency || plan?.currency || 'INR',
      paymentId: subscription.paymentId || '',
      orderId: subscription.orderId || '',
      paymentMethod: subscription.paymentMethod || 'razorpay',
      status: subscription.status,
      features: featuresArray,
      autoRenew: subscription.autoRenew || false,
    };
  },

  /**
   * Generate a text-based subscription invoice
   */
  generateSubscriptionTextInvoice(invoiceData) {
    const lines = [];
    
    // Header
    lines.push('='.repeat(60));
    lines.push('                    CITY SHOPPING');
    lines.push('                SUBSCRIPTION INVOICE');
    lines.push('='.repeat(60));
    lines.push('');
    
    // Invoice details
    lines.push(`Invoice Number: ${invoiceData.invoiceNumber}`);
    lines.push(`Invoice Date: ${invoiceData.invoiceDate}`);
    lines.push(`Subscription ID: ${invoiceData.subscriptionId}`);
    lines.push(`Subscription Date: ${invoiceData.subscriptionDate}`);
    lines.push('');
    
    // Vendor details
    lines.push('VENDOR DETAILS:');
    lines.push(`Name: ${invoiceData.vendorName}`);
    if (invoiceData.vendorEmail) {
      lines.push(`Email: ${invoiceData.vendorEmail}`);
    }
    if (invoiceData.vendorPhone) {
      lines.push(`Phone: ${invoiceData.vendorPhone}`);
    }
    if (invoiceData.vendorAddress) {
      lines.push(`Address: ${invoiceData.vendorAddress}`);
      if (invoiceData.vendorCity) {
        lines.push(`         ${invoiceData.vendorCity}, ${invoiceData.vendorState} ${invoiceData.vendorPincode}`);
      }
    }
    lines.push('');
    
    // Plan details
    lines.push('SUBSCRIPTION PLAN:');
    lines.push(`Plan Name: ${invoiceData.planName}`);
    if (invoiceData.planDescription) {
      lines.push(`Description: ${invoiceData.planDescription}`);
    }
    lines.push(`Duration: ${invoiceData.planDuration} ${invoiceData.planDurationType}`);
    lines.push(`Start Date: ${invoiceData.startDate}`);
    lines.push(`End Date: ${invoiceData.endDate}`);
    lines.push(`Auto Renew: ${invoiceData.autoRenew ? 'Yes' : 'No'}`);
    lines.push('');
    
    // Features
    if (invoiceData.features && invoiceData.features.length > 0) {
      lines.push('PLAN FEATURES:');
      invoiceData.features.forEach((feature, index) => {
        lines.push(`${index + 1}. ${feature}`);
      });
      lines.push('');
    }
    
    // Payment details
    lines.push('PAYMENT INFORMATION:');
    lines.push(`Amount: ₹${invoiceData.amount}`);
    lines.push(`Currency: ${invoiceData.currency}`);
    lines.push(`Payment Method: ${invoiceData.paymentMethod}`);
    lines.push(`Payment ID: ${invoiceData.paymentId}`);
    lines.push(`Order ID: ${invoiceData.orderId}`);
    lines.push(`Status: ${invoiceData.status}`);
    lines.push('');
    
    // Summary
    lines.push('='.repeat(60));
    lines.push(`TOTAL AMOUNT: ₹${invoiceData.amount}`);
    lines.push('='.repeat(60));
    lines.push('');
    
    // Footer
    lines.push('Thank you for subscribing to City Shopping!');
    lines.push('For support, contact: support@cityshopping.com');
    lines.push('='.repeat(60));
    
    return lines.join('\n');
  },

  /**
   * Generate subscription invoice filename
   */
  generateSubscriptionInvoiceFilename(invoiceData) {
    return `subscription-invoice-${invoiceData.subscriptionId}-${invoiceData.invoiceDate}.txt`;
  }
})); 