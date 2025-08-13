'use strict';

const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const mime = require('mime-types');
const FormData = require('form-data');

// Set your Strapi API token here (must have upload permissions)
const STRAPI_API_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiaWF0IjoxNzU1MDA1NzkyLCJleHAiOjE3NTc1OTc3OTJ9.xccywGmyeOVI24XgE48zwOT1_Qiw_LHAV6qOQcpy9mc';
const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';

async function uploadImageFromUrl(url, fileName) {
  const tmpDir = path.join(__dirname, '../tmp');
  await fs.ensureDir(tmpDir);
  const filePath = path.join(tmpDir, fileName);
  const writer = fs.createWriteStream(filePath);
  const response = await axios({ url, method: 'GET', responseType: 'stream' });
  response.data.pipe(writer);
  await new Promise((resolve, reject) => {
    writer.on('finish', () => resolve());
    writer.on('error', () => reject());
  });
  const exists = await fs.pathExists(filePath);
  if (!exists) {
    console.error('File does not exist after download:', filePath);
    return undefined;
  }
  const stats = await fs.stat(filePath);
  const mimeType = mime.lookup(filePath) || 'application/octet-stream';
  console.log(`Uploading file via REST: ${filePath}, size: ${stats.size}, mime: ${mimeType}`);
  try {
    const form = new FormData();
    form.append('files', fs.createReadStream(filePath), {
      filename: fileName,
      contentType: mimeType,
      knownLength: stats.size,
    });
    const uploadRes = await axios.post(
      `${STRAPI_URL}/api/upload`,
      form,
      {
        headers: {
          ...form.getHeaders(),
          Authorization: `Bearer ${STRAPI_API_TOKEN}`,
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      }
    );
    await fs.unlink(filePath); // Clean up temp file
    const uploaded = uploadRes.data && uploadRes.data[0];
    if (uploaded && uploaded.id) {
      return uploaded.id;
    } else {
      console.error('Upload response did not contain file ID:', uploadRes.data);
      return undefined;
    }
  } catch (err) {
    console.error('Upload via REST failed:', err.response ? err.response.data : err);
    await fs.unlink(filePath); // Clean up temp file
    return undefined;
  }
}

async function seedProducts() {
  try {
    console.log('Starting product seeding...');

    // Check if categories exist, if not create them
    console.log('Checking/creating categories...');
    const categoriesResponse = await axios.get(`${STRAPI_URL}/api/categories`, {
      headers: { Authorization: `Bearer ${STRAPI_API_TOKEN}` }
    });
    
    let groceries, bakery, electronics;
    
    if (categoriesResponse.data.data.length === 0) {
      console.log('Creating categories...');
      const groceriesRes = await axios.post(`${STRAPI_URL}/api/categories`, {
        data: { name: 'Groceries', description: 'Daily essentials' }
      }, {
        headers: { Authorization: `Bearer ${STRAPI_API_TOKEN}` }
      });
      groceries = groceriesRes.data.data;
      
      const bakeryRes = await axios.post(`${STRAPI_URL}/api/categories`, {
        data: { name: 'Bakery', description: 'Fresh bread and cakes' }
      }, {
        headers: { Authorization: `Bearer ${STRAPI_API_TOKEN}` }
      });
      bakery = bakeryRes.data.data;
      
      const electronicsRes = await axios.post(`${STRAPI_URL}/api/categories`, {
        data: { name: 'Electronics', description: 'Gadgets and devices' }
      }, {
        headers: { Authorization: `Bearer ${STRAPI_API_TOKEN}` }
      });
      electronics = electronicsRes.data.data;
    } else {
      console.log('Categories already exist, using existing ones...');
      groceries = categoriesResponse.data.data.find(c => c.attributes && c.attributes.name === 'Groceries');
      bakery = categoriesResponse.data.data.find(c => c.attributes && c.attributes.name === 'Bakery');
      electronics = categoriesResponse.data.data.find(c => c.attributes && c.attributes.name === 'Electronics');
      
      // If any category is missing, create it
      if (!groceries) {
        console.log('Creating Groceries category...');
        const groceriesRes = await axios.post(`${STRAPI_URL}/api/categories`, {
          data: { name: 'Groceries', description: 'Daily essentials' }
        }, {
          headers: { Authorization: `Bearer ${STRAPI_API_TOKEN}` }
        });
        groceries = groceriesRes.data.data;
      }
      
      if (!bakery) {
        console.log('Creating Bakery category...');
        const bakeryRes = await axios.post(`${STRAPI_URL}/api/categories`, {
          data: { name: 'Bakery', description: 'Fresh bread and cakes' }
        }, {
          headers: { Authorization: `Bearer ${STRAPI_API_TOKEN}` }
        });
        bakery = bakeryRes.data.data;
      }
      
      if (!electronics) {
        console.log('Creating Electronics category...');
        const electronicsRes = await axios.post(`${STRAPI_URL}/api/categories`, {
          data: { name: 'Electronics', description: 'Gadgets and devices' }
        }, {
          headers: { Authorization: `Bearer ${STRAPI_API_TOKEN}` }
        });
        electronics = electronicsRes.data.data;
      }
    }

    // Check if vendors exist, if not create them
    console.log('Checking/creating vendors...');
    const vendorsResponse = await axios.get(`${STRAPI_URL}/api/vendors`, {
      headers: { Authorization: `Bearer ${STRAPI_API_TOKEN}` }
    });
    
    let freshMart, cityBakery;
    
    if (vendorsResponse.data.data.length === 0) {
      console.log('Creating vendors...');
      const freshMartRes = await axios.post(`${STRAPI_URL}/api/vendors`, {
        data: { name: 'FreshMart', address: '123 Main St', contact: '123-456-7890' }
      }, {
        headers: { Authorization: `Bearer ${STRAPI_API_TOKEN}` }
      });
      freshMart = freshMartRes.data.data;
      
      const cityBakeryRes = await axios.post(`${STRAPI_URL}/api/vendors`, {
        data: { name: 'CityBakery', address: '456 Baker St', contact: '987-654-3210' }
      }, {
        headers: { Authorization: `Bearer ${STRAPI_API_TOKEN}` }
      });
      cityBakery = cityBakeryRes.data.data;
    } else {
      console.log('Vendors already exist, using existing ones...');
      freshMart = vendorsResponse.data.data.find(v => v.attributes && v.attributes.name === 'FreshMart');
      cityBakery = vendorsResponse.data.data.find(v => v.attributes && v.attributes.name === 'CityBakery');
      
      // If any vendor is missing, create it
      if (!freshMart) {
        console.log('Creating FreshMart vendor...');
        const freshMartRes = await axios.post(`${STRAPI_URL}/api/vendors`, {
          data: { name: 'FreshMart', address: '123 Main St', contact: '123-456-7890' }
        }, {
          headers: { Authorization: `Bearer ${STRAPI_API_TOKEN}` }
        });
        freshMart = freshMartRes.data.data;
      }
      
      if (!cityBakery) {
        console.log('Creating CityBakery vendor...');
        const cityBakeryRes = await axios.post(`${STRAPI_URL}/api/vendors`, {
          data: { name: 'CityBakery', address: '456 Baker St', contact: '987-654-3210' }
        }, {
          headers: { Authorization: `Bearer ${STRAPI_API_TOKEN}` }
        });
        cityBakery = cityBakeryRes.data.data;
      }
    }

    // Check if products already exist
    console.log('Checking existing products...');
    const productsResponse = await axios.get(`${STRAPI_URL}/api/products`, {
      headers: { Authorization: `Bearer ${STRAPI_API_TOKEN}` }
    });
    
    if (productsResponse.data.data.length > 0) {
      console.log(`Found ${productsResponse.data.data.length} existing products. Skipping product creation.`);
      return;
    }

    console.log('Uploading images...');
    const appleImageId = await uploadImageFromUrl('https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=400', 'apple.jpg');
    console.log('Apple image ID:', appleImageId);
    const breadImageId = await uploadImageFromUrl('https://images.unsplash.com/photo-1502741338009-cac2772e18bc?w=400', 'bread.jpg');
    console.log('Bread image ID:', breadImageId);
    const headphonesImageId = await uploadImageFromUrl('https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=400', 'headphones.jpg');
    console.log('Headphones image ID:', headphonesImageId);

    if (!appleImageId || !breadImageId || !headphonesImageId) {
      console.error('One or more images failed to upload. Aborting product creation.');
      process.exit(1);
    }

    console.log('Creating products...');
    
    // Create products
    const products = [
      {
        name: 'Apple',
        description: 'Fresh red apples',
        price: 2.99,
        stock: 100,
        category: groceries.id,
        vendor: freshMart.id,
        image: appleImageId,
      },
      {
        name: 'Whole Wheat Bread',
        description: 'Healthy bakery bread',
        price: 1.99,
        stock: 50,
        category: bakery.id,
        vendor: cityBakery.id,
        image: breadImageId,
      },
      {
        name: 'Bluetooth Headphones',
        description: 'Wireless headphones',
        price: 49.99,
        stock: 30,
        category: electronics.id,
        vendor: freshMart.id,
        image: headphonesImageId,
      },
      {
        name: 'Organic Bananas',
        description: 'Fresh organic bananas',
        price: 1.49,
        stock: 75,
        category: groceries.id,
        vendor: freshMart.id,
        image: appleImageId, // Reuse image for now
      },
      {
        name: 'Croissant',
        description: 'Buttery French croissant',
        price: 3.49,
        stock: 25,
        category: bakery.id,
        vendor: cityBakery.id,
        image: breadImageId, // Reuse image for now
      },
      {
        name: 'Smartphone',
        description: 'Latest smartphone with great features',
        price: 299.99,
        stock: 15,
        category: electronics.id,
        vendor: freshMart.id,
        image: headphonesImageId, // Reuse image for now
      },
      {
        name: 'Fresh Milk',
        description: 'Organic whole milk',
        price: 4.99,
        stock: 40,
        category: groceries.id,
        vendor: freshMart.id,
        image: appleImageId, // Reuse image for now
      },
      {
        name: 'Chocolate Cake',
        description: 'Delicious chocolate cake',
        price: 12.99,
        stock: 10,
        category: bakery.id,
        vendor: cityBakery.id,
        image: breadImageId, // Reuse image for now
      },
      {
        name: 'Laptop',
        description: 'High-performance laptop',
        price: 899.99,
        stock: 8,
        category: electronics.id,
        vendor: freshMart.id,
        image: headphonesImageId, // Reuse image for now
      },
      {
        name: 'Organic Eggs',
        description: 'Farm fresh organic eggs',
        price: 5.99,
        stock: 60,
        category: groceries.id,
        vendor: freshMart.id,
        image: appleImageId, // Reuse image for now
      }
    ];

    for (const product of products) {
      try {
        const response = await axios.post(`${STRAPI_URL}/api/products`, {
          data: product
        }, {
          headers: { Authorization: `Bearer ${STRAPI_API_TOKEN}` }
        });
        console.log(`Created product: ${product.name} (ID: ${response.data.data.id})`);
      } catch (err) {
        console.error(`Error creating product ${product.name}:`, err.response ? err.response.data : err.message);
      }
    }

    console.log('Product seeding complete!');
    
    // Show summary
    const finalProductsResponse = await axios.get(`${STRAPI_URL}/api/products`, {
      headers: { Authorization: `Bearer ${STRAPI_API_TOKEN}` }
    });
    console.log(`Total products in database: ${finalProductsResponse.data.data.length}`);

  } catch (err) {
    console.error('Error during seeding:', err.response ? err.response.data : err);
    process.exit(1);
  }
}

seedProducts().catch((err) => {
  console.error(err);
  process.exit(1);
}); 