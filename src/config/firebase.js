const admin = require('firebase-admin');
require('dotenv').config();

// Initialize Firebase Admin SDK
let firebaseApp;

try {
  // Check if Firebase is already initialized
  if (admin.apps.length === 0) {
    // For development, you can use a service account key file
    // For production, use environment variables
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT 
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
      : {
          type: process.env.FIREBASE_TYPE || "service_account",
          project_id: process.env.FIREBASE_PROJECT_ID,
          private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
          private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          client_email: process.env.FIREBASE_CLIENT_EMAIL,
          client_id: process.env.FIREBASE_CLIENT_ID,
          auth_uri: process.env.FIREBASE_AUTH_URI || "https://accounts.google.com/o/oauth2/auth",
          token_uri: process.env.FIREBASE_TOKEN_URI || "https://oauth2.googleapis.com/token",
          auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL || "https://www.googleapis.com/oauth2/v1/certs",
          client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL
        };

    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id || process.env.FIREBASE_PROJECT_ID
    });

    console.log('✅ Firebase Admin SDK initialized successfully');
  } else {
    firebaseApp = admin.app();
    console.log('✅ Firebase Admin SDK already initialized');
  }
} catch (error) {
  console.error('❌ Firebase Admin SDK initialization failed:', error);
  firebaseApp = null;
}

// Function to send push notification to a single device
const sendPushNotification = async (token, notification, data = {}) => {
  if (!firebaseApp) {
    throw new Error('Firebase Admin SDK not initialized');
  }

  try {
    const message = {
      token,
      notification: {
        title: notification.title,
        body: notification.message,
      },
      data: {
        ...data,
        type: notification.type || 'info',
        click_action: 'FLUTTER_NOTIFICATION_CLICK',
      },
      android: {
        priority: 'high',
        notification: {
          channelId: 'default-channel-id',
          priority: 'high',
          defaultSound: true,
          defaultVibrateTimings: true,
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
      },
    };

    const response = await firebaseApp.messaging().send(message);
    console.log('✅ Push notification sent successfully:', response);
    return response;
  } catch (error) {
    console.error('❌ Error sending push notification:', error);
    throw error;
  }
};

// Function to send push notification to multiple devices
const sendPushNotificationToMultiple = async (tokens, notification, data = {}) => {
  if (!firebaseApp) {
    throw new Error('Firebase Admin SDK not initialized');
  }

  try {
    const message = {
      notification: {
        title: notification.title,
        body: notification.message,
      },
      data: {
        ...data,
        type: notification.type || 'info',
        click_action: 'FLUTTER_NOTIFICATION_CLICK',
      },
      android: {
        priority: 'high',
        notification: {
          channelId: 'default-channel-id',
          priority: 'high',
          defaultSound: true,
          defaultVibrateTimings: true,
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
      },
    };

    const response = await firebaseApp.messaging().sendEachForMulticast({
      tokens,
      ...message,
    });

    console.log('✅ Multicast push notification sent:', {
      successCount: response.successCount,
      failureCount: response.failureCount,
    });

    return response;
  } catch (error) {
    console.error('❌ Error sending multicast push notification:', error);
    throw error;
  }
};

// Function to send push notification to a topic
const sendPushNotificationToTopic = async (topic, notification, data = {}) => {
  if (!firebaseApp) {
    throw new Error('Firebase Admin SDK not initialized');
  }

  try {
    const message = {
      topic,
      notification: {
        title: notification.title,
        body: notification.message,
      },
      data: {
        ...data,
        type: notification.type || 'info',
        click_action: 'FLUTTER_NOTIFICATION_CLICK',
      },
      android: {
        priority: 'high',
        notification: {
          channelId: 'default-channel-id',
          priority: 'high',
          defaultSound: true,
          defaultVibrateTimings: true,
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
      },
    };

    const response = await firebaseApp.messaging().send(message);
    console.log('✅ Topic push notification sent successfully:', response);
    return response;
  } catch (error) {
    console.error('❌ Error sending topic push notification:', error);
    throw error;
  }
};

module.exports = {
  firebaseApp,
  sendPushNotification,
  sendPushNotificationToMultiple,
  sendPushNotificationToTopic,
}; 