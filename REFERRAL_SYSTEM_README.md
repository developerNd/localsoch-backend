# 🎁 Referral System - Local Soch

A comprehensive referral system that allows users to earn rewards by referring friends to the Local Soch marketplace.

## 🚀 Features

### ✅ Core Functionality
- **Unique Referral Codes**: Each user gets a unique referral code
- **Referral Tracking**: Track all referrals with status (pending/completed/expired)
- **Reward System**: ₹50 cashback for both referrer and referred user
- **Statistics Dashboard**: View referral stats and earnings
- **Code Validation**: Validate referral codes before application
- **Expiration System**: Referral codes expire after 30 days

### 📱 Mobile App Features
- **Dedicated Referral Screen**: Beautiful UI with statistics and sharing
- **Copy to Clipboard**: Easy code copying functionality
- **Social Sharing**: Share referral codes via native sharing
- **Signup Integration**: Referral code input during registration
- **Real-time Updates**: Pull-to-refresh functionality

## 🏗️ Architecture

### Backend (Strapi)
```
src/api/referral/
├── content-types/referral/schema.json    # Database schema
├── controllers/referral.js               # Business logic
├── routes/referral.js                    # API endpoints
└── services/referral.js                  # Helper functions
```

### Frontend (React Native)
```
src/screens/
├── ReferralScreen.js                     # Main referral screen
└── ProfileScreen.js                      # Updated with referral link

src/screens/SignupScreen.js               # Referral code input
```

## 📊 Database Schema

### Referral Collection
```json
{
  "referrer": "User ID (who created the code)",
  "referredUser": "User ID (who used the code)",
  "referralCode": "Unique code string",
  "status": "pending|completed|expired",
  "rewardAmount": "50.00",
  "rewardType": "cashback|discount|points",
  "completedAt": "DateTime",
  "expiresAt": "DateTime (30 days)",
  "notes": "Optional notes"
}
```

### User Extensions
```json
{
  "referrals": "One-to-many relation to referrals",
  "referredBy": "One-to-one relation to referral",
  "totalRewards": "Total earned rewards",
  "referralCount": "Total referral count"
}
```

## 🔌 API Endpoints

### Generate Referral Code
```http
POST /api/referrals/generate-code
Authorization: Bearer <token>
```
**Response:**
```json
{
  "success": true,
  "referralCode": "REF1234567890ABCD",
  "message": "Referral code generated successfully"
}
```

### Get Referral Statistics
```http
GET /api/referrals/stats
Authorization: Bearer <token>
```
**Response:**
```json
{
  "success": true,
  "stats": {
    "totalReferrals": 5,
    "pendingReferrals": 2,
    "completedReferrals": 3,
    "totalRewards": 150,
    "referrals": [...]
  }
}
```

### Validate Referral Code
```http
POST /api/referrals/validate-code
Authorization: Bearer <token>
Body: { "referralCode": "REF1234567890ABCD" }
```
**Response:**
```json
{
  "success": true,
  "referral": {
    "id": 1,
    "referralCode": "REF1234567890ABCD",
    "rewardAmount": 50,
    "rewardType": "cashback",
    "referrer": {
      "id": 1,
      "username": "john_doe"
    }
  }
}
```

### Apply Referral Code
```http
POST /api/referrals/apply-code
Authorization: Bearer <token>
Body: { 
  "referralCode": "REF1234567890ABCD",
  "newUserId": 123
}
```
**Response:**
```json
{
  "success": true,
  "message": "Referral code applied successfully",
  "rewardAmount": 50,
  "rewardType": "cashback"
}
```

## 🎯 How It Works

### 1. Code Generation
- User requests a referral code
- System generates unique code: `REF{userId}{timestamp}{random}`
- Code expires in 30 days
- Status set to "pending"

### 2. Code Sharing
- User shares code via app or manually
- Code can be copied to clipboard
- Native sharing integration available

### 3. Code Application
- New user enters code during signup
- System validates code (exists, not expired, not used)
- Links referrer and referred user
- Status updated to "completed"
- Both users get ₹50 cashback

### 4. Reward Distribution
- Rewards are tracked in the system
- Can be integrated with payment system
- Statistics updated in real-time

## 🧪 Testing

### Run Test Script
```bash
cd cityshopping-backend
node test-referral-system.js
```

### Manual Testing Steps
1. **Create Referrer**: Register a new user
2. **Generate Code**: Use the referral screen to generate code
3. **Share Code**: Copy or share the generated code
4. **Create Referred User**: Register another user with the code
5. **Verify Stats**: Check that both users see updated statistics

## 🔧 Configuration

### Reward Settings
- **Default Reward**: ₹50 cashback
- **Reward Type**: cashback (can be extended to discount/points)
- **Expiration**: 30 days
- **Code Format**: `REF{userId}{timestamp}{random}`

### Customization Options
- Modify reward amounts in controller
- Change expiration period
- Add different reward types
- Customize code generation format

## 🚀 Deployment

### Backend Setup
1. **Restart Strapi**: The new API will be automatically loaded
2. **Database Migration**: New tables will be created automatically
3. **Test Endpoints**: Use the test script to verify functionality

### Frontend Setup
1. **Build App**: The new screens are already integrated
2. **Test Navigation**: Verify referral screen navigation works
3. **Test Signup**: Verify referral code input works

## 📈 Analytics & Monitoring

### Key Metrics
- Total referrals generated
- Successful referrals (completed)
- Failed referrals (expired/invalid)
- Total rewards distributed
- User engagement with referral features

### Monitoring Points
- API response times
- Error rates in code generation/application
- User adoption of referral features
- Reward distribution success rate

## 🔒 Security Considerations

### Code Validation
- Unique code generation prevents duplicates
- Expiration prevents code reuse
- One-time use per code
- User authentication required

### Data Protection
- Referral codes are not sensitive data
- User relationships are properly tracked
- Audit trail for all referral activities

## 🎨 UI/UX Features

### Referral Screen
- **Hero Section**: Eye-catching reward display
- **Code Display**: Large, easy-to-copy code
- **Statistics Grid**: Visual representation of performance
- **How It Works**: Step-by-step explanation
- **Recent Referrals**: List of recent activity
- **Terms & Conditions**: Legal information

### Signup Integration
- **Optional Field**: Referral code input
- **Visual Feedback**: Info message when code entered
- **Validation**: Real-time code validation
- **Seamless Flow**: Doesn't interrupt signup process

## 🔮 Future Enhancements

### Planned Features
- **Tiered Rewards**: Different rewards for different referral counts
- **Social Integration**: Direct social media sharing
- **Gamification**: Leaderboards and achievements
- **Analytics Dashboard**: Detailed referral analytics
- **Automated Rewards**: Automatic cashback distribution
- **Referral Links**: Deep links for easier sharing

### Technical Improvements
- **Caching**: Cache referral statistics for better performance
- **Webhooks**: Notify external systems of referral events
- **API Rate Limiting**: Prevent abuse of referral system
- **Multi-language Support**: Internationalize referral messages

## 📞 Support

For questions or issues with the referral system:
1. Check the test script for basic functionality
2. Review API responses for error details
3. Verify database schema is properly created
4. Test with fresh users to avoid conflicts

---

**🎉 The referral system is now fully functional and ready for production use!** 