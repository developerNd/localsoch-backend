// @ts-nocheck
'use strict';

/**
 *  vendor controller
 */

const { createCoreController } = require('@strapi/strapi').factories;
const fs = require('fs').promises;
const path = require('path');

module.exports = createCoreController('api::vendor.vendor', ({ strapi }) => ({
  async find(ctx) {
    // Check if this is an admin stats request
    if (ctx.query.admin === 'stats' && ctx.state.user?.role?.name === 'admin') {
      return await this.getVendorStats(ctx);
    }
    
    // Check if this is an admin all request
    if (ctx.query.admin === 'all' && ctx.state.user?.role?.name === 'admin') {
      return await this.findAllForAdmin(ctx);
    }
    
    // If user is seller, only return their own vendor
    if (ctx.state.user && ctx.state.user.role && ctx.state.user.role.name === 'seller') {
      console.log('🔍 Seller accessing vendors, filtering by user ID:', ctx.state.user.id);
      ctx.query.filters = {
        ...ctx.query.filters,
        user: ctx.state.user.id
      };
    }
    
    // For admin, allow additional filtering and population
    if (ctx.state.user && ctx.state.user.role && ctx.state.user.role.name === 'admin') {
      // Ensure we populate user data for admin
      if (!ctx.query.populate) {
        ctx.query.populate = ['user', 'products', 'buttonClicks'];
      } else if (!ctx.query.populate.includes('user')) {
        ctx.query.populate = [...ctx.query.populate.split(','), 'user', 'products', 'buttonClicks'];
      }
    }
    
    const { data, meta } = await super.find(ctx);
    return { data, meta };
  },

  async findOne(ctx) {
    // Check if this is a request for button analytics - allow public access
    if (ctx.query.analytics === 'true') {
      const vendor = await strapi.entityService.findOne('api::vendor.vendor', ctx.params.id, {
        populate: ['buttonClicks']
      });

      if (!vendor) {
        return ctx.notFound('Vendor not found');
      }

      return ctx.send({
        success: true,
        data: {
          totalClicks: vendor.buttonClicks?.totalClicks || 0,
          buttonClicks: vendor.buttonClicks || {},
          lastUpdated: vendor.buttonClicks?.lastUpdated
        }
      });
    }

    // For non-analytics requests, require authentication
    // If user is seller, check if they own this vendor
    if (ctx.state.user && ctx.state.user.role && ctx.state.user.role.name === 'seller') {
      const vendor = await strapi.entityService.findOne('api::vendor.vendor', ctx.params.id, {
        populate: ['user']
      });
      
      if (!vendor || vendor.user.id !== ctx.state.user.id) {
        return ctx.forbidden('Access denied');
      }
    }
    
    // Get vendor with button configuration and analytics
    const vendor = await strapi.entityService.findOne('api::vendor.vendor', ctx.params.id, {
      populate: [
        'user',
        'buttonConfig',
        'buttonClicks',
        'profileImage',
        'products',
        'products.image',
        'products.category'
      ]
    });

    if (!vendor) {
      return ctx.notFound('Vendor not found');
    }

    return ctx.send({
      success: true,
      data: vendor
    });
  },

  // Admin-specific method to get all vendors with user details
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
      const populate = ['user', 'products', 'buttonClicks', 'profileImage'];
      
      // Get vendors
      const vendors = await strapi.entityService.findMany('api::vendor.vendor', {
        filters,
        populate,
        ...query
      });

      // Get user details for each vendor
      const vendorsWithUsers = await Promise.all(
        vendors.map(async (vendor) => {
          if (vendor.user) {
            const user = await strapi.entityService.findOne('plugin::users-permissions.user', vendor.user.id, {
              populate: ['role']
            });
            return {
              ...vendor,
              user: user
            };
          }
          return vendor;
        })
      );

      return ctx.send({
        success: true,
        data: vendorsWithUsers,
        meta: {
          pagination: {
            page: query.pagination?.page || 1,
            pageSize: query.pagination?.pageSize || 25,
            pageCount: Math.ceil(vendorsWithUsers.length / (query.pagination?.pageSize || 25)),
            total: vendorsWithUsers.length
          }
        }
      });
    } catch (error) {
      console.error('Error getting vendors for admin:', error);
      return ctx.internalServerError('Failed to get vendors');
    }
  },

  // Admin method to approve/reject vendors
  async updateVendorStatus(ctx) {
    try {
      const { id } = ctx.params;
      const { status, reason } = ctx.request.body;

      // Check if user is admin
      if (!ctx.state.user || ctx.state.user.role?.name !== 'admin') {
        return ctx.forbidden('Admin access required');
      }

      // Get vendor with user
      const vendor = await strapi.entityService.findOne('api::vendor.vendor', id, {
        populate: ['user']
      });

      if (!vendor) {
        return ctx.notFound('Vendor not found');
      }

      // Update vendor status
      const updatedVendor = await strapi.entityService.update('api::vendor.vendor', id, {
        data: {
          status: status,
          statusReason: reason,
          statusUpdatedAt: new Date()
        }
      });

      // If vendor is approved, update user role to seller
      if (status === 'approved' && vendor.user) {
        await strapi.entityService.update('plugin::users-permissions.user', vendor.user.id, {
          role: 2 // seller role ID
        });
      }

      // If vendor is rejected, update user role to seller_pending
      if (status === 'rejected' && vendor.user) {
        await strapi.entityService.update('plugin::users-permissions.user', vendor.user.id, {
          role: 3 // seller_pending role ID
        });
      }

      return ctx.send({
        success: true,
        message: `Vendor ${status} successfully`,
        data: updatedVendor
      });
    } catch (error) {
      console.error('Error updating vendor status:', error);
      return ctx.internalServerError('Failed to update vendor status');
    }
  },

  // Admin method to get vendor statistics
  async getVendorStats(ctx) {
    try {
      // Check if user is admin
      if (!ctx.state.user || ctx.state.user.role?.name !== 'admin') {
        return ctx.forbidden('Admin access required');
      }

      // Get all vendors
      const vendors = await strapi.entityService.findMany('api::vendor.vendor', {
        populate: ['user', 'products']
      });

      // Get all products
      const products = await strapi.entityService.findMany('api::product.product', {
        populate: ['vendor']
      });

      // Calculate statistics
      const totalVendors = vendors.length;
      const activeVendors = vendors.filter(v => v.products && v.products.length > 0).length;
      const pendingVendors = vendors.filter(v => v.status === 'pending').length;
      const approvedVendors = vendors.filter(v => v.status === 'approved').length;
      const rejectedVendors = vendors.filter(v => v.status === 'rejected').length;

      const totalProducts = products.length;
      const productsByVendor = vendors.map(vendor => ({
        vendorId: vendor.id,
        vendorName: vendor.name,
        productCount: products.filter(p => p.vendor?.id === vendor.id).length
      }));

      return ctx.send({
        success: true,
        data: {
          totalVendors,
          activeVendors,
          pendingVendors,
          approvedVendors,
          rejectedVendors,
          totalProducts,
          productsByVendor
        }
      });
    } catch (error) {
      console.error('Error getting vendor stats:', error);
      return ctx.internalServerError('Failed to get vendor statistics');
    }
  },

  async create(ctx) {
    // If user is seller, automatically assign them as the user
    if (ctx.state.user && ctx.state.user.role && ctx.state.user.role.name === 'seller') {
      ctx.request.body.data = {
        ...ctx.request.body.data,
        user: ctx.state.user.id
      };
    }
    
    const { data, meta } = await super.create(ctx);
    return { data, meta };
  },

  async update(ctx) {
    try {
      console.log('=== VENDOR UPDATE METHOD CALLED ===');
      const { id } = ctx.params;
      const { trackClick, buttonType, userInfo, deviceInfo, location, ipAddress, userAgent } = ctx.request.body;
      console.log('Request body:', { trackClick, buttonType, userInfo, deviceInfo, location, ipAddress, userAgent });

      // Handle button click tracking - allow without authentication
      if (trackClick && buttonType) {
        console.log('Processing button click tracking for vendor:', id);
        
        // Get current vendor with button clicks
        const vendor = await strapi.entityService.findOne('api::vendor.vendor', id, {
          populate: ['buttonClicks']
        });

        if (!vendor) {
          return ctx.notFound('Vendor not found');
        }

        const buttonClicks = vendor.buttonClicks || {
          messageClicks: 0,
          callClicks: 0,
          whatsappClicks: 0,
          emailClicks: 0,
          websiteClicks: 0,
          totalClicks: 0,
          lastUpdated: new Date()
        };

        // Increment the specific button type
        switch (buttonType) {
          case 'message':
            buttonClicks.messageClicks++;
            break;
          case 'call':
            buttonClicks.callClicks++;
            break;
          case 'whatsapp':
            buttonClicks.whatsappClicks++;
            break;
          case 'email':
            buttonClicks.emailClicks++;
            break;
          case 'website':
            buttonClicks.websiteClicks++;
            break;
        }

        buttonClicks.totalClicks++;
        buttonClicks.lastUpdated = new Date();

        // Update vendor with new click counts
        await strapi.entityService.update('api::vendor.vendor', id, {
          data: {
            buttonClicks
          }
        });

        // Log the click details to database
        const logEntry = {
          vendor: parseInt(id),
          buttonType,
          userInfo,
          deviceInfo,
          location,
          ipAddress,
          userAgent,
          clickedAt: new Date()
        };

        try {
          // Save to database using the button-click-log content type
          await strapi.entityService.create('api::button-click-log.button-click-log', {
            data: logEntry
          });
          console.log('Button click logged to database:', logEntry);
        } catch (error) {
          console.error('Error saving click log to database:', error);
          console.error('Error details:', error.message);
        }

        console.log('Button click logged:', logEntry);

        return ctx.send({
          success: true,
          message: 'Button click tracked successfully'
        });
      }

      // For non-button-click updates, require authentication
      if (!ctx.state.user) {
        return ctx.unauthorized('Authentication required for vendor updates');
      }

      // Handle regular vendor updates
      const result = await super.update(ctx);
      return result;
    } catch (error) {
      console.error('Error in vendor update:', error);
      return ctx.internalServerError('Failed to update vendor');
    }
  },

  async delete(ctx) {
    // If user is seller, check if they own this vendor
    if (ctx.state.user && ctx.state.user.role && ctx.state.user.role.name === 'seller') {
      const vendor = await strapi.entityService.findOne('api::vendor.vendor', ctx.params.id, {
        populate: ['user']
      });
      
      if (!vendor || vendor.user.id !== ctx.state.user.id) {
        return ctx.forbidden('Access denied');
      }
    }
    
    const { data, meta } = await super.delete(ctx);
    return { data, meta };
  },

  // Get vendor with button configuration and analytics
  async getWithButtons(ctx) {
    try {
      const { id } = ctx.params;
      
      const vendor = await strapi.entityService.findOne('api::vendor.vendor', id, {
        populate: [
          'buttonConfig',
          'buttonClicks',
          'profileImage',
          'products',
          'products.image',
          'products.category'
        ]
      });

      if (!vendor) {
        return ctx.notFound('Vendor not found');
      }

      // If user is seller, check if they own this vendor
      if (ctx.state.user && ctx.state.user.role && ctx.state.user.role.name === 'seller') {
        if (vendor.user.id !== ctx.state.user.id) {
          return ctx.forbidden('Access denied');
        }
      }

      return ctx.send({
        success: true,
        data: vendor
      });

    } catch (error) {
      console.error('Error getting vendor with buttons:', error);
      return ctx.internalServerError('Failed to get vendor data');
    }
  },

  // Update button configuration
  async updateButtonConfig(ctx) {
    try {
      const { id } = ctx.params;
      const { buttonConfig } = ctx.request.body;

      // Check if user owns this vendor
      const vendor = await strapi.entityService.findOne('api::vendor.vendor', id, {
        populate: ['user']
      });

      if (!vendor) {
        return ctx.notFound('Vendor not found');
      }

      if (ctx.state.user && ctx.state.user.role && ctx.state.user.role.name === 'seller') {
        if (vendor.user.id !== ctx.state.user.id) {
          return ctx.forbidden('Access denied');
        }
      }

      // Update vendor with new button configuration
      const updatedVendor = await strapi.entityService.update('api::vendor.vendor', id, {
        data: {
          buttonConfig
        }
      });

      return ctx.send({
        success: true,
        message: 'Button configuration updated successfully',
        data: updatedVendor
      });

    } catch (error) {
      console.error('Error updating button config:', error);
      return ctx.internalServerError('Failed to update button configuration');
    }
  },

  // Track button click without authentication
  async trackButtonClick(ctx) {
    try {
      const { id } = ctx.params;
      const { buttonType, userInfo, deviceInfo, location, ipAddress, userAgent } = ctx.request.body;

      console.log('Processing button click tracking for vendor:', id);
      
      // Get current vendor with button clicks
      const vendor = await strapi.entityService.findOne('api::vendor.vendor', id, {
        populate: ['buttonClicks']
      });

      if (!vendor) {
        return ctx.notFound('Vendor not found');
      }

      const buttonClicks = vendor.buttonClicks || {
        messageClicks: 0,
        callClicks: 0,
        whatsappClicks: 0,
        emailClicks: 0,
        websiteClicks: 0,
        totalClicks: 0,
        lastUpdated: new Date()
      };

      // Increment the specific button type
      switch (buttonType) {
        case 'message':
          buttonClicks.messageClicks++;
          break;
        case 'call':
          buttonClicks.callClicks++;
          break;
        case 'whatsapp':
          buttonClicks.whatsappClicks++;
          break;
        case 'email':
          buttonClicks.emailClicks++;
          break;
        case 'website':
          buttonClicks.websiteClicks++;
          break;
      }

      buttonClicks.totalClicks++;
      buttonClicks.lastUpdated = new Date();

      // Update vendor with new click counts
      await strapi.entityService.update('api::vendor.vendor', id, {
        data: {
          buttonClicks
        }
      });

      // Log the click details to JSON file
      const logEntry = {
        id: Date.now(),
        vendorId: parseInt(id),
        buttonType,
        userInfo,
        deviceInfo,
        location,
        ipAddress,
        userAgent,
        clickedAt: new Date().toISOString()
      };

      try {
        const logsPath = path.join(__dirname, '../../../data/button-click-logs.json');
        const logsData = await fs.readFile(logsPath, 'utf8');
        const logs = JSON.parse(logsData);
        logs.logs.push(logEntry);
        await fs.writeFile(logsPath, JSON.stringify(logs, null, 2));
      } catch (error) {
        console.error('Error saving click log to file:', error);
      }

      console.log('Button click logged:', logEntry);

      return ctx.send({
        success: true,
        message: 'Button click tracked successfully'
      });
    } catch (error) {
      console.error('Error tracking button click:', error);
      return ctx.internalServerError('Failed to track button click');
    }
  },

  // Get button analytics for a vendor
  async getButtonAnalytics(ctx) {
    try {
      const { id } = ctx.params;
      
      if (!id) {
        return ctx.badRequest('vendorId is required');
      }

      // Get vendor with button clicks
      const vendor = await strapi.entityService.findOne('api::vendor.vendor', id, {
        populate: ['buttonClicks']
      });

      if (!vendor) {
        return ctx.notFound('Vendor not found');
      }

      // If user is seller, check if they own this vendor
      if (ctx.state.user && ctx.state.user.role && ctx.state.user.role.name === 'seller') {
        if (vendor.user.id !== ctx.state.user.id) {
          return ctx.forbidden('Access denied');
        }
      }

      return ctx.send({
        success: true,
        data: {
          totalClicks: vendor.buttonClicks?.totalClicks || 0,
          buttonClicks: vendor.buttonClicks || {},
          lastUpdated: vendor.buttonClicks?.lastUpdated
        }
      });

    } catch (error) {
      console.error('Error getting button analytics:', error);
      return ctx.internalServerError('Failed to get button analytics');
    }
  },

  // Get detailed button click logs for a vendor
  async getButtonClickLogs(ctx) {
    try {
      const { id } = ctx.params;
      const { page = 1, pageSize = 25 } = ctx.query;

      // Check if user is seller and owns this vendor
      if (ctx.state.user && ctx.state.user.role && ctx.state.user.role.name === 'seller') {
        const vendor = await strapi.entityService.findOne('api::vendor.vendor', id, {
          populate: ['user']
        });
        
        if (!vendor || vendor.user.id !== ctx.state.user.id) {
          return ctx.forbidden('Access denied');
        }
      }

      // Get button click logs from database
      const logs = await strapi.entityService.findMany('api::button-click-log.button-click-log', {
        filters: { vendor: id },
        sort: { clickedAt: 'desc' },
        pagination: {
          page: parseInt(page),
          pageSize: parseInt(pageSize)
        },
        populate: ['userInfo', 'deviceInfo']
      });

      return ctx.send({
        success: true,
        data: logs,
        meta: {
          pagination: {
            page: parseInt(page),
            pageSize: parseInt(pageSize),
            total: logs.length,
            pageCount: Math.ceil(logs.length / parseInt(pageSize))
          }
        }
      });
    } catch (error) {
      console.error('Error fetching button click logs:', error);
      return ctx.internalServerError('Failed to fetch button click logs');
    }
  }
})); 