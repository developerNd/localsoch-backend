'use strict';

/**
 * analytics controller
 */

module.exports = ({ strapi }) => ({
  async getDashboardStats(ctx) {
    try {
      // Get total orders
      const totalOrders = await strapi.entityService.findMany('api::order.order', {
        fields: ['id'],
      });

      // Get total products
      const totalProducts = await strapi.entityService.findMany('api::product.product', {
        fields: ['id'],
      });

      // Get total vendors
      const totalVendors = await strapi.entityService.findMany('api::vendor.vendor', {
        fields: ['id'],
      });

      // Calculate total revenue from orders
      const orders = await strapi.entityService.findMany('api::order.order', {
        fields: ['totalAmount', 'status'],
        filters: {
          status: {
            $in: ['delivered', 'completed']
          }
        }
      });

      const totalRevenue = orders.reduce((sum, order) => {
        return sum + (parseFloat(order.totalAmount) || 0);
      }, 0);

      // Get recent orders for dashboard
      const recentOrders = await strapi.entityService.findMany('api::order.order', {
        fields: ['id', 'orderNumber', 'totalAmount', 'status', 'createdAt', 'customerName'],
        sort: { createdAt: 'desc' },
        limit: 5
      });

      // Get top sellers (vendors with most orders)
      const vendorOrders = await strapi.entityService.findMany('api::order.order', {
        fields: ['id', 'totalAmount'],
        populate: {
          vendor: {
            fields: ['id', 'name']
          }
        },
        filters: {
          status: {
            $in: ['delivered', 'completed']
          }
        }
      });

      // Group orders by vendor and calculate revenue
      const vendorStats = {};
      vendorOrders.forEach(order => {
        if (order.vendor) {
          const vendorId = order.vendor.id;
          if (!vendorStats[vendorId]) {
                      vendorStats[vendorId] = {
            id: vendorId,
            name: order.vendor.name,
            revenue: 0,
            orders: 0
          };
          }
          vendorStats[vendorId].revenue += parseFloat(order.totalAmount) || 0;
          vendorStats[vendorId].orders += 1;
        }
      });

      // Convert to array and sort by revenue
      const topSellers = Object.values(vendorStats)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      // Get top products (products with most sales)
      const productOrders = await strapi.entityService.findMany('api::order.order', {
        fields: ['id', 'orderItems'],
        filters: {
          status: {
            $in: ['delivered', 'completed']
          }
        }
      });

      // Group sales by product
      const productStats = {};
      productOrders.forEach(order => {
        if (order.orderItems && Array.isArray(order.orderItems)) {
          order.orderItems.forEach(item => {
            if (item.productId) {
              const productId = item.productId;
              if (!productStats[productId]) {
                productStats[productId] = {
                  id: productId,
                  name: item.productName || `Product ${productId}`,
                  sales: 0,
                  revenue: 0
                };
              }
              productStats[productId].sales += parseInt(item.quantity) || 0;
              productStats[productId].revenue += (parseFloat(item.price) * parseInt(item.quantity)) || 0;
            }
          });
        }
      });

      // Convert to array and sort by sales
      const topProducts = Object.values(productStats)
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 5);

      // Calculate average rating (placeholder - you can implement this based on your rating system)
      const averageRating = 4.5; // This would come from your rating/review system

      // Format recent orders for frontend
      const formattedRecentOrders = recentOrders.map(order => ({
        id: order.id,
        orderNumber: order.orderNumber,
        customer: order.customerName || 'Unknown',
        amount: parseFloat(order.totalAmount) || 0,
        status: order.status
      }));

      const analytics = {
        totalRevenue: Math.round(totalRevenue * 100) / 100, // Round to 2 decimal places
        totalOrders: totalOrders.length,
        totalProducts: totalProducts.length,
        totalSellers: totalVendors.length,
        averageRating,
        topSellers,
        topProducts,
        recentOrders: formattedRecentOrders,
        revenueChartData: [] // This would be populated with time-series data if needed
      };

      return ctx.send(analytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      return ctx.badRequest('Failed to fetch analytics data', { error: error.message });
    }
  }
}); 