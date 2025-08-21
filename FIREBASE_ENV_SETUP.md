# 🔥 Firebase Environment Variables Setup Guide

## 📋 Prerequisites

1. **Firebase Project Created** ✅ (You mentioned this is done)
2. **Service Account Key Downloaded** (JSON file from Firebase Console)
3. **Firebase Admin SDK** ✅ (Already installed: `firebase-admin`)

## 🚀 Step-by-Step Setup

### Step 1: Get Firebase Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Project Settings** (gear icon) → **Service Accounts**
4. Click **"Generate new private key"**
5. Download the JSON file (e.g., `firebase-service-account.json`)

### Step 2: Create Environment File

Create `.env` file in the `cityshopping-backend` directory:

```bash
# Copy the example file
cp env.production.example .env
```

### Step 3: Add Firebase Variables

Add these variables to your `.env` file:

```env
# ========================================
# FIREBASE CONFIGURATION
# ========================================

# Option 1: Use Service Account JSON (Recommended)
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"your-project-id","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com","client_id":"123456789","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40your-project.iam.gserviceaccount.com"}

# Option 2: Individual Variables (Alternative)
# FIREBASE_TYPE=service_account
# FIREBASE_PROJECT_ID=your-project-id
# FIREBASE_PRIVATE_KEY_ID=your-private-key-id
# FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
# FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
# FIREBASE_CLIENT_ID=123456789
# FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
# FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
# FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
# FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40your-project.iam.gserviceaccount.com
```

### Step 4: Convert Service Account JSON to Environment Variable

**Method A: Using Node.js Script**

```bash
# Run this command to convert your JSON file to environment variable
node -e "
const fs = require('fs');
const serviceAccount = JSON.parse(fs.readFileSync('./firebase-service-account.json', 'utf8'));
console.log('FIREBASE_SERVICE_ACCOUNT=' + JSON.stringify(serviceAccount));
"
```

**Method B: Manual Conversion**

1. Open your `firebase-service-account.json` file
2. Copy the entire JSON content
3. Replace `"` with `\"` (escape quotes)
4. Replace newlines with `\n`
5. Add it to your `.env` file

### Step 5: Test Firebase Configuration

Run the test script to verify setup:

```bash
node test-push-setup-safe.js
```

## 🔧 Environment Variables Explained

| Variable | Description | Required |
|----------|-------------|----------|
| `FIREBASE_SERVICE_ACCOUNT` | Complete JSON service account | ✅ |
| `FIREBASE_PROJECT_ID` | Your Firebase project ID | ✅ |
| `FIREBASE_PRIVATE_KEY` | Private key from service account | ✅ |
| `FIREBASE_CLIENT_EMAIL` | Service account email | ✅ |
| `FIREBASE_CLIENT_ID` | Service account client ID | ✅ |

## 🛡️ Security Best Practices

1. **Never commit `.env` files** to version control
2. **Use environment variables** in production
3. **Rotate service account keys** regularly
4. **Limit service account permissions** to minimum required

## 🧪 Testing Your Setup

After setting up environment variables:

```bash
# Test Firebase connection
node test-push-setup-safe.js

# Test push notification (if you have FCM tokens)
node test-push-notification.js
```

## 🚨 Troubleshooting

### Common Issues:

1. **"Firebase Admin SDK not initialized"**
   - Check if all environment variables are set
   - Verify JSON format is correct

2. **"Invalid private key"**
   - Ensure private key includes `\n` for newlines
   - Check if quotes are properly escaped

3. **"Project ID mismatch"**
   - Verify `FIREBASE_PROJECT_ID` matches your Firebase project

### Debug Commands:

```bash
# Check if environment variables are loaded
node -e "console.log('FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID)"

# Test Firebase config directly
node -e "
const firebase = require('./src/config/firebase');
console.log('Firebase App:', !!firebase.firebaseApp);
"
```

## 📱 Next Steps

After Firebase setup:

1. **Run database migration** (if needed)
2. **Set up React Native FCM** in mobile app
3. **Test push notifications** end-to-end
4. **Configure notification channels** (Android)

## 🔗 Useful Links

- [Firebase Console](https://console.firebase.google.com/)
- [Firebase Admin SDK Documentation](https://firebase.google.com/docs/admin/setup)
- [FCM Setup Guide](https://firebase.google.com/docs/cloud-messaging) 