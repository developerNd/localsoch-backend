const { Server } = require('socket.io');

let io;

// Store connected users with their socket IDs
const connectedUsers = new Map();
const connectedVendors = new Map();
const vendorToUserMap = new Map(); // Map vendor ID to user ID
const userToVendorMap = new Map(); // Map user ID to vendor ID

// Initialize WebSocket server
function initializeWebSocket(server) {
  io = new Server(server, {
    cors: {
      origin: ["http://localhost:3000", "http://localhost:5173", "http://192.168.1.102:1337"],
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log('🔌 WebSocket: Client connected:', socket.id);

    // Handle user authentication
    socket.on('authenticate', (data) => {
      const { userId, userType, token } = data;
      
      if (userId && userType) {
        // Store user connection
        if (userType === 'user') {
          connectedUsers.set(userId, socket.id);
          socket.userId = userId;
          socket.userType = 'user';
          console.log(`🔌 WebSocket: User ${userId} authenticated`);
        } else if (userType === 'vendor') {
          connectedVendors.set(userId, socket.id);
          socket.userId = userId;
          socket.userType = 'vendor';
          console.log(`🔌 WebSocket: Vendor ${userId} authenticated`);
          
          // Store vendor mappings if vendorId is provided
          if (data.vendorId) {
            vendorToUserMap.set(data.vendorId, userId);
            userToVendorMap.set(userId, data.vendorId);
            console.log(`🔌 WebSocket: Vendor mapping stored - Vendor ID: ${data.vendorId}, User ID: ${userId}`);
          }
        }
        
        // Join user-specific room
        socket.join(`user_${userId}`);
        socket.join(`type_${userType}`);
        
        socket.emit('authenticated', { success: true });
      }
    });

    // Handle admin broadcast
    socket.on('admin_broadcast', (data) => {
      const { targetAudience, notification } = data;
      
      console.log('🔌 WebSocket: Admin broadcast received:', { targetAudience, notification });
      
      switch (targetAudience) {
        case 'all':
          // Send to all connected users and vendors
          io.emit('new_notification', notification);
          break;
        case 'users':
          // Send to all connected users
          io.to('type_user').emit('new_notification', notification);
          break;
        case 'sellers':
          // Send to all connected vendors
          io.to('type_vendor').emit('new_notification', notification);
          break;
        case 'specific_users':
          // Send to specific users
          if (notification.targetUsers) {
            notification.targetUsers.forEach(userId => {
              const socketId = connectedUsers.get(userId);
              if (socketId) {
                io.to(socketId).emit('new_notification', notification);
              }
            });
          }
          break;
        case 'specific_sellers':
          // Send to specific vendors
          if (notification.targetVendors) {
            notification.targetVendors.forEach(vendorId => {
              const socketId = connectedVendors.get(vendorId);
              if (socketId) {
                io.to(socketId).emit('new_notification', notification);
              }
            });
          }
          break;
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('🔌 WebSocket: Client disconnected:', socket.id);
      
      // Remove from connected users/vendors
      if (socket.userId && socket.userType) {
        if (socket.userType === 'user') {
          connectedUsers.delete(socket.userId);
        } else if (socket.userType === 'vendor') {
          connectedVendors.delete(socket.userId);
          
          // Clean up vendor mappings
          const vendorId = userToVendorMap.get(socket.userId);
          if (vendorId) {
            vendorToUserMap.delete(vendorId);
            userToVendorMap.delete(socket.userId);
            console.log(`🔌 WebSocket: Cleaned up vendor mappings for user ${socket.userId}`);
          }
        }
      }
    });
  });

  console.log('🔌 WebSocket server initialized');
  return io;
}

// Function to send notification to specific user
function sendNotificationToUser(userId, notification) {
  const socketId = connectedUsers.get(userId);
  if (socketId) {
    io.to(socketId).emit('new_notification', notification);
    console.log(`🔌 WebSocket: Notification sent to user ${userId}`);
  }
}

// Function to send notification to specific vendor
function sendNotificationToVendor(vendorId, notification) {
  // First try to find vendor by vendor ID directly
  let socketId = connectedVendors.get(vendorId);
  
  if (!socketId) {
    // If not found by vendor ID, try to find by user ID using the mapping
    const userId = vendorToUserMap.get(vendorId);
    if (userId) {
      socketId = connectedVendors.get(userId);
      console.log(`🔌 WebSocket: Found vendor ${vendorId} via user ID ${userId}`);
    }
  }
  
  if (socketId) {
    io.to(socketId).emit('new_notification', notification);
    console.log(`🔌 WebSocket: Notification sent to vendor ${vendorId}`);
  } else {
    console.log(`🔌 WebSocket: Vendor ${vendorId} not connected, notification will be stored for later`);
  }
}

// Function to broadcast to all users
function broadcastToAllUsers(notification) {
  io.to('type_user').emit('new_notification', notification);
  console.log('🔌 WebSocket: Notification broadcasted to all users');
}

// Function to broadcast to all vendors
function broadcastToAllVendors(notification) {
  io.to('type_vendor').emit('new_notification', notification);
  console.log('🔌 WebSocket: Notification broadcasted to all vendors');
}

// Function to broadcast to everyone
function broadcastToAll(notification) {
  io.emit('new_notification', notification);
  console.log('🔌 WebSocket: Notification broadcasted to all');
}

// Get connected users count
function getConnectedUsersCount() {
  return {
    users: connectedUsers.size,
    vendors: connectedVendors.size,
    total: connectedUsers.size + connectedVendors.size
  };
}

module.exports = {
  initializeWebSocket,
  sendNotificationToUser,
  sendNotificationToVendor,
  broadcastToAllUsers,
  broadcastToAllVendors,
  broadcastToAll,
  getConnectedUsersCount,
  io: () => io
}; 