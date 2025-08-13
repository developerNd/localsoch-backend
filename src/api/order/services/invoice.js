'use strict';

/**
 * Invoice service for generating downloadable invoices
 */

module.exports = {
  /**
   * Generate invoice data for an order
   */
  generateInvoiceData(order) {
    const invoiceNumber = `INV-${order.orderNumber}-${Date.now().toString().slice(-6)}`;
    const invoiceDate = new Date().toISOString().split('T')[0];
    
    // Calculate order breakdown
    const subtotal = order.orderItems ? 
      order.orderItems.reduce((sum, item) => sum + (parseFloat(item.totalAmount) || 0), 0) : 
      (order.totalAmount - (order.deliveryCharge || 0));
    
    const deliveryCharge = order.deliveryCharge || 0;
    const tax = 0; // Currently set to 0
    const total = subtotal + deliveryCharge + tax;
    
    return {
      invoiceNumber,
      invoiceDate,
      orderNumber: order.orderNumber,
      orderDate: new Date(order.createdAt).toISOString().split('T')[0],
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      shippingAddress: order.shippingAddress,
      items: order.orderItems || [],
      subtotal: subtotal.toFixed(2),
      deliveryCharge: deliveryCharge.toFixed(2),
      tax: tax.toFixed(2),
      total: total.toFixed(2),
      status: order.status,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      trackingNumber: order.trackingNumber || `TRK${order.id}${Date.now().toString().slice(-6)}`,
    };
  },

  /**
   * Generate a simple text-based invoice
   */
  generateTextInvoice(invoiceData) {
    const lines = [];
    
    // Header
    lines.push('='.repeat(50));
    lines.push('                    CITY SHOPPING');
    lines.push('                    INVOICE');
    lines.push('='.repeat(50));
    lines.push('');
    
    // Invoice details
    lines.push(`Invoice Number: ${invoiceData.invoiceNumber}`);
    lines.push(`Invoice Date: ${invoiceData.invoiceDate}`);
    lines.push(`Order Number: ${invoiceData.orderNumber}`);
    lines.push(`Order Date: ${invoiceData.orderDate}`);
    lines.push('');
    
    // Customer details
    lines.push('CUSTOMER DETAILS:');
    lines.push(`Name: ${invoiceData.customerName}`);
    lines.push(`Email: ${invoiceData.customerEmail}`);
    if (invoiceData.customerPhone) {
      lines.push(`Phone: ${invoiceData.customerPhone}`);
    }
    lines.push('');
    
    // Shipping address
    if (invoiceData.shippingAddress) {
      lines.push('SHIPPING ADDRESS:');
      const address = invoiceData.shippingAddress;
      if (address.street) lines.push(address.street);
      if (address.city) lines.push(address.city);
      if (address.state) lines.push(address.state);
      if (address.pincode) lines.push(address.pincode);
      lines.push('');
    }
    
    // Items
    lines.push('ITEMS:');
    lines.push('-'.repeat(50));
    lines.push('Product Name'.padEnd(30) + 'Qty'.padStart(5) + 'Price'.padStart(8) + 'Total'.padStart(8));
    lines.push('-'.repeat(50));
    
    invoiceData.items.forEach(item => {
      const name = (item.productName || 'Product').substring(0, 28);
      const qty = item.quantity || 1;
      const price = parseFloat(item.totalAmount || 0) / qty;
      const total = parseFloat(item.totalAmount || 0);
      
      lines.push(
        name.padEnd(30) + 
        qty.toString().padStart(5) + 
        `₹${price.toFixed(2)}`.padStart(8) + 
        `₹${total.toFixed(2)}`.padStart(8)
      );
    });
    
    lines.push('-'.repeat(50));
    
    // Summary
    lines.push(`Subtotal:`.padEnd(43) + `₹${invoiceData.subtotal}`.padStart(8));
    lines.push(`Delivery Charge:`.padEnd(43) + `₹${invoiceData.deliveryCharge}`.padStart(8));
    lines.push(`Tax:`.padEnd(43) + `₹${invoiceData.tax}`.padStart(8));
    lines.push('='.repeat(50));
    lines.push(`TOTAL:`.padEnd(43) + `₹${invoiceData.total}`.padStart(8));
    lines.push('='.repeat(50));
    lines.push('');
    
    // Payment and shipping info
    lines.push('PAYMENT INFORMATION:');
    lines.push(`Method: ${invoiceData.paymentMethod || 'COD'}`);
    lines.push(`Status: ${invoiceData.paymentStatus || 'pending'}`);
    lines.push(`Tracking: ${invoiceData.trackingNumber}`);
    lines.push('');
    
    // Footer
    lines.push('Thank you for your purchase!');
    lines.push('For support, contact: support@cityshopping.com');
    lines.push('='.repeat(50));
    
    return lines.join('\n');
  },

  /**
   * Generate invoice filename
   */
  generateInvoiceFilename(invoiceData) {
    return `invoice-${invoiceData.orderNumber}-${invoiceData.invoiceDate}.txt`;
  }
}; 