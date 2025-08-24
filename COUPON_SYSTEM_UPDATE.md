# 🎁 Coupon System Update - CityShopping Backend

## Overview
Updated the referral system to work as a coupon system where referral codes can be used directly as coupon codes during checkout.

## ✅ Changes Made

### 1. **New Coupon API** (`src/api/coupon/`)
- **Content Type**: `coupon/schema.json` - Defines coupon structure
- **Controller**: `coupon/controllers/coupon.js` - Handles validation and creation
- **Routes**: `coupon/routes/coupon.js` - API endpoints

### 2. **Updated Referral System**
- **Modified**: `referral/controllers/referral.js`
- **Removed**: Automatic coupon creation during registration
- **Added**: Direct referral code validation in coupon system

### 3. **New API Endpoints**
- `POST /api/coupons/validate` - Validate and apply coupon codes
- `POST /api/coupons/create-referral` - Create referral coupons (legacy)
- `POST /api/coupons/test-referral` - Test referral code lookup

## 🔧 How It Works

### **Referral Code Flow:**
1. User generates referral code (e.g., `REF1234567890ABCD`)
2. User shares referral code with friends
3. Friend uses referral code as coupon during checkout
4. System validates referral code and applies 20% discount
5. Referral code marked as used (one-time use)

### **Validation Logic:**
- Checks if code starts with "REF"
- Validates referral code exists in database
- Checks expiration date
- Ensures code hasn't been used by current user
- Applies 20% discount with ₹100 minimum order

## 🧪 Testing

### **Test Script**: `test-coupon-system.js`
```bash
node test-coupon-system.js
```

### **Manual Testing:**
1. Generate referral code via ProfileScreen
2. Use referral code as coupon in CheckoutScreen
3. Verify 20% discount applied
4. Confirm one-time use restriction

## 🚀 Starting the Backend

### **Option 1: Using startup script**
```bash
./start-backend.sh
```

### **Option 2: Manual start**
```bash
cd cityshopping-backend
npm install
npm run develop
```

## 📊 Database Schema

### **Coupon Collection:**
```json
{
  "code": "string (unique)",
  "discountPercentage": "decimal (default: 20)",
  "minOrderAmount": "decimal (default: 100)",
  "usageLimit": "integer (default: 1)",
  "isActive": "boolean (default: true)",
  "expiresAt": "datetime",
  "couponType": "enum (referral|promotional|loyalty)"
}
```

### **Referral Collection:**
```json
{
  "referralCode": "string (unique, includes REF prefix)",
  "referrer": "relation to user",
  "referredUser": "relation to user",
  "status": "enum (pending|completed|expired)",
  "expiresAt": "datetime"
}
```

## 🔍 Debugging

### **Console Logs Added:**
- Coupon validation process
- Referral code lookup
- Error messages
- Success confirmations

### **Test Endpoint:**
- `POST /api/coupons/test-referral` - Check if referral code exists

## ⚠️ Important Notes

1. **Referral codes include "REF" prefix** - Don't add extra "REF" when using
2. **One-time use per user** - Each referral code can only be used once
3. **30-day expiration** - Referral codes expire after 30 days
4. **Minimum order ₹100** - Required for coupon to be valid

## 🎯 Next Steps

1. Start backend server
2. Test coupon system with mobile app
3. Monitor console logs for any issues
4. Verify referral tracking works correctly 