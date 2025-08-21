// @ts-nocheck
'use strict';

/**
 *  product controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::product.product', ({ strapi }) => ({
  // Override the default find method to allow public access
  async find(ctx) {
    try {
      // Check if this is an admin stats request
      if (ctx.query.admin === 'stats' && ctx.state.user?.role?.name === 'admin') {
        return await this.getProductStats(ctx);
      }
      
      // Check if this is an admin all request
      if (ctx.query.admin === 'all' && ctx.state.user?.role?.name === 'admin') {
        return await this.findAllForAdmin(ctx);
      }
      
      // Allow public access to products
      const { query } = ctx;
      
      // Add populate for vendor and image by default
      if (!query.populate) {
        query.populate = ['vendor', 'image', 'category'];
      } else {
        // Handle populate parameter correctly
        if (query.populate === '*' || query.populate.includes('*')) {
          // If populate is '*' or contains '*', don't add additional fields
          query.populate = '*';
        } else {
          // Ensure vendor is always populated for location filtering
          const populateArray = Array.isArray(query.populate) ? query.populate : query.populate.split(',');
          if (!populateArray.includes('vendor')) {
            query.populate = [...populateArray, 'vendor'];
          }
        }
      }
      
      console.log('🔍 PRODUCT CONTROLLER: Final populate:', query.populate);
      
      // Handle vendor filtering
      if (query.filters && query.filters.vendor) {
        // Convert vendor filter to proper format
        if (query.filters.vendor.id) {
          query.filters.vendor = {
            id: {
              $eq: query.filters.vendor.id.$eq
            }
          };
        }
      }

      // Handle location-based filtering by vendor location
      if (query.filters && query.filters.location) {
        const locationFilter = query.filters.location;
        console.log('🔍 PRODUCT CONTROLLER: Location filter received:', locationFilter);
        
        // Create an OR condition for location matching
        const locationConditions = [];
        
        // Filter by vendor pincode (exact match)
        if (locationFilter.pincode) {
          console.log('🔍 PRODUCT CONTROLLER: Adding vendor pincode filter:', locationFilter.pincode);
          try {
            const vendorsWithPincode = await strapi.entityService.findMany('api::vendor.vendor', {
              filters: { pincode: locationFilter.pincode }
            });
            
            if (vendorsWithPincode.length > 0) {
              const vendorIds = vendorsWithPincode.map(v => v.id);
              console.log('🔍 PRODUCT CONTROLLER: Found vendor IDs with pincode:', vendorIds);
              locationConditions.push({
                vendor: {
                  id: {
                    $in: vendorIds
                  }
                }
              });
            }
          } catch (error) {
            console.log('🔍 PRODUCT CONTROLLER: Error finding vendors by pincode:', error.message);
          }
        }
        
        // Filter by vendor city (case-insensitive contains)
        if (locationFilter.city) {
          console.log('🔍 PRODUCT CONTROLLER: Adding vendor city filter:', locationFilter.city);
          
          // Clean the city name to remove common suffixes
          const cleanCityName = locationFilter.city
            .toLowerCase()
            .replace(/\b(so|sub|office|district|tahsil|taluk|block|nagar|colony|area|zone)\b/g, '')
            .trim();
          
          try {
            const vendorsWithCity = await strapi.entityService.findMany('api::vendor.vendor', {
              filters: { 
                city: {
                  $containsi: cleanCityName
                }
              }
            });
            
            if (vendorsWithCity.length > 0) {
              const vendorIds = vendorsWithCity.map(v => v.id);
              console.log('🔍 PRODUCT CONTROLLER: Found vendor IDs with city:', {
                originalCity: locationFilter.city,
                cleanCity: cleanCityName,
                count: vendorIds.length,
                vendors: vendorsWithCity.map(v => ({ id: v.id, name: v.name, city: v.city, pincode: v.pincode }))
              });
              locationConditions.push({
                vendor: {
                  id: {
                    $in: vendorIds
                  }
                }
              });
            } else {
              console.log('🔍 PRODUCT CONTROLLER: No vendors found with city:', cleanCityName);
            }
          } catch (error) {
            console.log('🔍 PRODUCT CONTROLLER: Error finding vendors by city:', error.message);
          }
        }
        
        // Filter by vendor state (case-insensitive contains)
        if (locationFilter.state) {
          console.log('🔍 PRODUCT CONTROLLER: Adding vendor state filter:', locationFilter.state);
          try {
            const vendorsWithState = await strapi.entityService.findMany('api::vendor.vendor', {
              filters: { 
                state: {
                  $containsi: locationFilter.state
                }
              }
            });
            
            if (vendorsWithState.length > 0) {
              const vendorIds = vendorsWithState.map(v => v.id);
              console.log('🔍 PRODUCT CONTROLLER: Found vendor IDs with state:', vendorIds);
              locationConditions.push({
                vendor: {
                  id: {
                    $in: vendorIds
                  }
                }
              });
            }
          } catch (error) {
            console.log('🔍 PRODUCT CONTROLLER: Error finding vendors by state:', error.message);
          }
        }
        
        // Apply OR condition if we have any location filters
        if (locationConditions.length > 0) {
          query.filters.$or = locationConditions;
          console.log('🔍 PRODUCT CONTROLLER: Final OR filters:', query.filters.$or);
        } else {
          console.log('🔍 PRODUCT CONTROLLER: No vendors found with location criteria, setting empty result');
          query.filters.id = { $eq: -1 }; // This will return no results
        }
        
        console.log('🔍 PRODUCT CONTROLLER: Final filters:', query.filters);
        
        // Remove the location filter from query as we've processed it
        delete query.filters.location;
      }

      // For admin, add additional filtering options
      if (ctx.state.user && ctx.state.user.role && ctx.state.user.role.name === 'admin') {
        // Ensure we populate vendor data for admin (only if not using '*')
        if (query.populate !== '*') {
          const populateArray = Array.isArray(query.populate) ? query.populate : query.populate.split(',');
          if (!populateArray.includes('vendor')) {
            query.populate = [...populateArray, 'vendor'];
          }
        }
      }
      
      // Log the final query before execution
      console.log('🔍 PRODUCT CONTROLLER: Final query filters:', query.filters);
      console.log('🔍 PRODUCT CONTROLLER: Final query populate:', query.populate);
      
      // Call the default find method
      const { data, meta } = await super.find(ctx);
      
      console.log('🔍 PRODUCT CONTROLLER: Query result - data count:', data?.length || 0);
      
      // Debug: Check if there are any vendors with the target pincode
      if (query.filters && query.filters.vendor && query.filters.vendor.pincode) {
        try {
          const targetPincode = query.filters.vendor.pincode.$eq;
          console.log('🔍 PRODUCT CONTROLLER: Debug - checking vendors with pincode:', targetPincode);
          
          const vendorsWithPincode = await strapi.entityService.findMany('api::vendor.vendor', {
            filters: { pincode: targetPincode },
            populate: ['products']
          });
          
          console.log('🔍 PRODUCT CONTROLLER: Debug - vendors found with pincode:', vendorsWithPincode.length);
          vendorsWithPincode.forEach(vendor => {
            console.log('🔍 PRODUCT CONTROLLER: Debug - vendor:', {
              id: vendor.id,
              name: vendor.name,
              pincode: vendor.pincode,
              productsCount: vendor.products?.length || 0
            });
          });
        } catch (debugError) {
          console.log('🔍 PRODUCT CONTROLLER: Debug error:', debugError.message);
        }
      }
      
      // Debug: Check all products without any filters (simplified)
      try {
        console.log('🔍 PRODUCT CONTROLLER: Debug - checking all products without filters...');
        const allProducts = await strapi.entityService.findMany('api::product.product', {
          populate: ['vendor']
        });
        
        console.log('🔍 PRODUCT CONTROLLER: Debug - total products in system:', allProducts.length);
        if (allProducts.length > 0) {
          allProducts.slice(0, 5).forEach(product => {
            console.log('🔍 PRODUCT CONTROLLER: Debug - product:', {
              id: product.id,
              name: product.name,
              vendorId: product.vendor?.id,
              vendorName: product.vendor?.name,
              vendorPincode: product.vendor?.pincode
            });
          });
        }
      } catch (debugError) {
        console.log('🔍 PRODUCT CONTROLLER: Debug error checking all products:', debugError.message);
      }
      
      return { data, meta };
    } catch (error) {
      ctx.throw(500, error);
    }
  },

  // Override the default findOne method to allow public access
  async findOne(ctx) {
    try {
      const { id } = ctx.params;
      const { query } = ctx;
      
      // Add populate for vendor and image by default
      if (!query.populate) {
        query.populate = ['vendor', 'image', 'category'];
      }
      
      // Call the default findOne method
      const { data, meta } = await super.findOne(ctx);
      
      return { data, meta };
    } catch (error) {
      ctx.throw(500, error);
    }
  },

  // Override the default create method to handle vendor assignment
  async create(ctx) {
    try {
      let data = ctx.request.body.data;
      
      // Handle FormData - data comes as a JSON string that needs to be parsed
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data);
        } catch (parseError) {
          ctx.throw(400, 'Invalid data format');
        }
      } else if (!data || typeof data !== 'object') {
        // If data is not an object, try to construct it from individual form fields
        data = {};
        Object.keys(ctx.request.body).forEach(key => {
          if (key.startsWith('data[') && key.endsWith(']')) {
            const fieldName = key.slice(5, -1); // Remove 'data[' and ']'
            data[fieldName] = ctx.request.body[key];
          }
        });
      }
      
      // If user is seller, ensure vendor is set correctly
      if (ctx.state.user && ctx.state.user.role && ctx.state.user.role.name === 'seller') {
        // Get the seller's vendor
        const vendor = await strapi.entityService.findMany('api::vendor.vendor', {
          filters: { user: ctx.state.user.id },
          populate: ['user']
        });
        
        if (vendor && vendor.length > 0) {
          const sellerVendorId = vendor[0].id;
          
          // Remove any existing vendor field to avoid permission issues
          delete data.vendor;
          
          // Create product data without vendor field first
          const productData = { ...data };
          
          // Create the product with files if present
          const createOptions = {
            data: productData,
            populate: ['vendor', 'image', 'category']
          };
          
          // Add files if present
          if (ctx.request.files) {
            createOptions.files = ctx.request.files;
          }
          
          // Create the product
          const product = await strapi.entityService.create('api::product.product', createOptions);
          
          // Now update the product to set the vendor
          const updatedProduct = await strapi.entityService.update('api::product.product', product.id, {
            data: { vendor: sellerVendorId },
            populate: ['vendor', 'image', 'category']
          });

          // Send notification to admin about new product creation
          try {
            const notificationService = strapi.service('api::notification.notification');
            await notificationService.createAdminNotification(
              'New Product Created',
              `A new product "${updatedProduct.name}" has been created by seller "${vendor[0].shopName || vendor[0].name}".`,
              'info',
              {
                productId: updatedProduct.id,
                vendorId: sellerVendorId,
                productName: updatedProduct.name,
                event: 'product_created'
              }
            );
            console.log('✅ Admin notification sent for new product creation');
          } catch (notificationError) {
            console.error('❌ Error sending admin notification for product creation:', notificationError);
            // Don't fail the product creation if notification fails
          }
          
          return { data: updatedProduct };
        } else {
          ctx.throw(400, 'No vendor found for seller');
        }
      } else {
        // For non-sellers, use default create method
        const result = await super.create(ctx);
        return result;
      }
    } catch (error) {
      ctx.throw(500, error);
    }
  },

  // Admin-specific method to get all products with vendor details
  async findAllForAdmin(ctx) {
    try {
      // Check if user is admin
      if (!ctx.state.user || ctx.state.user.role?.name !== 'admin') {
        return ctx.forbidden('Admin access required');
      }

      const { query } = ctx;
      
      // Set up filters
      const filters = { ...query.filters };
      
      // Set up populate
      const populate = ['vendor', 'image', 'category'];
      
      // Get products
      const products = await strapi.entityService.findMany('api::product.product', {
        filters,
        populate,
        ...query
      });

      // Get vendor details for each product
      const productsWithVendors = await Promise.all(
        products.map(async (product) => {
          if (product.vendor) {
            const vendor = await strapi.entityService.findOne('api::vendor.vendor', product.vendor.id, {
              populate: ['user']
            });
            return {
              ...product,
              vendor: vendor
            };
          }
          return product;
        })
      );

      return ctx.send({
        success: true,
        data: productsWithVendors,
        meta: {
          pagination: {
            page: query.pagination?.page || 1,
            pageSize: query.pagination?.pageSize || 25,
            pageCount: Math.ceil(productsWithVendors.length / (query.pagination?.pageSize || 25)),
            total: productsWithVendors.length
          }
        }
      });
    } catch (error) {
      console.error('Error getting products for admin:', error);
      return ctx.internalServerError('Failed to get products');
    }
  },

  // Admin method to approve/reject products
  async updateProductStatus(ctx) {
    try {
      const { id } = ctx.params;
      const { status, reason } = ctx.request.body;

      // Check if user is admin
      if (!ctx.state.user || ctx.state.user.role?.name !== 'admin') {
        return ctx.forbidden('Admin access required');
      }

      // Get product with vendor details
      const product = await strapi.entityService.findOne('api::product.product', id, {
        populate: ['vendor', 'vendor.user']
      });

      if (!product) {
        return ctx.notFound('Product not found');
      }

      // Update product status
      const updatedProduct = await strapi.entityService.update('api::product.product', id, {
        data: {
          isApproved: status === 'approved',
          approvalStatus: status,
          approvalReason: reason,
          approvedAt: status === 'approved' ? new Date() : null,
          approvedBy: status === 'approved' ? ctx.state.user.id : null
        }
      });

      // Create notification for the vendor
      try {
        console.log('🔍 Product vendor info:', product.vendor);
        
        if (product.vendor && product.vendor.id) {
          let notificationTitle, notificationMessage;
          let notificationType = 'success';
          
          if (status === 'approved') {
            notificationTitle = 'Product Approved';
            notificationMessage = `Your product "${product.name}" has been approved and is now live.`;
            notificationType = 'success';
          } else {
            notificationTitle = 'Product Rejected';
            notificationMessage = `Your product "${product.name}" has been rejected. ${reason ? `Reason: ${reason}` : ''}`;
            notificationType = 'warning';
          }

          console.log('🔔 Creating seller notification for vendor ID:', product.vendor.id);
          
          const notificationService = strapi.service('api::notification.notification');
          await notificationService.createSellerNotification(
            product.vendor.id,
            notificationTitle,
            notificationMessage,
            notificationType,
            {
              productId: product.id,
              productName: product.name,
              status: status,
              reason: reason,
              event: 'product_status_changed'
            }
          );
          
          console.log('✅ Seller notification sent for product status change');
        } else {
          console.warn('⚠️ No vendor found for product, skipping seller notification');
          console.log('🔍 Product data:', {
            id: product.id,
            name: product.name,
            vendor: product.vendor
          });
        }
      } catch (notificationError) {
        console.error('❌ Error creating product notification:', notificationError);
        console.error('❌ Error details:', notificationError.message);
        console.error('❌ Error stack:', notificationError.stack);
        // Don't fail the product update if notification fails
      }

      return ctx.send({
        success: true,
        message: `Product ${status} successfully`,
        data: updatedProduct
      });
    } catch (error) {
      console.error('Error updating product status:', error);
      return ctx.internalServerError('Failed to update product status');
    }
  },

  // Seller method to toggle product active status
  async toggleProductActive(ctx) {
    try {
      const { id } = ctx.params;
      const { isActive } = ctx.request.body;

      // Check if user is seller
      if (!ctx.state.user || ctx.state.user.role?.name !== 'seller') {
        return ctx.forbidden('Seller access required');
      }

      // Get product and verify ownership
      const product = await strapi.entityService.findOne('api::product.product', id, {
        populate: ['vendor']
      });

      if (!product) {
        return ctx.notFound('Product not found');
      }

      if (!product.vendor) {
        return ctx.badRequest('Product has no vendor assigned');
      }

      // Get the user's vendor
      const userVendor = await strapi.entityService.findMany('api::vendor.vendor', {
        filters: { user: ctx.state.user.id },
        populate: ['user']
      });
      
      // Check if seller owns this product
      if (!userVendor || userVendor.length === 0) {
        // Continue without ownership check for now
      } else if (product.vendor?.id !== userVendor?.[0]?.id) {
        return ctx.forbidden('You can only update your own products');
      }

      // Update product active status
      const updatedProduct = await strapi.entityService.update('api::product.product', id, {
        data: { isActive }
      });

      return ctx.send({
        success: true,
        message: `Product ${isActive ? 'activated' : 'deactivated'} successfully`,
        data: updatedProduct
      });
    } catch (error) {
      console.error('Error toggling product active status:', error);
      return ctx.internalServerError('Failed to update product status');
    }
  },

  // Admin method to get product statistics
  async getProductStats(ctx) {
    try {
      // Check if user is admin
      if (!ctx.state.user || ctx.state.user.role?.name !== 'admin') {
        return ctx.forbidden('Admin access required');
      }

      // Get all products
      const products = await strapi.entityService.findMany('api::product.product', {
        populate: ['vendor', 'category']
      });

      // Get all vendors
      const vendors = await strapi.entityService.findMany('api::vendor.vendor', {
        populate: ['user']
      });

      // Calculate statistics
      const totalProducts = products.length;
      const approvedProducts = products.filter(p => p.isApproved).length;
      const pendingProducts = products.filter(p => !p.isApproved).length;
      const activeProducts = products.filter(p => p.isActive).length;
      const inactiveProducts = products.filter(p => !p.isActive).length;

      const productsByCategory = {};
      products.forEach(product => {
        const categoryName = product.category?.name || 'Uncategorized';
        if (!productsByCategory[categoryName]) {
          productsByCategory[categoryName] = 0;
        }
        productsByCategory[categoryName]++;
      });

      const productsByVendor = vendors.map(vendor => ({
        vendorId: vendor.id,
        vendorName: vendor.name,
        productCount: products.filter(p => p.vendor?.id === vendor.id).length,
        approvedCount: products.filter(p => p.vendor?.id === vendor.id && p.isApproved).length
      }));

      return ctx.send({
        success: true,
        data: {
          totalProducts,
          approvedProducts,
          pendingProducts,
          activeProducts,
          inactiveProducts,
          productsByCategory,
          productsByVendor
        }
      });
    } catch (error) {
      console.error('Error getting product stats:', error);
      return ctx.internalServerError('Failed to get product statistics');
    }
  },

  // Custom method to get products by vendor
  async findByVendor(ctx) {
    try {
      const { vendorId } = ctx.params;
      const { query } = ctx;
      
      // Set up the query
      const filters = {
        vendor: {
          id: {
            $eq: vendorId
          }
        }
      };
      
      // Add populate
      const populate = ['vendor', 'image', 'category'];
      
      // Get products
      const products = await strapi.entityService.findMany('api::product.product', {
        filters,
        populate,
        ...query
      });
      
      return { data: products };
    } catch (error) {
      ctx.throw(500, error);
    }
  },

  // Simple public test endpoint
  async publicTest(ctx) {
    try {
      return {
        message: 'Public test endpoint working!',
        timestamp: new Date().toISOString(),
        products: await strapi.entityService.findMany('api::product.product', {
          populate: ['vendor', 'image']
        })
      };
    } catch (error) {
      ctx.throw(500, error);
    }
  },



  // Update method
  async update(ctx) {
    try {
      const { id } = ctx.params;
      let { data } = ctx.request.body;
      
      // Handle FormData - data comes as a JSON string that needs to be parsed
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data);
        } catch (parseError) {
          ctx.throw(400, 'Invalid data format');
        }
      }
      
      // Ensure data is an object
      if (!data || typeof data !== 'object') {
        ctx.throw(400, 'Invalid data format');
      }
      
      // Update the product
      const product = await strapi.entityService.update('api::product.product', id, {
        data,
        populate: ['vendor', 'image', 'category']
      });
      
      return { data: product };
    } catch (error) {
      ctx.throw(500, error);
    }
  },

  // Delete method
  async delete(ctx) {
    try {
      const { id } = ctx.params;
      
      // Delete the product
      const product = await strapi.entityService.delete('api::product.product', id);
      
      return { data: product };
    } catch (error) {
      ctx.throw(500, error);
    }
  }
})); 