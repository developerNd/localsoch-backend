# Quick Setup Guide - Restore Data and Permissions

## ✅ Working Credentials
- **Email**: `admin@cityshopping.com`
- **Password**: `Admin@123`
- **Admin Panel**: http://localhost:1337/admin

## 🔧 Step 1: Login to Admin Panel

1. Open your browser and go to: http://localhost:1337/admin
2. Login with:
   - Email: `admin@cityshopping.com`
   - Password: `Admin@123`

## 🔐 Step 2: Set Up Permissions

### For Public Role (Allows API access without authentication)

1. Go to **Settings** → **Users & Permissions plugin** → **Roles**
2. Click on **Public** role
3. Enable these permissions:

#### Categories
- `api::category.category` → `find` ✅
- `api::category.category` → `findOne` ✅

#### Products
- `api::product.product` → `find` ✅
- `api::product.product` → `findOne` ✅

#### Vendors
- `api::vendor.vendor` → `find` ✅
- `api::vendor.vendor` → `findOne` ✅

#### Banners
- `api::banner.banner` → `find` ✅
- `api::banner.banner` → `findOne` ✅

#### Featured Products
- `api::featured-product.featured-product` → `find` ✅
- `api::featured-product.featured-product` → `findOne` ✅

#### Orders
- `api::order.order` → `find` ✅
- `api::order.order` → `findOne` ✅
- `api::order.order` → `create` ✅
- `api::order.order` → `update` ✅

#### Auth
- `plugin::users-permissions.auth` → `register` ✅
- `plugin::users-permissions.auth` → `callback` ✅

4. **Save** the changes

### For Authenticated Role (Optional - for logged-in users)

1. Click on **Authenticated** role
2. Enable the same permissions as above
3. **Save** the changes

## 🌱 Step 3: Restore Seed Data

After setting up permissions, run these commands in your terminal:

```bash
# Navigate to backend directory
cd cityshopping-backend

# Run seed scripts
node scripts/seed-products.js
node scripts/seed-banners-featured.js
node scripts/seed-button-configs.js
```

## 🧪 Step 4: Test the API

Run this command to test if everything is working:

```bash
node test-api.js
```

You should see all endpoints returning data instead of 403 errors.

## 📱 Step 5: Test React Native App

1. Start your React Native app
2. Navigate to the home screen
3. You should see categories, products, and banners loaded

## 🔄 Alternative: Manual Data Creation

If the seed scripts don't work, you can create data manually:

### Categories
1. Go to **Content Manager** → **Category**
2. Create:
   - **Groceries** (Daily essentials and groceries)
   - **Bakery** (Fresh bread and cakes)
   - **Electronics** (Gadgets and devices)

### Vendors
1. Go to **Content Manager** → **Vendor**
2. Create:
   - **FreshMart** (123 Main St, City Center)
   - **CityBakery** (456 Baker St, Downtown)
   - **TechStore** (789 Tech Ave, Innovation District)

### Products
1. Go to **Content Manager** → **Product**
2. Create products with images from Unsplash:
   - Fresh Apples (Groceries, FreshMart)
   - Whole Wheat Bread (Bakery, CityBakery)
   - Wireless Headphones (Electronics, TechStore)

## 🚨 Troubleshooting

### If login fails:
- Try: `admin@cityshopping.com` / `Admin123!` (original password)
- Check if Strapi server is running on port 1337

### If permissions don't save:
- Make sure you're logged in as admin
- Try refreshing the admin panel
- Check browser console for errors

### If seed scripts fail:
- Make sure permissions are set up correctly
- Check the API token in the seed scripts
- Try manual data creation instead

## 📞 Support

If you encounter issues:
1. Check the browser console for errors
2. Check the terminal for Strapi server errors
3. Verify all permissions are enabled
4. Test API endpoints manually 