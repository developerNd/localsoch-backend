# 🎁 Manual Static Coupon Setup Guide

## **Issue:**
The automated coupon creation script is failing due to API permission issues. Let's create the coupon manually through the Strapi admin panel.

## **Step-by-Step Instructions:**

### **1. Access Strapi Admin Panel**
```
http://localhost:1337/admin
```

### **2. Navigate to Content Manager**
- Click on **"Content Manager"** in the left sidebar
- Click on **"Coupon"** collection

### **3. Create New Coupon Entry**
- Click **"Create new entry"** button
- Fill in the following details:

| Field | Value |
|-------|-------|
| **Code** | `REF1234567890ABCD` |
| **Discount Percentage** | `20` |
| **Discount Amount** | `0` |
| **Min Order Amount** | `100` |
| **Max Discount Amount** | `1000` |
| **Usage Limit** | `999999` |
| **Used Count** | `0` |
| **Is Active** | ✅ (checked) |
| **Expires At** | `2026-08-23` (1 year from now) |
| **Coupon Type** | `referral` |
| **Description** | `20% off on your first order using referral code - Static coupon for all users` |

### **4. Save and Publish**
- Click **"Save"** button
- Click **"Publish"** button to make it live

### **5. Test the Coupon**
After creating the coupon, test it using the mobile app:
1. Go to Checkout screen
2. Click "Add Coupon Code"
3. Enter: `REF1234567890ABCD`
4. Click "Apply Coupon"

## **Expected Result:**
- ✅ Coupon should be applied successfully
- ✅ 20% discount should be calculated
- ✅ Success message should appear

## **Troubleshooting:**
If you still get 403 errors, you may need to:
1. Go to **Settings > Users & Permissions Plugin > Roles**
2. Edit the **"Authenticated"** role
3. Enable permissions for **"Coupon"** content type
4. Save changes

## **Summary:**
This creates a single static coupon that all users can use with the code `REF1234567890ABCD` for 20% off on orders ₹100+. 