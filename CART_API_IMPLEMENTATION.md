# Cart API Implementation

## Overview
This document describes the implementation of the Cart API for the CityShopping backend. The cart system allows users to add, update, remove, and manage items in their shopping cart.

## Database Schema

### Cart Table Structure
```json
{
  "kind": "collectionType",
  "collectionName": "carts",
  "info": {
    "singularName": "cart",
    "pluralName": "carts",
    "displayName": "Cart"
  },
  "options": {
    "draftAndPublish": false
  },
  "attributes": {
    "user": {
      "type": "relation",
      "relation": "manyToOne",
      "target": "plugin::users-permissions.user",
      "inversedBy": "carts"
    },
    "product": {
      "type": "relation",
      "relation": "manyToOne",
      "target": "api::product.product"
    },
    "quantity": {
      "type": "integer",
      "required": true,
      "default": 1,
      "min": 1
    },
    "price": {
      "type": "decimal",
      "required": true
    },
    "totalPrice": {
      "type": "decimal",
      "required": true
    },
    "isActive": {
      "type": "boolean",
      "default": true
    },
    "addedAt": {
      "type": "datetime",
      "default": "now"
    },
    "updatedAt": {
      "type": "datetime",
      "default": "now"
    }
  }
}
```

## API Endpoints

### 1. Get User Cart
- **Method**: `GET`
- **Path**: `/api/cart/user`
- **Description**: Retrieves all active cart items for the authenticated user
- **Authentication**: Required
- **Response**: Array of cart items with product details

### 2. Add Item to Cart
- **Method**: `POST`
- **Path**: `/api/cart/add`
- **Description**: Adds a product to the user's cart or updates quantity if already exists
- **Authentication**: Required
- **Body**:
  ```json
  {
    "productId": 1,
    "quantity": 2
  }
  ```

### 3. Update Cart Item
- **Method**: `PUT`
- **Path**: `/api/cart/items/:id`
- **Description**: Updates the quantity of a specific cart item
- **Authentication**: Required
- **Body**:
  ```json
  {
    "quantity": 3
  }
  ```

### 4. Remove Cart Item
- **Method**: `DELETE`
- **Path**: `/api/cart/items/:id`
- **Description**: Removes an item from the cart (soft delete)
- **Authentication**: Required

### 5. Clear Cart
- **Method**: `DELETE`
- **Path**: `/api/cart/clear`
- **Description**: Removes all items from the user's cart
- **Authentication**: Required

### 6. Default CRUD Routes
- `GET /api/carts` - Get all carts (admin)
- `GET /api/carts/:id` - Get specific cart
- `POST /api/carts` - Create cart
- `PUT /api/carts/:id` - Update cart
- `DELETE /api/carts/:id` - Delete cart

## Features

### ✅ Implemented Features
1. **User Authentication**: All cart operations require user authentication
2. **Product Validation**: Validates that products exist before adding to cart
3. **Quantity Management**: Automatically updates quantity if product already exists
4. **Price Calculation**: Calculates total price based on quantity and product price
5. **Soft Delete**: Cart items are marked as inactive rather than hard deleted
6. **User Ownership**: Users can only access their own cart items
7. **Product Relations**: Cart items include full product details with images and vendor info
8. **Error Handling**: Comprehensive error handling for all operations

### 🔧 Technical Implementation
1. **Controller**: `src/api/cart/controllers/cart.js`
2. **Routes**: `src/api/cart/routes/cart.js`
3. **Service**: `src/api/cart/services/cart.js`
4. **Schema**: `src/api/cart/content-types/cart/schema.json`
5. **User Relation**: Updated user schema to include cart relationship

## Usage Examples

### Frontend Integration
```javascript
// Get user cart
const cartResponse = await api.get('/api/cart/user');

// Add item to cart
const addResponse = await api.post('/api/cart/add', {
  productId: 1,
  quantity: 2
});

// Update cart item
const updateResponse = await api.put('/api/cart/items/1', {
  quantity: 3
});

// Remove item from cart
const removeResponse = await api.delete('/api/cart/items/1');

// Clear cart
const clearResponse = await api.delete('/api/cart/clear');
```

## Testing

### Test Script
Run the test script to verify API functionality:
```bash
node test-cart-api.js
```

### Manual Testing
1. Start the Strapi server: `npm run develop`
2. Test endpoints using Postman or curl
3. Verify database tables are created automatically

## Database Tables Created
- `carts` - Main cart table with all cart items
- Updated `up_users` table with cart relationship

## Security Features
- User authentication required for all operations
- User ownership validation
- Input validation for quantities and product IDs
- Soft delete to prevent data loss

## Performance Optimizations
- Database indexes on frequently queried fields
- Efficient queries with proper population
- Caching-friendly response structure

## Next Steps
1. Add cart permissions to user roles
2. Implement cart expiration
3. Add cart item notes/options
4. Implement cart sharing features
5. Add cart analytics and reporting 