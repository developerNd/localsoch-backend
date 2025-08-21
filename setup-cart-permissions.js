const axios = require('axios');

const API_URL = 'http://localhost:1337';

// Setup cart permissions for different user roles
async function setupCartPermissions() {
  try {
    console.log('🔧 Setting up Cart API permissions...\n');

    // Get API token (you'll need to replace with your actual token)
    const apiToken = process.env.STRAPI_API_TOKEN || 'your-api-token-here';
    
    if (apiToken === 'your-api-token-here') {
      console.log('⚠️  Please set STRAPI_API_TOKEN environment variable or update the token in this script');
      return;
    }

    const headers = {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json'
    };

    // Get all roles
    console.log('1. Fetching user roles...');
    const rolesResponse = await axios.get(`${API_URL}/api/users-permissions/roles`, { headers });
    const roles = rolesResponse.data.roles;
    console.log('✅ Found roles:', roles.map(r => r.name));

    // Cart permissions to enable
    const cartPermissions = {
      'cart': {
        'controllers': {
          'cart': {
            'find': { enabled: true, policy: '' },
            'findOne': { enabled: true, policy: '' },
            'create': { enabled: true, policy: '' },
            'update': { enabled: true, policy: '' },
            'delete': { enabled: true, policy: '' },
            'getUserCart': { enabled: true, policy: '' },
            'addToCart': { enabled: true, policy: '' },
            'updateCartItem': { enabled: true, policy: '' },
            'removeFromCart': { enabled: true, policy: '' },
            'clearCart': { enabled: true, policy: '' }
          }
        }
      }
    };

    // Update permissions for each role
    for (const role of roles) {
      console.log(`\n2. Updating permissions for role: ${role.name}`);
      
      try {
        // Get current permissions for this role
        const roleResponse = await axios.get(`${API_URL}/api/users-permissions/roles/${role.id}`, { headers });
        const currentPermissions = roleResponse.data.role.permissions;

        // Merge cart permissions with existing permissions
        const updatedPermissions = {
          ...currentPermissions,
          ...cartPermissions
        };

        // Update the role with new permissions
        await axios.put(`${API_URL}/api/users-permissions/roles/${role.id}`, {
          ...roleResponse.data.role,
          permissions: updatedPermissions
        }, { headers });

        console.log(`✅ Updated permissions for ${role.name}`);
      } catch (error) {
        console.log(`❌ Failed to update permissions for ${role.name}:`, error.response?.data || error.message);
      }
    }

    console.log('\n🎉 Cart permissions setup completed!');
    console.log('\n📝 All user roles now have access to cart operations.');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  }
}

// Test cart permissions
async function testCartPermissions() {
  try {
    console.log('\n🧪 Testing cart permissions...\n');

    // Test with different user types
    const testUsers = [
      { email: 'customer@example.com', password: 'password123' },
      { email: 'vendor@example.com', password: 'password123' },
      { email: 'admin@example.com', password: 'password123' }
    ];

    for (const user of testUsers) {
      console.log(`Testing with user: ${user.email}`);
      
      try {
        // Login
        const loginResponse = await axios.post(`${API_URL}/api/auth/local`, {
          identifier: user.email,
          password: user.password
        });
        
        const token = loginResponse.data.jwt;
        const headers = { Authorization: `Bearer ${token}` };

        // Test cart access
        const cartResponse = await axios.get(`${API_URL}/api/cart/user`, { headers });
        console.log(`✅ ${user.email} can access cart:`, cartResponse.data.meta?.count || 0, 'items');

      } catch (error) {
        console.log(`❌ ${user.email} cannot access cart:`, error.response?.data?.error?.message || error.message);
      }
    }

  } catch (error) {
    console.error('❌ Permission test failed:', error.message);
  }
}

// Run setup
async function runSetup() {
  await setupCartPermissions();
  console.log('\n' + '='.repeat(50) + '\n');
  await testCartPermissions();
}

runSetup(); 