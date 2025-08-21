const io = require('socket.io-client');

const SOCKET_URL = 'http://localhost:1337';

async function testWebSocket() {
  console.log('🧪 Testing WebSocket functionality...\n');

  try {
    // Test 1: Connect to WebSocket server
    console.log('1️⃣ Testing WebSocket connection...');
    const socket = io(SOCKET_URL);
    
    socket.on('connect', () => {
      console.log('✅ Connected to WebSocket server');
      console.log('   Socket ID:', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('❌ Disconnected from WebSocket server');
    });

    socket.on('error', (error) => {
      console.error('❌ WebSocket error:', error);
    });

    // Test 2: Authenticate as a user
    console.log('\n2️⃣ Testing user authentication...');
    socket.emit('authenticate', {
      userId: 1,
      userType: 'user',
      token: 'test-token'
    });

    socket.on('authenticated', (data) => {
      console.log('✅ User authenticated:', data);
    });

    // Test 3: Listen for notifications
    console.log('\n3️⃣ Testing notification listening...');
    socket.on('new_notification', (notification) => {
      console.log('🔔 Received real-time notification:', notification);
    });

    // Test 4: Test admin broadcast
    console.log('\n4️⃣ Testing admin broadcast...');
    setTimeout(() => {
      socket.emit('admin_broadcast', {
        targetAudience: 'all',
        notification: {
          title: 'Test Notification',
          message: 'This is a test notification from WebSocket',
          type: 'info',
          isImportant: true,
          createdAt: new Date().toISOString()
        }
      });
      console.log('✅ Admin broadcast sent');
    }, 2000);

    // Test 5: Check WebSocket status via API
    console.log('\n5️⃣ Testing WebSocket status API...');
    const response = await fetch('http://localhost:1337/api/websocket/status');
    if (response.ok) {
      const status = await response.json();
      console.log('✅ WebSocket status:', status);
    } else {
      console.log('❌ Failed to get WebSocket status');
    }

    // Test 6: Check connected users
    console.log('\n6️⃣ Testing connected users API...');
    const usersResponse = await fetch('http://localhost:1337/api/websocket/connected-users');
    if (usersResponse.ok) {
      const users = await usersResponse.json();
      console.log('✅ Connected users:', users);
    } else {
      console.log('❌ Failed to get connected users');
    }

    // Keep connection alive for a while
    console.log('\n⏳ Keeping connection alive for 10 seconds...');
    setTimeout(() => {
      console.log('✅ WebSocket test completed successfully!');
      socket.disconnect();
      process.exit(0);
    }, 10000);

  } catch (error) {
    console.error('❌ WebSocket test failed:', error);
    process.exit(1);
  }
}

// Run the test
testWebSocket(); 