const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connect to the database
const dbPath = path.join(__dirname, '.tmp', 'data.db');
const db = new sqlite3.Database(dbPath);

console.log('🔍 Checking notifications in database...');

// Check all notifications
db.all("SELECT id, title, message, isRead, user FROM notifications", (err, rows) => {
  if (err) {
    console.error('❌ Error querying notifications:', err);
    return;
  }
  
  console.log('📋 All notifications:', rows);
  
  // Check unread notifications for user 1
  db.all("SELECT id, title, message, isRead, user FROM notifications WHERE user = 1 AND isRead = 0", (err, unreadRows) => {
    if (err) {
      console.error('❌ Error querying unread notifications:', err);
      return;
    }
    
    console.log('🔴 Unread notifications for user 1:', unreadRows);
    console.log('🔢 Unread count for user 1:', unreadRows.length);
    
    db.close();
  });
}); 