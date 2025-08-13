# 🏪 Pick from Shop Feature Documentation

## Overview

The "Pick from Shop" feature allows customers to choose between **home delivery** and **pickup from the shop** when placing orders. This feature provides flexibility for customers and can help reduce delivery costs for vendors.

## 🎯 Features

### ✅ **Customer Features**
- **Delivery Type Selection**: Choose between "Home Delivery" and "Pick from Shop"
- **Pickup Time Selection**: Select pickup time (30min, 1hour, 2hours, custom)
- **Shop Address Display**: Shows vendor's shop address for pickup
- **Cost Savings**: No delivery charge for pickup orders
- **Order Tracking**: Track pickup orders with special pickup status

### ✅ **Vendor Features**
- **Order Management**: View and manage pickup orders in dashboard
- **Pickup Details**: See pickup address, time, and customer information
- **Status Updates**: Update pickup order status (pending → confirmed → ready → picked up)
- **Shop Information**: Display shop address and contact details

### ✅ **Admin Features**
- **Order Overview**: View all pickup and delivery orders
- **Analytics**: Track pickup vs delivery order statistics
- **Vendor Management**: Manage shop addresses and pickup settings

## 🏗️ Technical Implementation

### **Database Schema Updates**

#### **Order Content Type** (`src/api/order/content-types/order/schema.json`)
```json
{
  "deliveryType": { 
    "type": "enumeration", 
    "enum": ["delivery", "pickup"], 
    "default": "delivery" 
  },
  "pickupAddress": { 
    "type": "json" 
  },
  "pickupTime": { 
    "type": "string" 
  }
}
```

#### **Vendor Content Type** (`src/api/vendor/content-types/vendor/schema.json`)
```json
{
  "address": { "type": "text" },
  "contact": { "type": "string" },
  "whatsapp": { "type": "string" }
}
```

### **Frontend Implementation**

#### **React Native App**
- **CheckoutScreen**: Delivery type selection with pickup options
- **OrderCard**: Display pickup information for pickup orders
- **OrdersScreen**: Transform and display pickup order data

#### **Dashboard (LocalVendorHub)**
- **Seller Orders**: View and manage pickup orders
- **Admin Orders**: Overview of all pickup and delivery orders
- **Order Details**: Show pickup address and time information

## 📱 User Flow

### **Customer Journey**

1. **Add Products to Cart**
   - Browse and add products to cart

2. **Proceed to Checkout**
   - Review cart items and total

3. **Select Delivery Type**
   - Choose between "Home Delivery" or "Pick from Shop"
   - If pickup: Select pickup time (30min, 1hour, 2hours, custom)

4. **Review Pickup Details** (if pickup selected)
   - Shop name and address
   - Contact information
   - Pickup time

5. **Complete Order**
   - Select payment method
   - Place order
   - Receive confirmation

6. **Track Order**
   - Monitor order status
   - Receive pickup notifications

### **Vendor Journey**

1. **Receive Pickup Order**
   - Order appears in dashboard with pickup indicator
   - View pickup details (address, time, customer info)

2. **Prepare Order**
   - Update status to "confirmed"
   - Prepare items for pickup

3. **Mark Ready for Pickup**
   - Update status to "ready"
   - Customer receives notification

4. **Complete Pickup**
   - Update status to "picked up" or "delivered"
   - Order completed

## 🔧 Configuration

### **Vendor Setup**

1. **Update Shop Information**
   - Go to Profile → Shop Settings
   - Add/update shop address
   - Add contact information

2. **Enable Pickup**
   - Pickup is automatically enabled for all vendors
   - Shop address is used for pickup orders

### **Admin Configuration**

1. **Order Permissions**
   - Ensure orders can be created with pickup data
   - Verify vendor information is accessible

2. **Status Management**
   - Configure pickup-specific status flows
   - Set up notifications for pickup orders

## 📊 Data Structure

### **Pickup Order Example**
```json
{
  "orderNumber": "ORD-123456789",
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerPhone": "+91 98765 43210",
  "deliveryType": "pickup",
  "pickupAddress": {
    "name": "CityBakery",
    "address": "456 Baker St, Downtown, Mumbai, Maharashtra 400001",
    "contact": "+91 98765 43210"
  },
  "pickupTime": "30min",
  "totalAmount": 150.00,
  "deliveryCharge": 0,
  "status": "pending",
  "paymentMethod": "COD",
  "paymentStatus": "pending",
  "notes": "Pickup in 30min",
  "vendor": 26,
  "user": 4
}
```

### **Delivery Order Example**
```json
{
  "orderNumber": "ORD-123456790",
  "customerName": "Jane Smith",
  "customerEmail": "jane@example.com",
  "customerPhone": "+91 98765 43211",
  "deliveryType": "delivery",
  "shippingAddress": {
    "street": "123 Main Street, Apartment 4B",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400058"
  },
  "totalAmount": 200.00,
  "deliveryCharge": 50.00,
  "status": "pending",
  "paymentMethod": "COD",
  "paymentStatus": "pending",
  "notes": "Please deliver in the morning",
  "vendor": 26,
  "user": 4
}
```

## 🧪 Testing

### **Test Scripts**

1. **Backend Testing** (`test-pickup-order.js`)
   ```bash
   cd cityshopping-backend
   node test-pickup-order.js
   ```

2. **Frontend Testing**
   - Test delivery type selection in checkout
   - Verify pickup address display
   - Test order creation with pickup data
   - Verify order display in dashboard

### **Test Scenarios**

1. **Pickup Order Creation**
   - Create order with deliveryType: "pickup"
   - Verify pickupAddress and pickupTime are saved
   - Check deliveryCharge is 0

2. **Delivery Order Creation**
   - Create order with deliveryType: "delivery"
   - Verify shippingAddress is saved
   - Check deliveryCharge is applied

3. **Order Display**
   - Verify pickup orders show pickup information
   - Verify delivery orders show shipping information
   - Check delivery type badges in admin dashboard

## 🚀 Benefits

### **For Customers**
- **Cost Savings**: No delivery charges for pickup orders
- **Convenience**: Choose pickup time that works for them
- **Speed**: Faster order fulfillment (no delivery time)
- **Flexibility**: Option to pick up immediately or later

### **For Vendors**
- **Reduced Costs**: No delivery expenses for pickup orders
- **Better Control**: Manage pickup timing and customer flow
- **Increased Sales**: Attract customers who prefer pickup
- **Simplified Operations**: No delivery logistics for pickup orders

### **For Platform**
- **Increased Orders**: More customers due to pickup option
- **Better Analytics**: Track pickup vs delivery preferences
- **Reduced Complexity**: Simpler order fulfillment for pickup
- **Competitive Advantage**: Unique feature in the market

## 🔮 Future Enhancements

### **Planned Features**
1. **Pickup Time Slots**: Predefined pickup time slots
2. **Pickup Notifications**: SMS/email notifications for pickup
3. **QR Code Pickup**: QR code-based pickup verification
4. **Pickup Analytics**: Detailed pickup order analytics
5. **Multi-location Pickup**: Pickup from multiple shop locations

### **Advanced Features**
1. **Pickup Scheduling**: Advanced pickup scheduling system
2. **Pickup Reminders**: Automated pickup reminders
3. **Pickup Verification**: Photo-based pickup verification
4. **Pickup Returns**: Simplified return process for pickup orders

## 📞 Support

For technical support or questions about the Pick from Shop feature:

1. **Check Documentation**: Review this documentation first
2. **Test Scripts**: Run test scripts to verify functionality
3. **Database**: Verify order schema is properly updated
4. **Permissions**: Ensure proper permissions are set in Strapi

## 🎉 Conclusion

The Pick from Shop feature provides a comprehensive solution for customers who prefer to collect their orders directly from vendors. It offers cost savings, convenience, and flexibility while maintaining the same high-quality order management experience.

The implementation is robust, scalable, and ready for production use with proper testing and configuration. 