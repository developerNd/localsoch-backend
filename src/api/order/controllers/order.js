'use strict';

/**
 *  order controller
 */

const { createCoreController } = require('@strapi/strapi').factories;
const invoiceService = require('../services/invoice');

module.exports = createCoreController('api::order.order', ({ strapi }) => ({


  // Update order status and create notifications
  async updateStatus(ctx) {
    try {
      const { id } = ctx.params;
      const { status, reason } = ctx.request.body;
      
      console.log('🔍 updateStatus called with:', { id, status, reason });
      console.log('🔍 User:', ctx.state.user?.id, ctx.state.user?.role?.name);
      
      if (!ctx.state.user || ctx.state.user.role?.name !== 'seller') {
        console.log('❌ Access denied - not a seller');
        return ctx.forbidden('Seller access required');
      }

      // Get the order - try by documentId first, then by numeric ID
      let order = await strapi.entityService.findMany('api::order.order', {
        filters: { documentId: id },
        populate: ['vendor', 'user', 'products']
      });

      if (order && order.length > 0) {
        order = order[0];
        console.log('🔍 Found order by documentId:', order.id, order.orderNumber, order.vendor?.id);
      } else {
        // Try by numeric ID as fallback
        order = await strapi.entityService.findOne('api::order.order', id, {
          populate: ['vendor', 'user', 'products']
        });
        console.log('🔍 Found order by numeric ID:', order?.id, order?.orderNumber, order?.vendor?.id);
      }

      if (!order) {
        console.log('❌ Order not found by documentId or numeric ID');
        return ctx.notFound('Order not found');
      }

      // Check if seller owns this order
      const vendor = await strapi.entityService.findMany('api::vendor.vendor', {
        filters: { user: ctx.state.user.id }
      });

      console.log('🔍 Seller vendors:', vendor.map(v => ({ id: v.id, name: v.name })));
      console.log('🔍 Order vendor ID:', order.vendor?.id);
      console.log('🔍 Seller vendor ID:', vendor[0]?.id);

      if (!vendor || vendor.length === 0) {
        console.log('❌ Seller has no vendor');
        return ctx.forbidden('You must have a vendor account to update orders');
      }

      if (order.vendor?.id !== vendor[0].id) {
        console.log('❌ Vendor mismatch');
        return ctx.forbidden('You can only update orders for your own vendor');
      }

      const previousStatus = order.status;

      // Update the order status using the numeric ID
      console.log('🔧 Updating order with ID:', order.id, 'to status:', status);
      const updatedOrder = await strapi.entityService.update('api::order.order', order.id, {
        data: { 
          status,
          statusReason: reason,
          statusUpdatedAt: new Date()
        },
        populate: ['vendor', 'user', 'products']
      });
      
      console.log('✅ Order updated successfully:', updatedOrder.id, updatedOrder.status);

      // Adjust stock based on status transitions (cancelled ↔ active)
      try {
        // Build line items from order (prefer orderItems with quantity; fallback to products relation as qty 1)
        const lineItems = Array.isArray(order.orderItems) && order.orderItems.length > 0
          ? order.orderItems.map((item) => ({ productId: item.productId || item.product, quantity: parseInt(item.quantity, 10) || 1 }))
          : (Array.isArray(order.products) ? order.products.map((p) => ({ productId: p.id || p, quantity: 1 })) : []);

        // If newly cancelled, restock; if moved out of cancelled, re-deduct
        if (previousStatus !== 'cancelled' && status === 'cancelled') {
          for (const item of lineItems) {
            if (!item.productId) continue;
            const product = await strapi.entityService.findOne('api::product.product', item.productId, { fields: ['stock'] });
            if (!product) continue;
            const currentStock = parseInt(product.stock, 10) || 0;
            const restored = currentStock + (parseInt(item.quantity, 10) || 0);
            await strapi.entityService.update('api::product.product', item.productId, { data: { stock: restored } });
          }
          console.log('✅ Stock restored due to order cancellation');
        } else if (previousStatus === 'cancelled' && status !== 'cancelled') {
          for (const item of lineItems) {
            if (!item.productId) continue;
            const product = await strapi.entityService.findOne('api::product.product', item.productId, { fields: ['stock'] });
            if (!product) continue;
            const currentStock = parseInt(product.stock, 10) || 0;
            const deducted = Math.max(0, currentStock - (parseInt(item.quantity, 10) || 0));
            await strapi.entityService.update('api::product.product', item.productId, { data: { stock: deducted } });
          }
          console.log('✅ Stock re-deducted as order moved out of cancelled');
        }
      } catch (stockAdjustError) {
        console.error('❌ Error adjusting stock on status change:', stockAdjustError);
      }

      // Create notification for the customer
      if (order.user) {
        let notificationTitle, notificationMessage;
        
        switch (status) {
          case 'accepted':
            notificationTitle = 'Order Accepted';
            notificationMessage = `Your order #${order.orderNumber} has been accepted and is being processed.`;
            break;
          case 'rejected':
            notificationTitle = 'Order Rejected';
            notificationMessage = `Your order #${order.orderNumber} has been rejected. ${reason ? `Reason: ${reason}` : ''}`;
            break;
          case 'shipped':
            notificationTitle = 'Order Shipped';
            notificationMessage = `Your order #${order.orderNumber} has been shipped and is on its way to you.`;
            break;
          case 'delivered':
            notificationTitle = 'Order Delivered';
            notificationMessage = `Your order #${order.orderNumber} has been delivered. Thank you for your purchase!`;
            break;
          default:
            notificationTitle = 'Order Status Updated';
            notificationMessage = `Your order #${order.orderNumber} status has been updated to ${status}.`;
        }

        const notificationData = {
          title: notificationTitle,
          message: notificationMessage,
          type: 'order',
          user: order.user.id,
          vendor: order.vendor.id,
          order: order.id,
          actionUrl: `/orders/${order.id}`,
          actionText: 'View Order',
          isImportant: status === 'rejected' || status === 'delivered'
        };

        console.log('🔔 Creating order status notification:', notificationData);

        // Use notification service for WebSocket integration
        const notificationService = strapi.service('api::notification.notification');
        const notification = await notificationService.createNotification(notificationData);
        
        console.log('✅ Order status notification created with WebSocket:', notification.id);
      }

      return { data: updatedOrder };
    } catch (error) {
      console.error('Error updating order status:', error);
      return ctx.internalServerError('Failed to update order status');
    }
  },

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
      
      console.log('🔍 findOne called for order ID:', id);
      
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
      
      // Use entityService directly instead of super.findOne
      const order = await strapi.entityService.findOne('api::order.order', id, {
        populate: query.populate
      });
      
      if (!order) {
        return ctx.notFound('Order not found');
      }
      
      console.log('✅ Order found:', order.id, order.orderNumber);
      
      return this.transformResponse(order);
    } catch (error) {
      console.error('❌ Error in findOne:', error);
      return ctx.internalServerError('Failed to fetch order details');
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
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
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

      const previousStatus = order.status;

      // Update order status
      const updatedOrder = await strapi.entityService.update('api::order.order', id, {
        data: {
          status: status,
          adminNotes: notes,
          statusUpdatedAt: new Date(),
          statusUpdatedBy: ctx.state.user.id
        }
      });

      // Adjust stock on admin status change
      try {
        const lineItems = Array.isArray(order.orderItems) && order.orderItems.length > 0
          ? order.orderItems.map((item) => ({ productId: item.productId || item.product, quantity: parseInt(item.quantity, 10) || 1 }))
          : (Array.isArray(order.products) ? order.products.map((p) => ({ productId: p.id || p, quantity: 1 })) : []);

        if (previousStatus !== 'cancelled' && status === 'cancelled') {
          for (const item of lineItems) {
            if (!item.productId) continue;
            const product = await strapi.entityService.findOne('api::product.product', item.productId, { fields: ['stock'] });
            if (!product) continue;
            const currentStock = parseInt(product.stock, 10) || 0;
            const restored = currentStock + (parseInt(item.quantity, 10) || 0);
            await strapi.entityService.update('api::product.product', item.productId, { data: { stock: restored } });
          }
          console.log('✅ (Admin) Stock restored due to order cancellation');
        } else if (previousStatus === 'cancelled' && status !== 'cancelled') {
          for (const item of lineItems) {
            if (!item.productId) continue;
            const product = await strapi.entityService.findOne('api::product.product', item.productId, { fields: ['stock'] });
            if (!product) continue;
            const currentStock = parseInt(product.stock, 10) || 0;
            const deducted = Math.max(0, currentStock - (parseInt(item.quantity, 10) || 0));
            await strapi.entityService.update('api::product.product', item.productId, { data: { stock: deducted } });
          }
          console.log('✅ (Admin) Stock re-deducted as order moved out of cancelled');
        }
      } catch (stockAdjustError) {
        console.error('❌ (Admin) Error adjusting stock on status change:', stockAdjustError);
      }

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

    // Calculate delivery charge based on vendor settings
    let deliveryCharge = 0;
    if (data.deliveryType !== 'pickup' && data.vendor) {
      try {
        // Get vendor delivery fees configuration
        const vendor = await strapi.entityService.findOne('api::vendor.vendor', data.vendor, {
          populate: ['deliveryFees']
        });
        
        if (vendor?.deliveryFees?.isDeliveryAvailable) {
          const deliveryConfig = vendor.deliveryFees;
          deliveryCharge = parseFloat(deliveryConfig.baseDeliveryFee) || 0;
          
          // Check if order value meets free delivery threshold
          if (deliveryConfig.freeDeliveryThreshold && 
              subtotal >= parseFloat(deliveryConfig.freeDeliveryThreshold)) {
            deliveryCharge = 0;
          }
        }
      } catch (error) {
        console.log('⚠️ Error calculating delivery fees, using default:', error.message);
        deliveryCharge = 0;
      }
    }
    
    // Calculate subtotal from order items
    let subtotal = 0;
    if (data.orderItems && Array.isArray(data.orderItems)) {
      subtotal = data.orderItems.reduce((sum, item) => {
        return sum + (parseFloat(item.totalAmount) || 0);
      }, 0);
    }

    // Calculate total amount including delivery charge and coupon discount
    const couponDiscount = data.discountAmount || 0;
    const totalAmount = subtotal + deliveryCharge - couponDiscount;

    console.log('💰 Order calculation:', {
      subtotal,
      deliveryCharge,
      couponDiscount,
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
      // Preserve coupon information
      couponCode: data.couponCode || null,
      couponDiscount: data.couponDiscount || 0,
      couponPercentage: data.couponPercentage || 0,
      subtotal: data.subtotal || subtotal,
      discountAmount: data.discountAmount || 0,
    };

    console.log('📝 Final order data:', JSON.stringify(orderData, null, 2));

    // Build normalized order items list (supports either orderItems with quantities or products list as quantity 1)
    const lineItems = Array.isArray(data.orderItems) && data.orderItems.length > 0
      ? data.orderItems.map((item) => ({ productId: item.productId || item.product, quantity: parseInt(item.quantity, 10) || 1 }))
      : (Array.isArray(data.products) ? data.products.map((pid) => ({ productId: pid, quantity: 1 })) : []);

    // Validate stock availability before creating the order
    try {
      for (const item of lineItems) {
        if (!item.productId) {
          continue;
        }
        const product = await strapi.entityService.findOne('api::product.product', item.productId, {
          fields: ['stock', 'name']
        });
        if (!product) {
          return ctx.badRequest(`Product not found: ${item.productId}`);
        }
        const currentStock = parseInt(product.stock, 10) || 0;
        const requestedQty = parseInt(item.quantity, 10) || 0;
        if (requestedQty <= 0) {
          return ctx.badRequest(`Invalid quantity for product ${product.name}`);
        }
        if (currentStock < requestedQty) {
          return ctx.badRequest(`Insufficient stock for ${product.name}. Available: ${currentStock}, requested: ${requestedQty}`);
        }
      }
    } catch (stockCheckError) {
      console.error('❌ Stock validation error:', stockCheckError);
      return ctx.internalServerError('Failed to validate stock');
    }

    // Create the order
    const response = await strapi.service('api::order.order').create({ data: orderData });

    console.log('✅ Order created successfully:', response.id);

          // Create notification for the vendor
      try {
        const orderWithVendor = await strapi.entityService.findOne('api::order.order', response.id, {
          populate: {
            vendor: {
              populate: ['user']
            },
            user: true
          }
        });

        console.log('🔍 Order with vendor data:', {
          orderId: orderWithVendor.id,
          vendorId: orderWithVendor.vendor?.id,
          vendorUser: orderWithVendor.vendor?.user?.id,
          vendorUserData: orderWithVendor.vendor?.user
        });

        if (orderWithVendor.vendor && orderWithVendor.vendor.user) {
          console.log('🔔 Creating notification for vendor:', orderWithVendor.vendor.user.id);
          
          const notificationData = {
            title: 'New Order Received',
            message: `You have received a new order #${orderWithVendor.orderNumber} from ${orderWithVendor.customerName}`,
            type: 'order',
            user: orderWithVendor.vendor.user.id,
            vendor: orderWithVendor.vendor.id,
            order: orderWithVendor.id,
            actionUrl: `/orders/${orderWithVendor.id}`,
            actionText: 'View Order',
            isImportant: true
          };

          console.log('🔔 Notification data:', notificationData);

          const notification = await strapi.entityService.create('api::notification.notification', {
            data: notificationData,
            populate: ['user', 'vendor', 'order']
          });
          
          console.log('✅ Notification created successfully:', notification);
        } else {
          console.log('⚠️ No vendor or vendor user found for notification');
          console.log('🔍 Vendor data:', orderWithVendor.vendor);
          console.log('🔍 Vendor user data:', orderWithVendor.vendor?.user);
        }
      } catch (notificationError) {
        console.error('❌ Error creating notification:', notificationError);
        console.error('❌ Error details:', notificationError.message);
        // Don't fail the order creation if notification fails
      }

    // Decrement stock for ordered products after successful order creation
    try {
      for (const item of lineItems) {
        if (!item.productId) continue;
        const product = await strapi.entityService.findOne('api::product.product', item.productId, {
          fields: ['stock']
        });
        if (!product) continue;
        const currentStock = parseInt(product.stock, 10) || 0;
        const newStock = Math.max(0, currentStock - (parseInt(item.quantity, 10) || 0));
        await strapi.entityService.update('api::product.product', item.productId, {
          data: { stock: newStock }
        });
      }
    } catch (stockUpdateError) {
      console.error('❌ Failed to decrement stock after order creation:', stockUpdateError);
      // Note: We do not fail the order if stock update fails, but this should be monitored
    }

    // Return the created order
    return this.transformResponse(response);
  },

  async update(ctx) {
    const { id } = ctx.params;
    const { data } = ctx.request.body;

    console.log('🔍 update called for order ID:', id);
    console.log('🔍 update data:', data);

    try {
      // Get the existing order to preserve required fields
      const existingOrder = await strapi.entityService.findOne('api::order.order', id, {
        populate: ['vendor', 'user']
      });
      if (!existingOrder) {
        console.log('❌ Order not found in update method');
        return ctx.notFound('Order not found');
      }
      
      console.log('✅ Existing order found:', existingOrder.id, existingOrder.orderNumber);

      // For customers, check if they own this order
      if (ctx.state.user && ctx.state.user.role && ctx.state.user.role.name === 'authenticated') {
        if (existingOrder.user?.id !== ctx.state.user.id) {
          return ctx.forbidden('You can only update your own orders');
        }
        
        // Additional validation for cancellation
        if (data.status === 'cancelled') {
          const cancellableStatuses = ['pending', 'confirmed'];
          if (!cancellableStatuses.includes(existingOrder.status)) {
            return ctx.badRequest(`Orders with status "${existingOrder.status}" cannot be cancelled`);
          }
        }
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

      // Store previous status for stock adjustment
      const previousStatus = existingOrder.status;

      // Update the order using entityService instead of service
      const response = await strapi.entityService.update('api::order.order', id, { 
        data: updateData,
        populate: ['vendor', 'user', 'products']
      });
      
      console.log('✅ Order update response:', response ? 'Success' : 'Null');

      // Handle stock restoration for cancelled orders
      if (data.status === 'cancelled' && previousStatus !== 'cancelled') {
        try {
          // Build line items from order
          const lineItems = Array.isArray(existingOrder.orderItems) && existingOrder.orderItems.length > 0
            ? existingOrder.orderItems.map((item) => ({ productId: item.productId || item.product, quantity: parseInt(item.quantity, 10) || 1 }))
            : (Array.isArray(existingOrder.products) ? existingOrder.products.map((p) => ({ productId: p.id || p, quantity: 1 })) : []);

          // Restore stock for cancelled order
          for (const item of lineItems) {
            if (!item.productId) continue;
            const product = await strapi.entityService.findOne('api::product.product', item.productId, { fields: ['stock'] });
            if (!product) continue;
            const currentStock = parseInt(product.stock, 10) || 0;
            const restored = currentStock + (parseInt(item.quantity, 10) || 0);
            await strapi.entityService.update('api::product.product', item.productId, { data: { stock: restored } });
          }
          console.log('✅ Stock restored due to order cancellation');
        } catch (stockAdjustError) {
          console.error('⚠️ Error adjusting stock:', stockAdjustError);
          // Don't fail the cancellation if stock adjustment fails
        }
      }

      console.log('🔍 About to return transformed response');
      const transformedResponse = this.transformResponse(response);
      console.log('✅ Transformed response:', transformedResponse ? 'Success' : 'Null');
      
      return transformedResponse;
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



  async findOneWithInvoice(ctx) {
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

  // Customer cancel order
  async cancelOrder(ctx) {
    try {
      const { id } = ctx.params;
      const { reason } = ctx.request.body;
      
      console.log('🔍 cancelOrder called with:', { id, reason });
      console.log('🔍 User:', ctx.state.user?.id, ctx.state.user?.role?.name);
      
      // Check if user is authenticated
      if (!ctx.state.user) {
        console.log('❌ Access denied - not authenticated');
        return ctx.unauthorized('You must be logged in to cancel orders');
      }

      // Get the order
      let order = await strapi.entityService.findOne('api::order.order', id, {
        populate: ['vendor', 'user', 'products']
      });

      if (!order) {
        console.log('❌ Order not found');
        return ctx.notFound('Order not found');
      }

      // Check if user owns this order
      if (order.user && order.user.id !== ctx.state.user.id) {
        console.log('❌ User does not own this order');
        return ctx.forbidden('You can only cancel your own orders');
      }

      // Check if order can be cancelled
      const cancellableStatuses = ['pending', 'confirmed'];
      if (!cancellableStatuses.includes(order.status)) {
        console.log('❌ Order cannot be cancelled - status:', order.status);
        return ctx.badRequest(`Orders with status "${order.status}" cannot be cancelled`);
      }

      const previousStatus = order.status;

      // Update the order status to cancelled
      console.log('🔧 Cancelling order with ID:', order.id);
      const updatedOrder = await strapi.entityService.update('api::order.order', order.id, {
        data: { 
          status: 'cancelled',
          statusReason: reason || 'Cancelled by customer',
          statusUpdatedAt: new Date(),
          notes: order.notes ? `${order.notes}\nOrder cancelled by customer on ${new Date().toLocaleString()}. ${reason || 'No reason provided'}` : `Order cancelled by customer on ${new Date().toLocaleString()}. ${reason || 'No reason provided'}`
        },
        populate: ['vendor', 'user', 'products']
      });
      
      console.log('✅ Order cancelled successfully:', updatedOrder.id, updatedOrder.status);

      // Restore stock since order is cancelled
      try {
        // Build line items from order
        const lineItems = Array.isArray(order.orderItems) && order.orderItems.length > 0
          ? order.orderItems.map((item) => ({ productId: item.productId || item.product, quantity: parseInt(item.quantity, 10) || 1 }))
          : (Array.isArray(order.products) ? order.products.map((p) => ({ productId: p.id || p, quantity: 1 })) : []);

        // Restore stock for cancelled order
        for (const item of lineItems) {
          if (!item.productId) continue;
          const product = await strapi.entityService.findOne('api::product.product', item.productId, { fields: ['stock'] });
          if (!product) continue;
          const currentStock = parseInt(product.stock, 10) || 0;
          const restored = currentStock + (parseInt(item.quantity, 10) || 0);
          await strapi.entityService.update('api::product.product', item.productId, { data: { stock: restored } });
        }
        console.log('✅ Stock restored due to order cancellation');
      } catch (stockAdjustError) {
        console.error('⚠️ Error adjusting stock:', stockAdjustError);
        // Don't fail the cancellation if stock adjustment fails
      }

      return {
        success: true,
        message: 'Order cancelled successfully',
        data: updatedOrder
      };

    } catch (error) {
      console.error('❌ Error cancelling order:', error);
      return ctx.internalServerError('Failed to cancel order');
    }
  },
})); 