# 🎛️ Admin Dashboard Guide - Banners & Featured Products

This guide explains how to manage banners and featured products from the Strapi admin dashboard.

## 🚀 Getting Started

1. **Start the Strapi server:**
   ```bash
   npm run develop
   ```

2. **Access the admin dashboard:**
   - Open: `http://localhost:1337/admin`
   - Login with your admin credentials

## 🎨 Managing Banners

### Banner Content Type Features

The **Banner** content type allows you to create promotional banners for the home screen with the following features:

#### Fields:
- **Title** (Required): Main banner title
- **Subtitle**: Secondary text
- **Description**: Detailed description
- **Image** (Required): Banner image
- **Background Color**: Custom background color (default: #14b8a6)
- **Text Color**: Text color (default: #ffffff)
- **Action Text**: Button text (default: "Shop Now")
- **Action Type**: Navigation type
  - `product_list`: Navigate to product list
  - `category`: Navigate to category
  - `product_details`: Navigate to specific product
  - `cart`: Navigate to cart
  - `external_link`: External URL
- **Action Data**: JSON data for navigation (e.g., section name, category ID)
- **Is Active**: Enable/disable banner
- **Sort Order**: Display order (lower numbers first)
- **Start Date**: When banner should appear
- **End Date**: When banner should disappear
- **Target Audience**: 
  - `all`: All users
  - `new_users`: New users only
  - `returning_users`: Returning users only
  - `premium_users`: Premium users only

### Creating a Banner

1. Go to **Content Manager** → **Banner**
2. Click **Create new entry**
3. Fill in the required fields:
   - **Title**: "Summer Sale"
   - **Subtitle**: "Up to 50% Off"
   - **Description**: "Get amazing discounts on summer collection"
   - **Image**: Upload a banner image
   - **Action Type**: "product_list"
   - **Action Data**: `{"section": "summer-sale", "title": "Summer Sale"}`
4. Click **Save**

### API Endpoints

- **Get all banners**: `GET /api/banners`
- **Get banners with filters**: `GET /api/banners?filters[isActive][$eq]=true&sort=sortOrder:asc`
- **Get banners with pagination**: `GET /api/banners?pagination[limit]=5&sort=sortOrder:asc`
- **Get banners with image**: `GET /api/banners?populate=image`

### Example API Usage

```javascript
// Get active banners for home screen
const response = await fetch(`${API_URL}/api/banners?filters[isActive][$eq]=true&sort=sortOrder:asc&populate=image&pagination[limit]=5`);
const banners = await response.json();

// Get banners within date range
const response = await fetch(`${API_URL}/api/banners?filters[isActive][$eq]=true&filters[startDate][$lte]=${new Date().toISOString()}&populate=image`);
const banners = await response.json();
```

## ⭐ Managing Featured Products

### Featured Product Content Type Features

The **Featured Product** content type allows you to highlight specific products with special features:

#### Fields:
- **Product** (Required): Select a product to feature
- **Title**: Custom title for the featured product
- **Subtitle**: Subtitle text
- **Description**: Detailed description
- **Is Active**: Enable/disable featured product
- **Sort Order**: Display order
- **Featured Type**: 
  - `featured`: General featured product
  - `trending`: Trending product
  - `new_arrival`: New arrival
  - `best_seller`: Best seller
  - `flash_sale`: Flash sale product
- **Start Date**: When to start featuring
- **End Date**: When to stop featuring
- **Discount Percentage**: Discount percentage (0-100)
- **Highlight Color**: Custom highlight color
- **Custom Image**: Override product image
- **Target Audience**: Target user group

### Creating a Featured Product

1. Go to **Content Manager** → **Featured Product**
2. Click **Create new entry**
3. Fill in the fields:
   - **Product**: Select an existing product
   - **Title**: "Trending Product"
   - **Featured Type**: "trending"
   - **Discount Percentage**: 25
   - **Highlight Color**: "#ef4444"
4. Click **Save**

### API Endpoints

- **Get all featured products**: `GET /api/featured-products`
- **Get active featured products**: `GET /api/featured-products?filters[isActive][$eq]=true&sort=sortOrder:asc`
- **Get by type**: `GET /api/featured-products?filters[featuredType][$eq]=trending&populate=product,product.image,product.category,product.vendor`
- **Get with pagination**: `GET /api/featured-products?pagination[limit]=10&sort=sortOrder:asc&populate=product,product.image`

### Example API Usage

```javascript
// Get active featured products for home screen
const response = await fetch(`${API_URL}/api/featured-products?filters[isActive][$eq]=true&sort=sortOrder:asc&populate=product,product.image,product.category,product.vendor&pagination[limit]=20`);
const featuredProducts = await response.json();

// Get trending products
const response = await fetch(`${API_URL}/api/featured-products?filters[isActive][$eq]=true&filters[featuredType][$eq]=trending&populate=product,product.image&pagination[limit]=10`);
const trendingProducts = await response.json();
```

## 🔧 Seeding Sample Data

To populate the database with sample banners and featured products:

```bash
node scripts/seed-banners-featured.js
```

This will create:
- 5 sample banners with different themes
- Up to 8 featured products (if products exist)

## 📱 Frontend Integration

### Fetching Banners

```javascript
// Get active banners for home screen
const response = await fetch(`${API_URL}/api/banners?filters[isActive][$eq]=true&sort=sortOrder:asc&populate=image&pagination[limit]=5`);
const banners = await response.json();

// Get banners with date filtering
const response = await fetch(`${API_URL}/api/banners?filters[isActive][$eq]=true&filters[startDate][$lte]=${new Date().toISOString()}&populate=image`);
const banners = await response.json();
```

### Fetching Featured Products

```javascript
// Get all featured products for home
const response = await fetch(`${API_URL}/api/featured-products?filters[isActive][$eq]=true&sort=sortOrder:asc&populate=product,product.image,product.category,product.vendor&pagination[limit]=20`);
const featuredProducts = await response.json();

// Get featured products by type
const response = await fetch(`${API_URL}/api/featured-products?filters[isActive][$eq]=true&filters[featuredType][$eq]=trending&populate=product,product.image&pagination[limit]=10`);
const trendingProducts = await response.json();
```

## 🎯 Best Practices

### Banners
- Keep titles short and impactful
- Use high-quality images (recommended: 800x400px)
- Set appropriate start/end dates for time-sensitive promotions
- Use target audience to show relevant banners
- Test different action types for better engagement

### Featured Products
- Feature products with good ratings and reviews
- Use different featured types for variety
- Set realistic discount percentages
- Update featured products regularly
- Use custom images for special promotions

## 🔄 Content Management Workflow

1. **Plan**: Decide on banner themes and featured products
2. **Create**: Add content through admin dashboard
3. **Preview**: Test in development environment
4. **Publish**: Set appropriate dates and activate
5. **Monitor**: Track performance and engagement
6. **Update**: Refresh content regularly

## 🛠️ Troubleshooting

### Common Issues

1. **Banners not showing**: Check if `isActive` is true and dates are correct
2. **Images not loading**: Ensure images are uploaded and accessible
3. **API errors**: Verify API endpoints and authentication
4. **Featured products not appearing**: Check if products exist and are active

### Debug Commands

```bash
# Check if Strapi is running
curl http://localhost:1337/api/banners

# Test specific endpoint
curl http://localhost:1337/api/banners/active

# Check featured products
curl http://localhost:1337/api/featured-products/home
```

## 📞 Support

For issues or questions:
1. Check the Strapi documentation
2. Review API responses for error messages
3. Verify content type configurations
4. Test with sample data first

---

**Happy Content Management! 🎉** 