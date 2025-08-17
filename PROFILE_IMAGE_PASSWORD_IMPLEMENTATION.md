# Profile Image and Password Reset Implementation

## Overview
This document describes the implementation of profile image upload and password reset functionality for the CityShopping application.

## Features Implemented

### 1. Profile Image Upload
- ✅ Added `profileImage` field to user schema
- ✅ Custom user controller handles file uploads
- ✅ Frontend updated to use correct field name
- ✅ Image upload with FormData support
- ✅ Multiple image format support (thumbnail, small, medium)

### 2. Password Management
- ✅ Password change for authenticated users
- ✅ Forgot password functionality
- ✅ Password reset with token validation
- ✅ Secure password hashing
- ✅ Input validation and error handling

## Backend Implementation

### User Schema Updates
**File:** `src/extensions/users-permissions/content-types/user/schema.json`

```json
{
  "profileImage": {
    "type": "media",
    "multiple": false,
    "required": false,
    "allowedTypes": ["images"]
  }
}
```

### Custom User Controller
**File:** `src/extensions/users-permissions/strapi-server.js`

#### Key Features:
1. **Profile Image Upload Handling**
   - Detects file uploads in requests
   - Uses Strapi's upload service
   - Associates uploaded file with user profile
   - Supports multiple file formats

2. **Password Change Endpoint**
   - Route: `POST /api/users-permissions/auth/change-password`
   - Requires authentication
   - Validates current password
   - Hashes new password securely

3. **Forgot Password Endpoint**
   - Route: `POST /api/users-permissions/auth/forgot-password`
   - Generates reset token
   - Updates user with reset token
   - Returns generic message for security

4. **Reset Password Endpoint**
   - Route: `POST /api/users-permissions/auth/reset-password`
   - Validates reset token
   - Updates password and clears token
   - Requires password confirmation

### API Endpoints

#### Profile Image Upload
```http
PUT /api/users/:id
Content-Type: multipart/form-data
Authorization: Bearer <token>

{
  "data": {
    "username": "updated_username",
    "phone": "updated_phone"
  },
  "files": {
    "profileImage": <file>
  }
}
```

#### Password Change
```http
POST /api/users-permissions/auth/change-password
Content-Type: application/json
Authorization: Bearer <token>

{
  "currentPassword": "old_password",
  "newPassword": "new_password"
}
```

#### Forgot Password
```http
POST /api/users-permissions/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

#### Reset Password
```http
POST /api/users-permissions/auth/reset-password
Content-Type: application/json

{
  "code": "reset_token",
  "password": "new_password",
  "passwordConfirmation": "new_password"
}
```

## Frontend Implementation

### ProfileScreen Updates
**File:** `cityshopping/src/screens/ProfileScreen.js`

#### Key Changes:
1. **Updated Field Names**
   - Changed from `avatar` to `profileImage`
   - Updated helper function `getProfileImageUrl()`
   - Updated API calls to use correct field

2. **Image Upload Flow**
   - Camera and gallery selection
   - FormData upload to Strapi
   - User profile update with image ID
   - Real-time UI updates

3. **Password Change Flow**
   - Modal-based password change
   - Current password validation
   - New password confirmation
   - Error handling and user feedback

### API Service Integration
The frontend uses the existing `apiService.updateUser()` method for profile updates, which now supports:
- Profile image uploads
- Password changes
- Address management
- Notification preferences

## Security Features

### Password Security
- ✅ Secure password hashing using bcrypt
- ✅ Current password validation
- ✅ Password strength requirements (min 6 characters)
- ✅ Password confirmation matching
- ✅ Reset token generation and validation

### File Upload Security
- ✅ File type validation (images only)
- ✅ File size limits
- ✅ Secure file storage
- ✅ User authentication required

### API Security
- ✅ JWT token authentication
- ✅ User can only update their own profile
- ✅ Input validation and sanitization
- ✅ Error handling without information leakage

## Testing

### Backend Testing
Run the test script to verify functionality:
```bash
cd cityshopping-backend
node test-profile-image-password.js
```

### Frontend Testing
1. **Profile Image Upload**
   - Take photo with camera
   - Select from gallery
   - Verify image displays correctly
   - Test with different image formats

2. **Password Change**
   - Enter current password
   - Enter new password
   - Confirm new password
   - Verify success message
   - Test with invalid current password

3. **Password Reset**
   - Request password reset
   - Check email for reset token
   - Use token to reset password
   - Verify login with new password

## Error Handling

### Common Error Scenarios
1. **File Upload Errors**
   - Invalid file type
   - File too large
   - Network connection issues
   - Server upload service unavailable

2. **Password Change Errors**
   - Incorrect current password
   - Weak new password
   - Password confirmation mismatch
   - Authentication token expired

3. **Password Reset Errors**
   - Invalid email address
   - Expired reset token
   - Invalid reset code
   - Password requirements not met

### Error Messages
All error messages are user-friendly and don't reveal sensitive information:
- Generic messages for security
- Clear validation feedback
- Network error handling
- Graceful fallbacks

## Deployment Notes

### Required Steps
1. **Restart Strapi Server**
   ```bash
   cd cityshopping-backend
   npm run develop
   ```

2. **Database Migration**
   - The new `profileImage` field will be automatically added
   - Existing users will have `null` for profile image

3. **File Storage**
   - Ensure upload directory is writable
   - Configure proper file permissions
   - Set up backup for uploaded files

### Environment Variables
No additional environment variables required. The implementation uses existing Strapi configuration.

## Future Enhancements

### Potential Improvements
1. **Email Integration**
   - Send actual password reset emails
   - Email templates for password reset
   - Email verification for new accounts

2. **Image Processing**
   - Automatic image resizing
   - Image compression
   - Multiple format generation
   - Image optimization

3. **Security Enhancements**
   - Rate limiting for password attempts
   - Two-factor authentication
   - Password history tracking
   - Account lockout after failed attempts

4. **User Experience**
   - Drag and drop image upload
   - Image cropping interface
   - Progress indicators for uploads
   - Offline support for profile updates

## Troubleshooting

### Common Issues
1. **Image Not Uploading**
   - Check file permissions
   - Verify upload directory exists
   - Check network connectivity
   - Validate file format

2. **Password Change Failing**
   - Verify current password is correct
   - Check password requirements
   - Ensure authentication token is valid
   - Check server logs for errors

3. **Reset Token Issues**
   - Verify email address is correct
   - Check if token has expired
   - Ensure proper token format
   - Check database for token storage

### Debug Information
Enable debug logging in Strapi to see detailed information:
```javascript
// In config/server.js
module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  app: {
    keys: env.array('APP_KEYS'),
  },
  logger: {
    level: 'debug'
  }
});
```

## Support

For issues or questions regarding this implementation:
1. Check the server logs for error details
2. Verify API endpoints are accessible
3. Test with the provided test script
4. Review the error handling section above 