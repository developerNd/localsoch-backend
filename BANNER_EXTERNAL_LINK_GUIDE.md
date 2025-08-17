# Banner Action Types Guide

## Overview
The banner system supports multiple action types to provide different user interactions when banners are clicked.

## Action Types Available
- `product_list` - Navigate to product list with filters
- `category` - Navigate to specific category
- `product_details` - Navigate to specific product details
- `cart` - Navigate to shopping cart
- `external_link` - Open external URL
- `seller` - **NEW** - Navigate to specific seller/vendor screen

## How to Use Different Action Types

### 1. External Link Action Type

#### Create a Banner in Strapi Admin
1. Go to Content Manager > Banner
2. Create a new banner entry
3. Set the following fields:
   - **Title**: Your banner title
   - **Subtitle**: Optional subtitle
   - **Description**: Optional description
   - **Image**: Upload banner image
   - **Action Type**: Select `external_link`
   - **Action Text**: Button text (e.g., "Visit Website", "Learn More")
   - **External Link**: Enter the URL (e.g., "https://example.com")
   - **Is Active**: Set to true

#### Example External Link Banner Configuration
```json
{
  "title": "Visit Our Website",
  "subtitle": "Learn more about our services",
  "actionType": "external_link",
  "actionText": "Visit Website",
  "externalLink": "https://www.example.com",
  "isActive": true
}
```

### 2. Seller Action Type

#### Create a Banner in Strapi Admin
1. Go to Content Manager > Banner
2. Create a new banner entry
3. Set the following fields:
   - **Title**: Your banner title
   - **Subtitle**: Optional subtitle
   - **Description**: Optional description
   - **Image**: Upload banner image
   - **Action Type**: Select `seller`
   - **Action Text**: Button text (e.g., "View Store", "Shop Now")
   - **Seller ID**: Enter the vendor/seller ID (e.g., 2)
   - **Is Active**: Set to true

#### Example Seller Banner Configuration
```json
{
  "title": "Shop at Sports Store",
  "subtitle": "Best sports equipment in town",
  "actionType": "seller",
  "actionText": "View Store",
  "sellerId": 2,
  "isActive": true
}
```

## Supported URL Types for External Links
- **HTTP/HTTPS URLs**: `https://www.example.com`
- **Deep Links**: `myapp://open/screen`
- **Phone Numbers**: `tel:+1234567890`
- **Email**: `mailto:contact@example.com`
- **WhatsApp**: `whatsapp://send?phone=+1234567890&text=Hello`

## Error Handling
- If the URL is invalid or cannot be opened, an error alert will be shown
- If the seller ID is invalid or seller not found, an error alert will be shown
- The app will log errors for debugging purposes

## Testing

### Test External Link
1. Create a banner with `actionType: "external_link"`
2. Set `externalLink: "https://www.google.com"`
3. Save and publish the banner
4. Refresh the mobile app
5. Tap the banner to test the external link

### Test Seller Navigation
1. Create a banner with `actionType: "seller"`
2. Set `sellerId: 2` (use an existing vendor ID)
3. Save and publish the banner
4. Refresh the mobile app
5. Tap the banner to navigate to the seller screen

## Security Notes
- Only HTTPS URLs are recommended for external links
- The app will show an error if the URL cannot be opened
- Users will be prompted to allow external app opening if needed
- Seller IDs must correspond to existing vendors in the system 