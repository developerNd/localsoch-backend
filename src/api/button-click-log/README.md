# Button Click Log API

This content type tracks button clicks for vendors in the CityShopping application.

## Overview

The `button-click-log` content type is used to track when users click on vendor buttons (call, WhatsApp, website, etc.) for analytics and reporting purposes.

## Schema

### Fields

- **vendor** (Relation): Reference to the vendor whose button was clicked
- **buttonType** (String, Required): Type of button clicked (e.g., 'call', 'whatsapp', 'website')
- **ipAddress** (String): IP address of the user who clicked
- **userAgent** (Text): User agent string of the browser/device
- **clickedAt** (DateTime, Required): Timestamp when the button was clicked
- **userInfo** (Component): Additional user information (user.user-info component)
- **deviceInfo** (Component): Device information (device.device-info component)
- **referrer** (String): Referrer URL if available
- **sessionId** (String): Session identifier for tracking user sessions

## API Endpoints

### Standard CRUD Endpoints
- `GET /api/button-click-logs` - Get all button click logs
- `GET /api/button-click-logs/:id` - Get specific button click log
- `POST /api/button-click-logs` - Create new button click log
- `PUT /api/button-click-logs/:id` - Update button click log
- `DELETE /api/button-click-logs/:id` - Delete button click log

### Custom Endpoints
- `GET /api/button-click-logs/vendor/:vendorId` - Get logs for a specific vendor
- `GET /api/button-click-logs/vendor/:vendorId/analytics` - Get analytics for a vendor

## Usage Examples

### Logging a Button Click
```javascript
// Using the service
await strapi.service('api::button-click-log.button-click-log').logButtonClick({
  vendor: vendorId,
  buttonType: 'whatsapp',
  ipAddress: '192.168.1.1',
  userAgent: 'Mozilla/5.0...',
  clickedAt: new Date()
});
```

### Getting Vendor Analytics
```javascript
// Get analytics for a vendor
const analytics = await strapi.service('api::button-click-log.button-click-log').getVendorAnalytics(vendorId, {
  startDate: '2024-01-01',
  endDate: '2024-01-31'
});
```

## Integration with Vendor API

The button-click-log content type is integrated with the vendor API:

1. **Vendor Schema**: Vendors have a `buttonClickLogs` relation to button-click-logs
2. **Automatic Updates**: When a button click is logged, the vendor's `buttonClicks` component is automatically updated
3. **Analytics**: The vendor API provides endpoints to get button analytics

## Components Used

- **user.user-info**: Stores additional user information
- **device.device-info**: Stores device information
- **vendor.button-clicks**: Stores aggregated click statistics on the vendor

## Permissions

The button-click-log content type requires appropriate permissions to be set up in the Strapi admin panel:

- **Public**: Read access for analytics
- **Authenticated**: Full CRUD access for logged-in users
- **Admin**: Full access for administrators 