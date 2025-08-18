# Button Tracking Implementation Summary

## Overview
Button tracking functionality has been implemented across all screens in the CityShopping mobile app. This ensures that all vendor contact button interactions (call and WhatsApp) are properly tracked for analytics and reporting purposes.

## Screens with Button Tracking

### 1. HomeScreen ✅ (Already Working)
- **Location**: `cityshopping/src/screens/HomeScreen.js`
- **Function**: `trackVendorButtonClick(vendorId, buttonType)`
- **Buttons Tracked**:
  - Call buttons in vendor cards
  - WhatsApp buttons in vendor cards
- **Implementation**: Uses PUT request to `/api/vendors/${vendorId}` with `trackClick: true`

### 2. SellerScreen ✅ (Already Working)
- **Location**: `cityshopping/src/screens/SellerScreen.js`
- **Function**: `trackButtonClick(buttonType)`
- **Buttons Tracked**:
  - Call button in seller contact section
  - WhatsApp button in seller contact section
- **Implementation**: Uses PUT request to `/api/vendors/${vendorId}` with `trackClick: true`

### 3. ProductDetailsScreen ✅ (Newly Added)
- **Location**: `cityshopping/src/screens/ProductDetailsScreen.js`
- **Function**: `trackVendorButtonClick(vendorId, buttonType)` (newly added)
- **Buttons Tracked**:
  - Call button in seller card section
  - WhatsApp button in seller card section
- **Implementation**: Uses PUT request to `/api/vendors/${vendorId}` with `trackClick: true`

## Backend API Endpoints

### Primary Endpoint (Used by Mobile App)
- **URL**: `PUT /api/vendors/:id`
- **Purpose**: Track button clicks via PUT request
- **Parameters**:
  ```json
  {
    "trackClick": true,
    "buttonType": "call" | "whatsapp" | "message" | "email" | "website",
    "userInfo": {
      "name": "string",
      "phone": "string", 
      "email": "string",
      "userId": "string",
      "isGuest": "boolean"
    },
    "deviceInfo": {
      "platform": "string",
      "appVersion": "string",
      "deviceModel": "string",
      "osVersion": "string"
    },
    "location": "string",
    "userAgent": "string"
  }
  ```

### Alternative Endpoint (Direct Tracking)
- **URL**: `POST /api/vendors/:id/track-click`
- **Purpose**: Direct button click tracking
- **Parameters**: Same as above

### Analytics Endpoints
- **URL**: `GET /api/vendors/:id/button-click-logs`
- **Purpose**: Retrieve button click logs for a vendor

## Data Storage

### Button Clicks Counter
Each vendor has a `buttonClicks` object that tracks:
- `totalClicks`: Total number of button clicks
- `callClicks`: Number of call button clicks
- `whatsappClicks`: Number of WhatsApp button clicks
- `messageClicks`: Number of message button clicks
- `emailClicks`: Number of email button clicks
- `websiteClicks`: Number of website button clicks
- `lastUpdated`: Timestamp of last click

### Button Click Logs
Detailed logs are stored in:
- **File**: `cityshopping-backend/data/button-click-logs.json`
- **Database**: Button click log entries with full user and device information

## Implementation Details

### User Information Collection
The system collects user information in the following priority:
1. **Authenticated Users**: Fetches complete user profile from `/api/users/me`
2. **JWT Token**: Extracts user info from JWT payload
3. **Anonymous Users**: Uses default "Anonymous User" information

### Device Information
Standard device information is collected:
- Platform: "React Native"
- App Version: "1.0.0"
- Device Model: "Mobile App"
- OS Version: "Unknown"

### Error Handling
- Graceful fallback to anonymous user if authentication fails
- Console logging for debugging
- No blocking of button functionality if tracking fails

## Testing

### Test Script
- **File**: `cityshopping-backend/test-all-button-tracking.js`
- **Purpose**: Comprehensive testing of button tracking across all screens
- **Tests**:
  - HomeScreen button tracking
  - SellerScreen button tracking
  - ProductScreen button tracking
  - Backend API endpoints
  - Data storage verification

### Manual Testing
To test button tracking:
1. Open any screen with vendor contact buttons
2. Tap call or WhatsApp buttons
3. Check backend logs for tracking data
4. Verify button click counters are incremented

## Files Modified

### Frontend (React Native)
1. `cityshopping/src/screens/ProductDetailsScreen.js`
   - Added `trackVendorButtonClick` function
   - Added auth token loading
   - Updated `handleCallSeller` and `handleWhatsAppSeller` functions
   - Added AsyncStorage import

### Backend (Strapi)
1. `cityshopping-backend/src/api/vendor/controllers/vendor.js`
   - `trackButtonClick` function (already implemented)
   - Button click logging and counter updates

2. `cityshopping-backend/src/api/vendor/routes/vendor.js`
   - Button tracking routes (already implemented)

## Status Summary

| Screen | Call Button | WhatsApp Button | Status |
|--------|-------------|-----------------|---------|
| HomeScreen | ✅ Tracked | ✅ Tracked | Working |
| SellerScreen | ✅ Tracked | ✅ Tracked | Working |
| ProductScreen | ✅ Tracked | ✅ Tracked | **NEWLY ADDED** |

## Next Steps

1. **Monitor**: Check button tracking analytics in the admin dashboard
2. **Optimize**: Consider adding more detailed analytics (time-based, location-based)
3. **Extend**: Add tracking for other button types (email, website) if needed
4. **Test**: Run comprehensive tests in production environment

## Troubleshooting

### Common Issues
1. **Button clicks not tracked**: Check network connectivity and API endpoint
2. **User info not collected**: Verify authentication token is valid
3. **Counters not updating**: Check backend logs for errors

### Debug Commands
```bash
# Test button tracking
cd cityshopping-backend
node test-all-button-tracking.js

# Check vendor data
curl -X GET "https://api.localsoch.com/api/vendors/1?populate=*"

# Check button click logs
curl -X GET "https://api.localsoch.com/api/vendors/1/button-click-logs"
``` 