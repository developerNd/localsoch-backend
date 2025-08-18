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
    console.log('🔍 VENDOR CONTROLLER: find method called');
    console.log('🔍 VENDOR CONTROLLER: Query params:', ctx.query);
    
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

    // Handle location-based filtering
    if (ctx.query.filters && ctx.query.filters.location) {
      const locationFilter = ctx.query.filters.location;
      console.log('🔍 VENDOR CONTROLLER: Location filter received:', locationFilter);
      
      // Create an OR condition for location matching
      const locationConditions = [];
      
      // Filter by pincode (exact match)
      if (locationFilter.pincode) {
        console.log('🔍 VENDOR CONTROLLER: Adding pincode filter:', locationFilter.pincode);
        locationConditions.push({
          pincode: {
            $eq: locationFilter.pincode
          }
        });
      }
      
      // Filter by city (case-insensitive contains)
      if (locationFilter.city) {
        console.log('🔍 VENDOR CONTROLLER: Adding city filter:', locationFilter.city);
        locationConditions.push({
          city: {
            $containsi: locationFilter.city
          }
        });
      }
      
      // Filter by state (case-insensitive contains)
      if (locationFilter.state) {
        console.log('🔍 VENDOR CONTROLLER: Adding state filter:', locationFilter.state);
        locationConditions.push({
          state: {
            $containsi: locationFilter.state
          }
        });
      }
      
      // Apply OR condition if we have any location filters
      if (locationConditions.length > 0) {
        ctx.query.filters.$or = locationConditions;
        console.log('🔍 VENDOR CONTROLLER: Final OR filters:', ctx.query.filters.$or);
      }
      
      console.log('🔍 VENDOR CONTROLLER: Final filters:', ctx.query.filters);
      
      // Remove the location filter from query as we've processed it
      delete ctx.query.filters.location;
    }
    
    // Always ensure businessCategory is populated
    if (ctx.query.populate === '*' || ctx.query.populate?.includes('*')) {
      // For populate=*, we need to preserve all fields and add businessCategory
      ctx.query.populate = '*';
      // We'll handle businessCategory population in the response
    } else if (ctx.query.populate) {
      // If specific populate is requested, add businessCategory if not present
      const populateArray = Array.isArray(ctx.query.populate) ? ctx.query.populate : ctx.query.populate.split(',');
      if (!populateArray.includes('businessCategory')) {
        populateArray.push('businessCategory');
        ctx.query.populate = populateArray;
      }
    } else {
      // If no populate specified, add businessCategory
      ctx.query.populate = ['businessCategory'];
    }
    
    console.log('🔍 VENDOR CONTROLLER: Final query before super.find:', ctx.query);
    
    const { data, meta } = await super.find(ctx);
    
    // Manually populate businessCategory if it's not already populated
    if (data && data.length > 0) {
      for (const vendor of data) {
        if (!vendor.businessCategory) {
          try {
            // Get the business category for this vendor
            const businessCategoryLink = await strapi.db.query('api::vendor.vendor').findOne({
              where: { id: vendor.id },
              populate: ['businessCategory']
            });
            
            if (businessCategoryLink?.businessCategory) {
              vendor.businessCategory = businessCategoryLink.businessCategory;
            }
          } catch (error) {
            console.log('Error populating business category for vendor:', vendor.id, error.message);
          }
        }
      }
    }
    
    console.log('🔍 VENDOR CONTROLLER: Result from super.find:', {
      dataCount: data?.length || 0,
      firstVendor: data?.[0] ? {
        id: data[0].id,
        name: data[0].name,
        businessCategory: data[0].businessCategory
      } : null
    });
    
    return { data, meta };
  },

  async create(ctx) {
    try {
      console.log('🔍 Creating vendor with data:', ctx.request.body);
      
      const { data } = ctx.request.body;
      
      // Ensure user is authenticated
      if (!ctx.state.user) {
        return ctx.unauthorized('Authentication required');
      }
      
      // Check if user already has a vendor
      const existingVendor = await strapi.entityService.findMany('api::vendor.vendor', {
        filters: { user: ctx.state.user.id }
      });
      
      if (existingVendor && existingVendor.length > 0) {
        return ctx.badRequest('User already has a vendor profile');
      }
      
      // Create vendor with user association
      const vendorData = {
        ...data,
        user: ctx.state.user.id,
        isActive: data.isActive ?? true,
        isApproved: data.isApproved ?? false,
        status: data.status ?? 'pending'
      };
      
      // Handle business category relation
      if (data.businessCategory) {
        vendorData.businessCategory = data.businessCategory;
      }
      
      console.log('🔍 User ID from context:', ctx.state.user.id);
      console.log('🔍 Final vendor data:', vendorData);
      
      console.log('📝 Creating vendor with final data:', vendorData);
      
      const vendor = await strapi.entityService.create('api::vendor.vendor', {
        data: vendorData,
        populate: ['user', 'businessCategory']
      });
      
      console.log('✅ Vendor created successfully:', vendor.id);
      
      // Automatically update user role to seller after vendor creation
      try {
        console.log('🔄 Updating user role to seller...');
        await strapi.entityService.update('plugin::users-permissions.user', ctx.state.user.id, {
          data: {
            role: 3 // seller role ID
          }
        });
        console.log('✅ User role updated to seller successfully');
      } catch (roleError) {
        console.error('❌ Failed to update user role:', roleError);
        console.warn('⚠️ Vendor created but user role update failed');
      }
      
      return ctx.send({
        success: true,
        data: vendor
      });
      
    } catch (error) {
      console.error('❌ Error creating vendor:', error);
      return ctx.internalServerError('Failed to create vendor');
    }
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
        'businessCategory',
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
          role: 3 // seller role ID
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

  // Custom endpoint for post-payment registration
  async completeRegistration(ctx) {
    try {
      const { userId, vendorData } = ctx.request.body;
      
      // Verify the user exists
      const user = await strapi.entityService.findOne('plugin::users-permissions.user', userId);
      if (!user) {
        return ctx.badRequest('User not found');
      }

      // Update user role to seller
      await strapi.entityService.update('plugin::users-permissions.user', userId, {
        data: {
          role: 3 // Seller role ID
        }
      });

      // Create vendor profile
      const vendor = await strapi.entityService.create('api::vendor.vendor', {
        data: {
          ...vendorData,
          user: userId,
          isActive: true,
          isApproved: true
        }
      });

      return ctx.send({
        success: true,
        data: {
          user: { id: userId, role: 'seller' },
          vendor: vendor
        }
      });
    } catch (error) {
      console.error('Error in completeRegistration:', error);
      return ctx.internalServerError('Failed to complete registration');
    }
  },

  async update(ctx) {
    try {
      console.log('🔍 BACKEND: === VENDOR UPDATE METHOD CALLED ===');
      console.log('🔍 BACKEND: Request method:', ctx.request.method);
      console.log('🔍 BACKEND: Request URL:', ctx.request.url);
      console.log('🔍 BACKEND: Request headers:', ctx.request.headers);
      console.log('🔍 BACKEND: Request body (raw):', ctx.request.body);
      
      const { id } = ctx.params;
      const { trackClick, buttonType, userInfo, deviceInfo, location, ipAddress, userAgent } = ctx.request.body;
      
      console.log('🔍 BACKEND: Vendor ID from params:', id);
      console.log('🔍 BACKEND: trackClick:', trackClick);
      console.log('🔍 BACKEND: buttonType:', buttonType);
      console.log('🔍 BACKEND: userInfo (full):', JSON.stringify(userInfo, null, 2));
      console.log('🔍 BACKEND: deviceInfo (full):', JSON.stringify(deviceInfo, null, 2));
      console.log('🔍 BACKEND: location:', location);
      console.log('🔍 BACKEND: ipAddress:', ipAddress);
      console.log('🔍 BACKEND: userAgent:', userAgent);
      
      // Get IP address from request if not provided
      const clientIP = ipAddress || ctx.request.ip || ctx.request.connection.remoteAddress || 'unknown';
      console.log('🔍 BACKEND: Client IP address:', clientIP);
      
      // Get user agent from request if not provided
      const clientUserAgent = userAgent || ctx.request.headers['user-agent'] || 'unknown';
      console.log('🔍 BACKEND: Client User Agent:', clientUserAgent);

      // Handle button click tracking - allow without authentication
      if (trackClick && buttonType) {
        console.log('🔍 BACKEND: Processing button click tracking for vendor:', id);
        
        // Get current vendor with button clicks
        const vendor = await strapi.entityService.findOne('api::vendor.vendor', id, {
          populate: ['buttonClicks']
        });

        if (!vendor) {
          console.log('❌ BACKEND: Vendor not found with ID:', id);
          return ctx.notFound('Vendor not found');
        }

        console.log('✅ BACKEND: Vendor found:', vendor.name);

        const buttonClicks = vendor.buttonClicks || {
          messageClicks: 0,
          callClicks: 0,
          whatsappClicks: 0,
          emailClicks: 0,
          websiteClicks: 0,
          totalClicks: 0,
          lastUpdated: new Date()
        };

        console.log('🔍 BACKEND: Current button clicks before update:', buttonClicks);

        // Increment the specific button type
        switch (buttonType) {
          case 'message':
            buttonClicks.messageClicks++;
            console.log('🔍 BACKEND: Incrementing message clicks');
            break;
          case 'call':
            buttonClicks.callClicks++;
            console.log('🔍 BACKEND: Incrementing call clicks');
            break;
          case 'whatsapp':
            buttonClicks.whatsappClicks++;
            console.log('🔍 BACKEND: Incrementing whatsapp clicks');
            break;
          case 'email':
            buttonClicks.emailClicks++;
            console.log('🔍 BACKEND: Incrementing email clicks');
            break;
          case 'website':
            buttonClicks.websiteClicks++;
            console.log('🔍 BACKEND: Incrementing website clicks');
            break;
        }

        buttonClicks.totalClicks++;
        buttonClicks.lastUpdated = new Date();

        console.log('🔍 BACKEND: Updated button clicks:', buttonClicks);

        // Update vendor with new click counts
        console.log('🔍 BACKEND: Updating vendor with new button clicks...');
        await strapi.entityService.update('api::vendor.vendor', id, {
          data: {
            buttonClicks
          }
        });
        console.log('✅ BACKEND: Vendor updated successfully');

        // Log the click details to database
        const logEntry = {
          vendor: parseInt(id),
          buttonType,
          userInfo,
          deviceInfo,
          location,
          ipAddress: clientIP,
          userAgent: clientUserAgent,
          clickedAt: new Date()
        };

        console.log('🔍 BACKEND: Creating log entry (full):', JSON.stringify(logEntry, null, 2));
        console.log('🔍 BACKEND: Log entry vendor ID:', logEntry.vendor);
        console.log('🔍 BACKEND: Log entry buttonType:', logEntry.buttonType);
        console.log('🔍 BACKEND: Log entry userInfo:', JSON.stringify(logEntry.userInfo, null, 2));
        console.log('🔍 BACKEND: Log entry deviceInfo:', JSON.stringify(logEntry.deviceInfo, null, 2));

        try {
          // Save to database using the button-click-log service
          console.log('🔍 BACKEND: Saving to database using button-click-log service...');
          console.log('🔍 BACKEND: Log entry being passed to service (full):', JSON.stringify(logEntry, null, 2));
          
          const serviceResult = await strapi.service('api::button-click-log.button-click-log').logButtonClick(logEntry);
          console.log('✅ BACKEND: Button click logged to database successfully');
          console.log('✅ BACKEND: Service result (full):', JSON.stringify(serviceResult, null, 2));
        } catch (error) {
          console.error('❌ BACKEND: Error saving click log to database:', error);
          console.error('❌ BACKEND: Error details:', error.message);
          console.error('❌ BACKEND: Error stack:', error.stack);
        }

        console.log('✅ BACKEND: Button click logged successfully:', logEntry);

        console.log('✅ BACKEND: Button click tracking completed successfully');
        return ctx.send({
          success: true,
          message: 'Button click tracked successfully'
        });
      }

      // For non-button-click updates, require authentication
      if (!ctx.state.user) {
        return ctx.unauthorized('Authentication required for vendor updates');
      }

      // Check if user owns this vendor (for sellers)
      if (ctx.state.user.role && ctx.state.user.role.name === 'seller') {
        const vendor = await strapi.entityService.findOne('api::vendor.vendor', id, {
          populate: ['user']
        });
        
        if (!vendor || vendor.user.id !== ctx.state.user.id) {
          return ctx.forbidden('Access denied - you can only update your own vendor profile');
        }
      }

      // Handle file uploads for profile image
      console.log('🔍 Request body:', ctx.request.body);
      console.log('🔍 Request body data type:', typeof ctx.request.body.data);
      console.log('🔍 Request body data:', ctx.request.body.data);
      console.log('🔍 Request files:', ctx.request.files);
      
      let updateData;
      
      // Check if data is a string (from FormData) or object (from JSON)
      if (typeof ctx.request.body.data === 'string') {
        // Parse JSON string from FormData
        try {
          updateData = JSON.parse(ctx.request.body.data);
          console.log('🔍 Parsed updateData:', updateData);
        } catch (error) {
          console.error('Error parsing JSON data:', error);
          return ctx.badRequest('Invalid JSON data in request');
        }
      } else {
        // Data is already an object (from JSON request)
        updateData = { ...ctx.request.body.data };
        console.log('🔍 Object updateData:', updateData);
      }
      
      // If there are files in the request, handle profile image upload
      if (ctx.request.files && (ctx.request.files.profileImage || ctx.request.files['files.profileImage'])) {
        console.log('🔍 Processing file upload');
        const file = ctx.request.files.profileImage || ctx.request.files['files.profileImage'];
        console.log('🔍 File details:', {
          name: file.name,
          size: file.size,
          type: file.type
        });
        
        try {
          // Upload the file to Strapi media library
          const uploadedFile = await strapi.plugins.upload.services.upload.upload({
            data: {},
            files: file
          });
          
          console.log('🔍 Uploaded file result:', uploadedFile);
          
          if (uploadedFile && uploadedFile.length > 0) {
            // Set the profile image to the uploaded file
            updateData.profileImage = uploadedFile[0].id;
            console.log('🔍 Set profileImage to:', uploadedFile[0].id);
          } else {
            console.error('🔍 No file uploaded - uploadedFile is empty');
          }
        } catch (uploadError) {
          console.error('🔍 File upload error:', uploadError);
          console.error('🔍 Upload error details:', uploadError.message);
          // Continue without the image if upload fails
        }
      } else {
        console.log('🔍 No files in request or no profileImage file');
      }

      console.log('🔍 Final updateData:', updateData);
      
      // Handle business category relationship
      if (updateData.businessCategoryId) {
        updateData.businessCategory = updateData.businessCategoryId;
        delete updateData.businessCategoryId;
        console.log('🔍 Converted businessCategoryId to businessCategory:', updateData.businessCategory);
      }
      
      // Update the vendor
      const updatedVendor = await strapi.entityService.update('api::vendor.vendor', id, {
        data: updateData,
        populate: ['user', 'profileImage', 'buttonConfig', 'buttonClicks', 'businessCategory']
      });

      console.log('🔍 Updated vendor result:', updatedVendor);
      console.log('🔍 Updated vendor profileImage:', updatedVendor.profileImage);

      return ctx.send({
        success: true,
        message: 'Vendor profile updated successfully',
        data: updatedVendor
      });
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

      console.log('🔍 BACKEND: Button click tracking request received');
      console.log('🔍 BACKEND: Vendor ID:', id);
      console.log('🔍 BACKEND: Button type:', buttonType);
      console.log('🔍 BACKEND: User info:', userInfo);
      console.log('🔍 BACKEND: Device info:', deviceInfo);
      console.log('🔍 BACKEND: Location:', location);
      console.log('🔍 BACKEND: IP Address:', ipAddress);
      console.log('🔍 BACKEND: User Agent:', userAgent);
      
      // Get current vendor with button clicks
      const vendor = await strapi.entityService.findOne('api::vendor.vendor', id, {
        populate: ['buttonClicks']
      });

      if (!vendor) {
        console.log('❌ BACKEND: Vendor not found with ID:', id);
        return ctx.notFound('Vendor not found');
      }

      console.log('✅ BACKEND: Vendor found:', vendor.name);

      const buttonClicks = vendor.buttonClicks || {
        messageClicks: 0,
        callClicks: 0,
        whatsappClicks: 0,
        emailClicks: 0,
        websiteClicks: 0,
        totalClicks: 0,
        lastUpdated: new Date()
      };

      console.log('🔍 BACKEND: Current button clicks before update:', buttonClicks);

      // Increment the specific button type
      switch (buttonType) {
        case 'message':
          buttonClicks.messageClicks++;
          console.log('🔍 BACKEND: Incrementing message clicks');
          break;
        case 'call':
          buttonClicks.callClicks++;
          console.log('🔍 BACKEND: Incrementing call clicks');
          break;
        case 'whatsapp':
          buttonClicks.whatsappClicks++;
          console.log('🔍 BACKEND: Incrementing whatsapp clicks');
          break;
        case 'email':
          buttonClicks.emailClicks++;
          console.log('🔍 BACKEND: Incrementing email clicks');
          break;
        case 'website':
          buttonClicks.websiteClicks++;
          console.log('🔍 BACKEND: Incrementing website clicks');
          break;
      }

      buttonClicks.totalClicks++;
      buttonClicks.lastUpdated = new Date();

      console.log('🔍 BACKEND: Updated button clicks:', buttonClicks);

      // Update vendor with new click counts
      console.log('🔍 BACKEND: Updating vendor with new button clicks...');
      await strapi.entityService.update('api::vendor.vendor', id, {
        data: {
          buttonClicks
        }
      });
      console.log('✅ BACKEND: Vendor updated successfully');

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

      console.log('🔍 BACKEND: Creating log entry:', logEntry);

      try {
        const logsPath = path.join(__dirname, '../../../data/button-click-logs.json');
        console.log('🔍 BACKEND: Saving to log file:', logsPath);
        const logsData = await fs.readFile(logsPath, 'utf8');
        const logs = JSON.parse(logsData);
        logs.logs.push(logEntry);
        await fs.writeFile(logsPath, JSON.stringify(logs, null, 2));
        console.log('✅ BACKEND: Click log saved to file successfully');
      } catch (error) {
        console.error('❌ BACKEND: Error saving click log to file:', error);
      }

      console.log('✅ BACKEND: Button click logged successfully:', logEntry);

      console.log('✅ BACKEND: Button click tracking completed successfully');
      return ctx.send({
        success: true,
        message: 'Button click tracked successfully'
      });
    } catch (error) {
      console.error('❌ BACKEND: Error tracking button click:', error);
      return ctx.internalServerError('Failed to track button click');
    }
  },

  // Get button analytics for a vendor
  async getButtonAnalytics(ctx) {
    try {
      const { id } = ctx.params;
      const { startDate, endDate } = ctx.query;
      
      if (!id) {
        return ctx.badRequest('vendorId is required');
      }

      // Check if user is seller and owns this vendor
      if (ctx.state.user && ctx.state.user.role && ctx.state.user.role.name === 'seller') {
        const vendor = await strapi.entityService.findOne('api::vendor.vendor', id, {
          populate: ['user']
        });
        
        if (!vendor || vendor.user.id !== ctx.state.user.id) {
          return ctx.forbidden('Access denied');
        }
      }

      // Get analytics using the button-click-log service
      const analytics = await strapi.service('api::button-click-log.button-click-log').getVendorAnalytics(id, {
        startDate,
        endDate
      });

      return ctx.send({
        success: true,
        data: analytics
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
      } else if (!ctx.state.user) {
        // For testing purposes, allow access without authentication
        console.log('🔍 BACKEND: No user authenticated, allowing access for testing');
      }

      // Get button click logs from database using entity service directly
      const logs = await strapi.entityService.findMany('api::button-click-log.button-click-log', {
        filters: { vendor: id },
        sort: { clickedAt: 'desc' },
        pagination: {
          page: parseInt(page),
          pageSize: parseInt(pageSize)
        },
        populate: ['userInfo', 'deviceInfo', 'vendor']
      });

      console.log('🔍 BACKEND: Button click logs fetched:', logs.length);
      console.log('🔍 BACKEND: First log sample:', logs[0]);

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
  },

  // Admin method to approve/reject vendors
  async updateVendorStatus(ctx) {
    try {
      const { id } = ctx.params;
      const { status, reason } = ctx.request.body;

      console.log('🔍 updateVendorStatus called with:', { id, status, reason });
      console.log('🔍 Status type:', typeof status);
      console.log('🔍 Status value:', JSON.stringify(status));
      console.log('🔍 User:', ctx.state.user?.id, ctx.state.user?.role?.name);

      // Check if user is admin
      if (!ctx.state.user || ctx.state.user.role?.name !== 'admin') {
        console.log('❌ Access denied - not an admin');
        return ctx.forbidden('Admin access required');
      }

      // Validate status value
      const validStatuses = ['pending', 'approved', 'rejected', 'suspended'];
      if (!validStatuses.includes(status)) {
        console.log('❌ Invalid status value:', status);
        return ctx.badRequest(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
      }

      // Get vendor with user
      const vendor = await strapi.entityService.findOne('api::vendor.vendor', id, {
        populate: ['user']
      });

      if (!vendor) {
        console.log('❌ Vendor not found');
        return ctx.notFound('Vendor not found');
      }

      console.log('🔍 Found vendor:', vendor.id, vendor.name, 'User:', vendor.user?.id);

      // Update vendor status and isApproved
      const updateData = {
        status: status,
        statusReason: reason,
        statusUpdatedAt: new Date()
      };

      // Also update isApproved based on status
      if (status === 'approved') {
        updateData.isApproved = true;
      } else if (status === 'rejected' || status === 'suspended') {
        updateData.isApproved = false;
      }
      // For 'pending' status, keep isApproved as is

      console.log('🔍 Updating vendor with data:', updateData);

      const updatedVendor = await strapi.entityService.update('api::vendor.vendor', id, {
        data: updateData
      });

      console.log('✅ Vendor status updated:', updatedVendor.status);
      console.log('✅ Vendor isApproved updated:', updatedVendor.isApproved);

      // If vendor is approved, update user role to seller
      if (status === 'approved' && vendor.user) {
        console.log('🔧 Updating user role to seller for user:', vendor.user.id);
        await strapi.entityService.update('plugin::users-permissions.user', vendor.user.id, {
          role: 3 // seller role ID
        });
        console.log('✅ User role updated to seller');
      }

      // If vendor is rejected, update user role to seller_pending
      if (status === 'rejected' && vendor.user) {
        console.log('🔧 Updating user role to seller_pending for user:', vendor.user.id);
        await strapi.entityService.update('plugin::users-permissions.user', vendor.user.id, {
          role: 3 // seller_pending role ID
        });
        console.log('✅ User role updated to seller_pending');
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
      console.log('🔍 getVendorStats called by user:', ctx.state.user?.id, ctx.state.user?.role?.name);

      // Check if user is admin
      if (!ctx.state.user || ctx.state.user.role?.name !== 'admin') {
        console.log('❌ Access denied - not an admin');
        return ctx.forbidden('Admin access required');
      }

      // Get all vendors with user data
      const vendors = await strapi.entityService.findMany('api::vendor.vendor', {
        populate: ['user', 'products']
      });

      // Calculate statistics
      const totalVendors = vendors.length;
      const activeVendors = vendors.filter(v => v.products && v.products.length > 0).length;
      const pendingVendors = vendors.filter(v => v.status === 'pending' || !v.status).length;
      const approvedVendors = vendors.filter(v => v.status === 'approved').length;
      const rejectedVendors = vendors.filter(v => v.status === 'rejected').length;

      console.log('📊 Vendor stats:', { totalVendors, activeVendors, pendingVendors, approvedVendors, rejectedVendors });

      return ctx.send({
        success: true,
        data: {
          totalVendors,
          activeVendors,
          pendingVendors,
          approvedVendors,
          rejectedVendors
        }
      });
    } catch (error) {
      console.error('Error getting vendor stats:', error);
      return ctx.internalServerError('Failed to get vendor statistics');
    }
  },

  // Admin method to get all vendors with user details
  async findAllForAdmin(ctx) {
    try {
      console.log('🔍 findAllForAdmin called by user:', ctx.state.user?.id, ctx.state.user?.role?.name);

      // Check if user is admin
      if (!ctx.state.user || ctx.state.user.role?.name !== 'admin') {
        console.log('❌ Access denied - not an admin');
        return ctx.forbidden('Admin access required');
      }

      // Get all vendors with user and product data
      const vendors = await strapi.entityService.findMany('api::vendor.vendor', {
        populate: ['user', 'products', 'profileImage']
      });

      console.log('📊 Found vendors:', vendors.length);

      return ctx.send({
        success: true,
        data: vendors
      });
    } catch (error) {
      console.error('Error getting vendors for admin:', error);
      return ctx.internalServerError('Failed to get vendors');
    }
  }
})); 