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
      }
      
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

      // For admin, add additional filtering options
      if (ctx.state.user && ctx.state.user.role && ctx.state.user.role.name === 'admin') {
        // Ensure we populate vendor data for admin
        if (!query.populate.includes('vendor')) {
          query.populate = [...query.populate.split(','), 'vendor'];
        }
      }
      
      // Call the default find method
      const { data, meta } = await super.find(ctx);
      
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

      // Get product
      const product = await strapi.entityService.findOne('api::product.product', id, {
        populate: ['vendor']
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
      const { data } = ctx.request.body;
      
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