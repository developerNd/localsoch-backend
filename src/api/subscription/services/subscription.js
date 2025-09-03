'use strict';

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::subscription.subscription', ({ strapi }) => ({
  /**
   * Generate invoice data for a subscription
   */
  generateSubscriptionInvoiceData(subscription) {
    const invoiceNumber = `SUB-INV-${subscription.id}-${Date.now().toString().slice(-6)}`;
    const invoiceDate = new Date().toISOString().split('T')[0];
    
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
      planName: subscription.plan?.name || 'Subscription Plan',
      planDescription: subscription.plan?.description || '',
      planDuration: subscription.plan?.duration || 0,
      planDurationType: subscription.plan?.durationType || 'days',
      startDate: new Date(subscription.startDate).toISOString().split('T')[0],
      endDate: new Date(subscription.endDate).toISOString().split('T')[0],
      amount: subscription.amount,
      currency: subscription.currency || 'INR',
      paymentId: subscription.paymentId,
      orderId: subscription.orderId,
      paymentMethod: subscription.paymentMethod || 'razorpay',
      status: subscription.status,
      features: subscription.features || [],
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