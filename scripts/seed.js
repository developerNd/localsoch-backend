'use strict';

const { createStrapi } = require('@strapi/strapi');
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const mime = require('mime-types');
const FormData = require('form-data');

// Set your Strapi API token here (must have upload permissions)
const STRAPI_API_TOKEN = 'e84e26b9a4c2d8f27bde949afc61d52117e19563be11d5d9ebc8598313d72d1b49d230e28458cfcee1bccd7702ca542a929706c35cde1a62b8f0ab6f185ae74c9ce64c0d8782c15bf4186c29f4fc5c7fdd4cfdd00938a59a636a32cb243b9ca7c94242438ff5fcd2fadbf40a093ea593e96808af49ad97cbeaed977e319614b5';
const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';

async function uploadImageFromUrl(strapi, url, fileName) {
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

async function seed() {
  const strapi = await createStrapi();
  await strapi.start();
  const entityService = strapi.entityService;

  // Clear existing data (optional)
  await strapi.db.query('api::product.product').deleteMany({});
  await strapi.db.query('api::category.category').deleteMany({});
  await strapi.db.query('api::vendor.vendor').deleteMany({});

  // Create categories
  const groceries = await entityService.create('api::category.category', { data: { name: 'Groceries', description: 'Daily essentials' } });
  const bakery = await entityService.create('api::category.category', { data: { name: 'Bakery', description: 'Fresh bread and cakes' } });
  const electronics = await entityService.create('api::category.category', { data: { name: 'Electronics', description: 'Gadgets and devices' } });

  // Create vendors
  const freshMart = await entityService.create('api::vendor.vendor', { data: { name: 'FreshMart', address: '123 Main St', contact: '123-456-7890' } });
  const cityBakery = await entityService.create('api::vendor.vendor', { data: { name: 'CityBakery', address: '456 Baker St', contact: '987-654-3210' } });

  console.log('Uploading images...');
  const appleImageId = await uploadImageFromUrl(strapi, 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=400', 'apple.jpg');
  console.log('Apple image ID:', appleImageId);
  const breadImageId = await uploadImageFromUrl(strapi, 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?w=400', 'bread.jpg');
  console.log('Bread image ID:', breadImageId);
  const headphonesImageId = await uploadImageFromUrl(strapi, 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=400', 'headphones.jpg');
  console.log('Headphones image ID:', headphonesImageId);

  if (!appleImageId || !breadImageId || !headphonesImageId) {
    console.error('One or more images failed to upload. Aborting product creation.');
    process.exit(1);
  }

  console.log('Creating products...');
  let apple, bread, headphones;
  try {
    apple = await entityService.create('api::product.product', {
    data: {
      name: 'Apple',
      description: 'Fresh red apples',
      price: 2.99,
      stock: 100,
      category: groceries.id,
      vendor: freshMart.id,
        image: appleImageId,
    },
  });
    console.log('Apple product created:', apple.id);
    bread = await entityService.create('api::product.product', {
    data: {
      name: 'Whole Wheat Bread',
      description: 'Healthy bakery bread',
      price: 1.99,
      stock: 50,
      category: bakery.id,
      vendor: cityBakery.id,
        image: breadImageId,
    },
  });
    console.log('Bread product created:', bread.id);
    headphones = await entityService.create('api::product.product', {
    data: {
      name: 'Bluetooth Headphones',
      description: 'Wireless headphones',
      price: 49.99,
      stock: 30,
      category: electronics.id,
      vendor: freshMart.id,
        image: headphonesImageId,
      },
    });
    console.log('Headphones product created:', headphones.id);

    // Add more products
    await entityService.create('api::product.product', {
      data: {
        name: 'Organic Bananas',
        description: 'Fresh organic bananas',
        price: 1.49,
        stock: 75,
        category: groceries.id,
        vendor: freshMart.id,
        image: appleImageId, // Reuse image for now
      },
    });
    console.log('Bananas product created');

    await entityService.create('api::product.product', {
      data: {
        name: 'Croissant',
        description: 'Buttery French croissant',
        price: 3.49,
        stock: 25,
        category: bakery.id,
        vendor: cityBakery.id,
        image: breadImageId, // Reuse image for now
      },
    });
    console.log('Croissant product created');

    await entityService.create('api::product.product', {
      data: {
        name: 'Smartphone',
        description: 'Latest smartphone with great features',
        price: 299.99,
        stock: 15,
        category: electronics.id,
        vendor: freshMart.id,
        image: headphonesImageId, // Reuse image for now
      },
    });
    console.log('Smartphone product created');

    await entityService.create('api::product.product', {
      data: {
        name: 'Fresh Milk',
        description: 'Organic whole milk',
        price: 4.99,
        stock: 40,
        category: groceries.id,
        vendor: freshMart.id,
        image: appleImageId, // Reuse image for now
      },
    });
    console.log('Milk product created');

    await entityService.create('api::product.product', {
      data: {
        name: 'Chocolate Cake',
        description: 'Delicious chocolate cake',
        price: 12.99,
        stock: 10,
        category: bakery.id,
        vendor: cityBakery.id,
        image: breadImageId, // Reuse image for now
      },
    });
    console.log('Chocolate Cake product created');

  } catch (err) {
    console.error('Error creating products:', err);
    process.exit(1);
  }

  // Seed a sample order (if a user exists)
  console.log('Finding users for order seeding...');
  const users = await entityService.findMany('plugin::users-permissions.user', { limit: 1 });
  const user = users[0];
  if (user) {
    try {
      await entityService.create('api::order.order', {
        data: {
          user: user.id,
          products: [apple.id, bread.id],
          total: 2.99 + 1.99,
          status: 'pending',
    },
  });
      console.log('Order seeded for user:', user.id);
    } catch (err) {
      console.error('Error creating order:', err);
    }
  } else {
    console.log('No users found. Skipping order seeding.');
  }

  console.log('Seeding complete!');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
