'use strict';

/**
 *  order controller
 */

const { createCoreController } = require('@strapi/strapi').factories;
const invoiceService = require('../services/invoice');

module.exports = createCoreController('api::order.order', ({ strapi }) => ({
  async find(ctx) {
    try {
      console.log('🔍 Order find called - User:', ctx.state.user?.role?.name);
      console.log('🔍 Order find called - Query:', ctx.query);
      
      // Check if this is an admin stats request
      if (ctx.query.admin === 'stats' && ctx.state.user?.role?.name === 'admin') {
        return await this.getOrderStats(ctx);
      }
      
      // Check if this is an admin all request
      if (ctx.query.admin === 'all' && ctx.state.user?.role?.name === 'admin') {
        return await this.findAllForAdmin(ctx);
      }
      
      const { query } = ctx;
      
      // Add populate for vendor and products by default
      if (!query.populate) {
        query.populate = ['vendor', 'products', 'user'];
      } else if (typeof query.populate === 'string') {
        // Convert string to array if needed
        query.populate = query.populate.split(',');
      }
      
      // For sellers, filter orders by their vendor
      if (ctx.state.user && ctx.state.user.role && ctx.state.user.role.name === 'seller') {
        console.log('🔍 Seller requesting orders - User ID:', ctx.state.user.id);
        
        // Get the seller's vendor
        const vendor = await strapi.entityService.findMany('api::vendor.vendor', {
          filters: { user: ctx.state.user.id },
          populate: ['user']
        });
        
        console.log('🔍 Found vendors for seller:', vendor);
        
        if (vendor && vendor.length > 0) {
          const sellerVendorId = vendor[0].id;
          console.log('🔍 Seller vendor ID:', sellerVendorId);
          
          // Use a simpler approach - fetch orders directly with vendor filter
          console.log('🔍 Using direct vendor filtering for seller');
          
          // Use entityService directly to avoid populate issues
          const orders = await strapi.entityService.findMany('api::order.order', {
            filters: { vendor: sellerVendorId },
            populate: {
              vendor: true,
              user: true,
              products: {
                populate: {
                  image: true,
                  images: true
                }
              }
            }
          });
          
          console.log('🔍 Found orders for seller:', orders.length);
          console.log('🔍 Orders:', orders.map(o => ({ id: o.id, vendor: o.vendor?.id, customer: o.customerName })));
          
          return { 
            data: orders, 
            meta: { 
              pagination: { 
                page: 1, 
                pageSize: 25, 
                pageCount: Math.ceil(orders.length / 25), 
                total: orders.length 
              } 
            } 
          };
        } else {
          console.log('🔍 No vendor found for seller, returning empty results');
          // If seller has no vendor, return empty results
          return { data: [], meta: { pagination: { page: 1, pageSize: 25, pageCount: 0, total: 0 } } };
        }
      }
      
      // For admin, ensure we have all necessary data
      if (ctx.state.user && ctx.state.user.role && ctx.state.user.role.name === 'admin') {
        const populateArray = Array.isArray(query.populate) ? query.populate : query.populate.split(',');
        if (!populateArray.includes('vendor')) {
          populateArray.push('vendor');
        }
        if (!populateArray.includes('user')) {
          populateArray.push('user');
        }
        query.populate = populateArray;
      }
      
      // For regular users, use direct entityService approach
      console.log('🔍 Regular user requesting orders - User ID:', ctx.state.user?.id);
      console.log('🔍 User role:', ctx.state.user?.role?.name || 'no role');
      
      // Use entityService directly to avoid super.find issues
      const orders = await strapi.entityService.findMany('api::order.order', {
        filters: query.filters || {},
        populate: {
          vendor: true,
          user: true,
          products: {
            populate: {
              image: true,
              images: true
            }
          }
        },
        sort: query.sort || { createdAt: 'desc' },
        pagination: query.pagination || { page: 1, pageSize: 25 }
      });
      
      console.log('🔍 Direct entityService result - orders length:', orders?.length || 0);
      
      // If we have customer email filter, apply it manually
      if (query.filters && query.filters.customerEmail) {
        console.log('🔍 Filtering by customer email:', query.filters.customerEmail);
        const filteredData = orders.filter(order => {
          const orderEmail = order.customerEmail || order.user?.email;
          console.log('🔍 Comparing order email:', orderEmail, 'with filter:', query.filters.customerEmail.$eq);
          return orderEmail === query.filters.customerEmail.$eq;
        });
        console.log('🔍 Filtered data length:', filteredData.length);
        return { 
          data: filteredData, 
          meta: { 
            pagination: { 
              page: query.pagination?.page || 1, 
              pageSize: query.pagination?.pageSize || 25, 
              pageCount: Math.ceil(filteredData.length / (query.pagination?.pageSize || 25)), 
              total: filteredData.length 
            } 
          } 
        };
      }
      
      return { 
        data: orders, 
        meta: { 
          pagination: { 
            page: query.pagination?.page || 1, 
            pageSize: query.pagination?.pageSize || 25, 
            pageCount: Math.ceil(orders.length / (query.pagination?.pageSize || 25)), 
            total: orders.length 
          } 
        } 
      };
    } catch (error) {
      console.error('Error in order find:', error);
      // Return empty results instead of throwing error
      return { data: [], meta: { pagination: { page: 1, pageSize: 25, pageCount: 0, total: 0 } } };
    }
  },

  async findOne(ctx) {
    try {
      const { id } = ctx.params;
      const { query } = ctx;
      
      // Add populate for vendor and products by default
      if (!query.populate) {
        query.populate = ['vendor', 'products', 'user'];
      } else if (typeof query.populate === 'string') {
        // Convert string to array if needed
        query.populate = query.populate.split(',');
      }
      
      // For sellers, check if they have access to this order
      if (ctx.state.user && ctx.state.user.role && ctx.state.user.role.name === 'seller') {
        // Get the order first
        const order = await strapi.entityService.findOne('api::order.order', id, {
          populate: ['vendor']
        });
        
        if (!order) {
          return ctx.notFound('Order not found');
        }
        
        // Get the seller's vendor
        const vendor = await strapi.entityService.findMany('api::vendor.vendor', {
          filters: { user: ctx.state.user.id },
          populate: ['user']
        });
        
        if (!vendor || vendor.length === 0 || order.vendor?.id !== vendor[0].id) {
          return ctx.forbidden('You can only access orders for your own vendor');
        }
      }
      
      // Call the default findOne method
      const { data, meta } = await super.findOne(ctx);
      
      return { data, meta };
    } catch (error) {
      ctx.throw(500, error);
    }
  },

  // Admin-specific method to get all orders with vendor details
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
      const populate = ['vendor', 'products', 'user'];
      
      // Get orders
      const orders = await strapi.entityService.findMany('api::order.order', {
        filters,
        populate,
        ...query
      });

      // Get vendor details for each order
      const ordersWithVendors = await Promise.all(
        orders.map(async (order) => {
          if (order.vendor) {
            const vendor = await strapi.entityService.findOne('api::vendor.vendor', order.vendor.id, {
              populate: ['user']
            });
            return {
              ...order,
              vendor: vendor
            };
          }
          return order;
        })
      );

      return ctx.send({
        success: true,
        data: ordersWithVendors,
        meta: {
          pagination: {
            page: query.pagination?.page || 1,
            pageSize: query.pagination?.pageSize || 25,
            pageCount: Math.ceil(ordersWithVendors.length / (query.pagination?.pageSize || 25)),
            total: ordersWithVendors.length
          }
        }
      });
    } catch (error) {
      console.error('Error getting orders for admin:', error);
      return ctx.internalServerError('Failed to get orders');
    }
  },

  // Admin method to get order statistics
  async getOrderStats(ctx) {
    try {
      // Check if user is admin
      if (!ctx.state.user || ctx.state.user.role?.name !== 'admin') {
        return ctx.forbidden('Admin access required');
      }

      // Get all orders
      const orders = await strapi.entityService.findMany('api::order.order', {
        populate: ['vendor', 'products']
      });

      // Get all vendors
      const vendors = await strapi.entityService.findMany('api::vendor.vendor', {
        populate: ['user']
      });

      // Calculate statistics
      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((sum, order) => sum + (parseFloat(order.totalAmount) || 0), 0);
      
      const ordersByStatus = {
        pending: orders.filter(o => o.status === 'pending').length,
        confirmed: orders.filter(o => o.status === 'confirmed').length,
        shipped: orders.filter(o => o.status === 'shipped').length,
        delivered: orders.filter(o => o.status === 'delivered').length,
        cancelled: orders.filter(o => o.status === 'cancelled').length
      };

      const ordersByVendor = vendors.map(vendor => {
        const vendorOrders = orders.filter(o => o.vendor?.id === vendor.id);
        const vendorRevenue = vendorOrders.reduce((sum, order) => sum + (parseFloat(order.totalAmount) || 0), 0);
        
        return {
          vendorId: vendor.id,
          vendorName: vendor.name,
          orderCount: vendorOrders.length,
          revenue: vendorRevenue,
          ordersByStatus: {
            pending: vendorOrders.filter(o => o.status === 'pending').length,
            confirmed: vendorOrders.filter(o => o.status === 'confirmed').length,
            shipped: vendorOrders.filter(o => o.status === 'shipped').length,
            delivered: vendorOrders.filter(o => o.status === 'delivered').length,
            cancelled: vendorOrders.filter(o => o.status === 'cancelled').length
          }
        };
      });

      // Recent orders (last 10)
      const recentOrders = orders
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 10);

      return ctx.send({
        success: true,
        data: {
          totalOrders,
          totalRevenue,
          ordersByStatus,
          ordersByVendor,
          recentOrders
        }
      });
    } catch (error) {
      console.error('Error getting order stats:', error);
      return ctx.internalServerError('Failed to get order statistics');
    }
  },

  // Admin method to update order status
  async updateOrderStatusByAdmin(ctx) {
    try {
      const { id } = ctx.params;
      const { status, notes } = ctx.request.body;

      // Check if user is admin
      if (!ctx.state.user || ctx.state.user.role?.name !== 'admin') {
        return ctx.forbidden('Admin access required');
      }

      // Get order
      const order = await strapi.entityService.findOne('api::order.order', id, {
        populate: ['vendor']
      });

      if (!order) {
        return ctx.notFound('Order not found');
      }

      // Update order status
      const updatedOrder = await strapi.entityService.update('api::order.order', id, {
        data: {
          status: status,
          adminNotes: notes,
          statusUpdatedAt: new Date(),
          statusUpdatedBy: ctx.state.user.id
        }
      });

      return ctx.send({
        success: true,
        message: `Order status updated to ${status}`,
        data: updatedOrder
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      return ctx.internalServerError('Failed to update order status');
    }
  },

  async create(ctx) {
    // Get the authenticated user
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('You must be logged in to place an order.');
    }

    // Get the order data from the request
    const { data } = ctx.request.body;

    console.log('🛒 Creating new order with data:', JSON.stringify(data, null, 2));

    // Calculate delivery charge (default to 50 if not provided)
    const deliveryCharge = data.deliveryCharge || 50;
    
    // Calculate subtotal from order items
    let subtotal = 0;
    if (data.orderItems && Array.isArray(data.orderItems)) {
      subtotal = data.orderItems.reduce((sum, item) => {
        return sum + (parseFloat(item.totalAmount) || 0);
      }, 0);
    }

    // Calculate total amount including delivery charge
    const totalAmount = subtotal + deliveryCharge;

    console.log('💰 Order calculation:', {
      subtotal,
      deliveryCharge,
      totalAmount
    });

    // Auto-assign vendor based on products if not provided
    let vendorId = data.vendor;
    if (!vendorId && data.products && data.products.length > 0) {
      // Get the first product to determine vendor
      const firstProduct = await strapi.entityService.findOne('api::product.product', data.products[0], {
        populate: ['vendor']
      });
      
      if (firstProduct && firstProduct.vendor) {
        vendorId = firstProduct.vendor.id;
        console.log('🔍 Auto-assigned vendor ID:', vendorId, 'from product:', firstProduct.name);
      }
    }

    // Prepare order data with delivery charge and vendor
    const orderData = {
      ...data,
      user: user.id, // set the user relation
      vendor: vendorId, // set the vendor relation
      deliveryCharge: deliveryCharge,
      totalAmount: totalAmount,
    };

    console.log('📝 Final order data:', JSON.stringify(orderData, null, 2));

    // Create the order
    const response = await strapi.service('api::order.order').create({ data: orderData });

    console.log('✅ Order created successfully:', response.id);

    // Return the created order
    return this.transformResponse(response);
  },

  async update(ctx) {
    const { id } = ctx.params;
    const { data } = ctx.request.body;

    try {
      // Get the existing order to preserve required fields
      const existingOrder = await strapi.service('api::order.order').findOne(id, {
        populate: ['vendor']
      });
      if (!existingOrder) {
        return ctx.notFound('Order not found');
      }

      // For sellers, check if they have access to this order
      if (ctx.state.user && ctx.state.user.role && ctx.state.user.role.name === 'seller') {
        // Get the seller's vendor
        const vendor = await strapi.entityService.findMany('api::vendor.vendor', {
          filters: { user: ctx.state.user.id },
          populate: ['user']
        });
        
        // Debug logging for vendor check
        if (process.env.NODE_ENV === 'development') {
          console.log('🔍 Seller vendor check:', {
            sellerVendorId: vendor[0]?.id,
            orderVendorId: existingOrder.vendor?.id
          });
        }
        
        if (!vendor || vendor.length === 0 || existingOrder.vendor?.id !== vendor[0].id) {
          return ctx.forbidden('You can only update orders for your own vendor');
        }
      }

      // Check for required fields in existing order
      const requiredFields = ['orderNumber', 'totalAmount', 'customerName', 'customerEmail'];
      const missingFields = requiredFields.filter(field => !existingOrder[field]);
      
      if (missingFields.length > 0) {
        console.log('⚠️ Missing required fields in existing order:', missingFields);
      }

      // Merge the existing data with the update data
      const updateData = {
        ...existingOrder,
        ...data,
        id: undefined // Remove id from data to avoid conflicts
      };

      // Update the order
      const response = await strapi.service('api::order.order').update(id, { data: updateData });

      return this.transformResponse(response);
    } catch (error) {
      console.error('❌ Error updating order:', error.message);
      
      // Provide more specific error messages
      if (error.message.includes('unique')) {
        return ctx.badRequest('Order number must be unique');
      }
      if (error.message.includes('required')) {
        return ctx.badRequest('Missing required fields: ' + error.message);
      }
      if (error.message.includes('validation')) {
        return ctx.badRequest('Validation error: ' + error.message);
      }
      
      return ctx.badRequest('Failed to update order: ' + error.message);
    }
  },

  async findOne(ctx) {
    const { id } = ctx.params;
    const { invoice } = ctx.query;

    // If invoice parameter is present, generate invoice
    if (invoice === 'true') {
      return this.downloadInvoice(ctx);
    }

    try {
      // Get the order with vendor populated for permission checking
      const order = await strapi.service('api::order.order').findOne(id, {
        populate: ['vendor', 'products', 'user']
      });

      if (!order) {
        return ctx.notFound('Order not found');
      }

      // For sellers, check if they have access to this order
      if (ctx.state.user && ctx.state.user.role && ctx.state.user.role.name === 'seller') {
        // Get the seller's vendor
        const vendor = await strapi.entityService.findMany('api::vendor.vendor', {
          filters: { user: ctx.state.user.id },
          populate: ['user']
        });
        
        // Debug logging for order access check
        if (process.env.NODE_ENV === 'development') {
          console.log('🔍 Seller order access check:', {
            sellerVendorId: vendor[0]?.id,
            orderVendorId: order.vendor?.id,
            orderId: order.id
          });
        }
        
        if (!vendor || vendor.length === 0 || order.vendor?.id !== vendor[0].id) {
          return ctx.forbidden('You can only view orders for your own vendor');
        }
      }

      return this.transformResponse(order);
    } catch (error) {
      console.error('❌ Error in findOne:', error);
      return ctx.internalServerError('Failed to fetch order details');
    }
  },

  async downloadInvoice(ctx) {
    try {
      const { id } = ctx.params;
      
      // Get the authenticated user
      const user = ctx.state.user;
      if (!user) {
        return ctx.unauthorized('You must be logged in to download invoices.');
      }

      console.log(`📄 Generating invoice for order: ${id}`);

      // Get the order with all details
      const order = await strapi.entityService.findOne('api::order.order', id, {
        populate: ['user', 'vendor', 'products']
      });

      if (!order) {
        return ctx.notFound('Order not found');
      }

      // Check if user has permission to access this order
      if (order.user && order.user.id !== user.id) {
        return ctx.forbidden('You can only download invoices for your own orders');
      }

      // Generate invoice data
      const invoiceData = invoiceService.generateInvoiceData(order);
      
      // Generate text invoice
      const invoiceText = invoiceService.generateTextInvoice(invoiceData);
      
      // Generate filename
      const filename = invoiceService.generateInvoiceFilename(invoiceData);

      console.log(`✅ Invoice generated successfully for order: ${order.orderNumber}`);

      // Set response headers for file download
      ctx.set('Content-Type', 'text/plain');
      ctx.set('Content-Disposition', `attachment; filename="${filename}"`);
      
      // Send the invoice content
      ctx.body = invoiceText;

    } catch (error) {
      console.error('❌ Error generating invoice:', error);
      return ctx.internalServerError('Failed to generate invoice');
    }
  },
})); 