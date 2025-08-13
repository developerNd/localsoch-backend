# Manual Permission Setup Guide

Since the automated permission scripts are not working, you need to set up permissions manually through the Strapi admin panel.

## Step 1: Access Admin Panel

1. Go to: http://localhost:1337/admin
2. Login with:
   - Email: admin@cityshopping.com
   - Password: Admin123!

## Step 2: Set Up Permissions

### For Authenticated Role (Role ID: 1)

1. Go to **Settings** → **Users & Permissions plugin** → **Roles**
2. Click on **Authenticated** role
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

#### Users
- `plugin::users-permissions.user` → `me` ✅
- `plugin::users-permissions.user` → `update` ✅

### For Public Role (Role ID: 2)

1. Go to **Settings** → **Users & Permissions plugin** → **Roles**
2. Click on **Public** role
3. Enable these permissions:

#### Auth
- `plugin::users-permissions.auth` → `register` ✅
- `plugin::users-permissions.auth` → `callback` ✅

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

## Step 3: Create Test Data

After setting up permissions, you can create test data manually:

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

### Banners
1. Go to **Content Manager** → **Banner**
2. Create promotional banners

## Step 4: Test API

After setup, test the API:

```bash
# Test categories
curl http://localhost:1337/api/categories

# Test products
curl http://localhost:1337/api/products

# Test vendors
curl http://localhost:1337/api/vendors
```

## Alternative: Use Existing Seed Scripts

Once permissions are set up, you can run the existing seed scripts:

```bash
node scripts/seed-products.js
node scripts/seed-banners-featured.js
node scripts/seed-button-configs.js
``` 