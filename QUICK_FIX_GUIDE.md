# Quick Fix for 403 Forbidden Error

## 🚨 **Problem**
The React Native app is getting a 403 Forbidden error when trying to create orders because the Strapi permissions aren't set up correctly.

## ✅ **Solution**

### **Step 1: Access Strapi Admin Panel**
1. Open your browser
2. Go to: http://localhost:1337/admin
3. Login with your admin credentials

### **Step 2: Set Up Order Permissions**
1. In the left sidebar, click **Settings** (gear icon)
2. Click **Users & Permissions plugin**
3. Click **Roles**
4. Click on **Authenticated** role
5. Scroll down to find **Order** in the list
6. Enable these permissions:
   - ✅ **find** - to view orders
   - ✅ **findOne** - to view individual orders  
   - ✅ **create** - to create orders
   - ✅ **update** - to update orders
   - ✅ **delete** - to delete orders (optional)
7. Click **Save**

### **Step 3: Test the Fix**
1. Go back to your React Native app
2. Try to place an order again
3. The 403 error should be resolved

## 🔧 **Alternative: Quick Test Script**

If you want to test the API directly, run this command:

```bash
cd /Users/themacintosh/cityshopping-backend
node test-simple-order.js
```

## 📱 **Expected Result**
After setting permissions:
- ✅ Orders can be created from React Native app
- ✅ Orders are saved to Strapi database
- ✅ Orders appear in Strapi admin panel
- ✅ Orders can be viewed in the app's Orders screen

## 🆘 **If Still Having Issues**
1. Check Strapi logs for errors
2. Verify the order content type exists
3. Make sure Strapi is running on port 1337
4. Check that the React Native app is using the correct API URL 