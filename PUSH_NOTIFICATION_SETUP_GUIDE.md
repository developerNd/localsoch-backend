# 🔔 Push Notification Setup Guide

This guide will help you set up push notifications for the admin panel to send notifications to mobile devices.

## 📋 Prerequisites

1. **Firebase Project**: You need a Firebase project with Cloud Messaging enabled
2. **Service Account Key**: Firebase Admin SDK service account key
3. **Mobile App**: React Native app with Firebase configured

## 🚀 Setup Steps

### 1. Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing project
3. Enable Cloud Messaging:
   - Go to Project Settings
   - Click on "Cloud Messaging" tab
   - Enable Cloud Messaging API

### 2. Generate Service Account Key

1. In Firebase Console, go to Project Settings
2. Click on "Service accounts" tab
3. Click "Generate new private key"
4. Download the JSON file
5. **Keep this file secure** - it contains sensitive credentials

### 3. Environment Variables Setup

Add the following environment variables to your `.env` file:

```bash
# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour Private Key Here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/your-service-account-email
```

### 4. Backend Configuration

The backend is already configured with:
- ✅ Firebase Admin SDK installed
- ✅ Push notification service created
- ✅ API endpoints configured
- ✅ Notification controller updated

### 5. Mobile App Configuration

Ensure your React Native app has:
- ✅ Firebase configured
- ✅ FCM token generation
- ✅ Token registration with backend

## 🔧 API Endpoints

### Push Notification Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/notifications/push/users` | Send push notification to specific users |
| POST | `/api/notifications/push/vendors` | Send push notification to specific vendors |
| POST | `/api/notifications/push/all-users` | Send push notification to all users |
| POST | `/api/notifications/push/all-vendors` | Send push notification to all vendors |
| POST | `/api/notifications/push/everyone` | Send push notification to everyone |
| GET | `/api/notifications/push/stats` | Get push notification statistics |
| PUT | `/api/notifications/push/user/:userId/token` | Update user FCM token |
| PUT | `/api/notifications/push/vendor/:vendorId/token` | Update vendor FCM token |

### Example API Usage

```javascript
// Send push notification to specific users
const response = await fetch('/api/notifications/push/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userIds: [1, 2, 3],
    notification: {
      title: 'Test Notification',
      message: 'This is a test push notification',
      type: 'info'
    },
    data: {
      type: 'info',
      isImportant: 'false',
      isAdminCreated: 'true'
    }
  })
});
```

## 🎯 Admin Panel Features

### New Features Added

1. **Push Notification Toggle**: Enable/disable push notifications
2. **Notification Type Selection**:
   - In-App Only
   - Push Only
   - Both (In-App + Push)
3. **Push Device Statistics**: Shows total devices with FCM tokens
4. **Enhanced Form**: Integrated push notification options

### How to Use

1. **Open Admin Panel**: Go to the notifications page
2. **Create Notification**: Click "Send Notification"
3. **Configure Push**: 
   - Check "Send Push Notification"
   - Select notification type
4. **Send**: Click "Send Notification"

## 🧪 Testing

### Test Scripts

1. **Basic Test**: `node test-push-notification.js`
2. **Admin Test**: `node test-push-notification-admin.js`

### Manual Testing

1. **Start Backend**: `npm run develop`
2. **Run Test Script**: `node test-push-notification-admin.js`
3. **Check Mobile App**: Verify notifications appear
4. **Check Admin Panel**: Verify statistics update

## 📊 Monitoring

### Push Notification Statistics

The admin panel now shows:
- Total devices with FCM tokens
- Breakdown by users and vendors
- Real-time statistics

### Logs

Check backend logs for:
- Firebase initialization status
- Push notification success/failure
- Token updates

## 🔒 Security Considerations

1. **Service Account Key**: Keep secure, never commit to version control
2. **Environment Variables**: Use proper environment management
3. **Token Validation**: Validate FCM tokens before sending
4. **Rate Limiting**: Implement rate limiting for push endpoints

## 🐛 Troubleshooting

### Common Issues

1. **Firebase Not Initialized**
   - Check environment variables
   - Verify service account key format
   - Check backend logs

2. **No FCM Tokens**
   - Ensure mobile app generates tokens
   - Check token registration with backend
   - Verify user/vendor has FCM token

3. **Push Notifications Not Received**
   - Check Firebase project configuration
   - Verify app permissions
   - Check device notification settings

### Debug Commands

```bash
# Check Firebase configuration
node -e "console.log(process.env.FIREBASE_PROJECT_ID)"

# Test push notification
node test-push-notification-admin.js

# Check backend logs
npm run develop
```

## 📱 Mobile App Integration

### Required Mobile App Features

1. **FCM Token Generation**: Generate and store FCM tokens
2. **Token Registration**: Send tokens to backend
3. **Notification Handling**: Handle incoming notifications
4. **Permission Management**: Request notification permissions

### Token Registration Endpoint

```javascript
// Register FCM token with backend
await fetch('/api/notifications/push/user/1/token', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ fcmToken: 'your-fcm-token' })
});
```

## 🎉 Success Indicators

✅ **Backend**: Firebase Admin SDK initialized  
✅ **API**: Push notification endpoints working  
✅ **Admin Panel**: Push notification options visible  
✅ **Mobile App**: Receiving push notifications  
✅ **Statistics**: Device counts showing correctly  

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section
2. Review backend logs
3. Verify Firebase configuration
4. Test with provided test scripts

---

**🎯 Goal**: Enable admins to send push notifications to mobile devices through the admin panel interface. 