import type { Schema, Struct } from '@strapi/strapi';

export interface DeviceDeviceInfo extends Struct.ComponentSchema {
  collectionName: 'components_device_device_infos';
  info: {
    description: 'Device information for button clicks';
    displayName: 'Device Info';
  };
  attributes: {
    appVersion: Schema.Attribute.String;
    deviceModel: Schema.Attribute.String;
    osVersion: Schema.Attribute.String;
    platform: Schema.Attribute.Enumeration<
      ['ios', 'android', 'web', 'unknown']
    >;
  };
}

export interface SharedMedia extends Struct.ComponentSchema {
  collectionName: 'components_shared_media';
  info: {
    displayName: 'Media';
    icon: 'file-video';
  };
  attributes: {
    file: Schema.Attribute.Media<'images' | 'files' | 'videos'>;
  };
}

export interface SharedQuote extends Struct.ComponentSchema {
  collectionName: 'components_shared_quotes';
  info: {
    displayName: 'Quote';
    icon: 'indent';
  };
  attributes: {
    body: Schema.Attribute.Text;
    title: Schema.Attribute.String;
  };
}

export interface SharedRichText extends Struct.ComponentSchema {
  collectionName: 'components_shared_rich_texts';
  info: {
    description: '';
    displayName: 'Rich text';
    icon: 'align-justify';
  };
  attributes: {
    body: Schema.Attribute.RichText;
  };
}

export interface SharedSeo extends Struct.ComponentSchema {
  collectionName: 'components_shared_seos';
  info: {
    description: '';
    displayName: 'Seo';
    icon: 'allergies';
    name: 'Seo';
  };
  attributes: {
    metaDescription: Schema.Attribute.Text & Schema.Attribute.Required;
    metaTitle: Schema.Attribute.String & Schema.Attribute.Required;
    shareImage: Schema.Attribute.Media<'images'>;
  };
}

export interface SharedSlider extends Struct.ComponentSchema {
  collectionName: 'components_shared_sliders';
  info: {
    description: '';
    displayName: 'Slider';
    icon: 'address-book';
  };
  attributes: {
    files: Schema.Attribute.Media<'images', true>;
  };
}

export interface UserUserInfo extends Struct.ComponentSchema {
  collectionName: 'components_user_user_infos';
  info: {
    description: 'User information for button clicks';
    displayName: 'User Info';
  };
  attributes: {
    email: Schema.Attribute.Email;
    isGuest: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    phone: Schema.Attribute.String;
    userId: Schema.Attribute.String;
  };
}

export interface VendorButtonClicks extends Struct.ComponentSchema {
  collectionName: 'components_vendor_button_clicks';
  info: {
    description: 'Track button click statistics';
    displayName: 'Button Clicks';
  };
  attributes: {
    callClicks: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    emailClicks: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    lastUpdated: Schema.Attribute.DateTime;
    messageClicks: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    totalClicks: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    websiteClicks: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    whatsappClicks: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
  };
}

export interface VendorButtonConfig extends Struct.ComponentSchema {
  collectionName: 'components_vendor_button_configs';
  info: {
    description: 'Configuration for vendor profile buttons';
    displayName: 'Button Config';
  };
  attributes: {
    callButton: Schema.Attribute.Component<'vendor.button-item', false>;
    emailButton: Schema.Attribute.Component<'vendor.button-item', false>;
    messageButton: Schema.Attribute.Component<'vendor.button-item', false>;
    websiteButton: Schema.Attribute.Component<'vendor.button-item', false>;
    whatsappButton: Schema.Attribute.Component<'vendor.button-item', false>;
  };
}

export interface VendorButtonItem extends Struct.ComponentSchema {
  collectionName: 'components_vendor_button_items';
  info: {
    description: 'Individual button configuration';
    displayName: 'Button Item';
  };
  attributes: {
    action: Schema.Attribute.Enumeration<
      ['message', 'call', 'whatsapp', 'email', 'website']
    > &
      Schema.Attribute.Required;
    color: Schema.Attribute.String & Schema.Attribute.DefaultTo<'primary'>;
    enabled: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<true>;
    icon: Schema.Attribute.String;
    label: Schema.Attribute.String & Schema.Attribute.Required;
    order: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    value: Schema.Attribute.String;
  };
}

export interface VendorDayHours extends Struct.ComponentSchema {
  collectionName: 'components_vendor_day_hours';
  info: {
    description: 'Business hours for a specific day';
    displayName: 'Day Hours';
  };
  attributes: {
    breakEnd: Schema.Attribute.Time;
    breakStart: Schema.Attribute.Time;
    closeTime: Schema.Attribute.Time;
    isOpen: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<true>;
    notes: Schema.Attribute.String;
    openTime: Schema.Attribute.Time;
  };
}

export interface VendorDeliveryFees extends Struct.ComponentSchema {
  collectionName: 'components_vendor_delivery_fees';
  info: {
    description: 'Delivery fee configuration based on distance and order value';
    displayName: 'Delivery Fees';
  };
  attributes: {
    baseDeliveryFee: Schema.Attribute.Decimal &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'0.00'>;
    deliveryRadius: Schema.Attribute.Decimal &
      Schema.Attribute.DefaultTo<'10.00'>;
    deliveryTime: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'1-2 hours'>;
    distanceBasedFees: Schema.Attribute.Component<'vendor.distance-fee', false>;
    freeDeliveryThreshold: Schema.Attribute.Decimal &
      Schema.Attribute.DefaultTo<'0.00'>;
    isDeliveryAvailable: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<true>;
    orderValueBasedFees: Schema.Attribute.Component<
      'vendor.order-value-fee',
      false
    >;
  };
}

export interface VendorDistanceFee extends Struct.ComponentSchema {
  collectionName: 'components_vendor_distance_fees';
  info: {
    description: 'Delivery fee based on distance range';
    displayName: 'Distance Fee';
  };
  attributes: {
    description: Schema.Attribute.String;
    fee: Schema.Attribute.Decimal & Schema.Attribute.Required;
    maxDistance: Schema.Attribute.Decimal & Schema.Attribute.Required;
    minDistance: Schema.Attribute.Decimal & Schema.Attribute.Required;
  };
}

export interface VendorOrderValueFee extends Struct.ComponentSchema {
  collectionName: 'components_vendor_order_value_fees';
  info: {
    description: 'Delivery fee based on order value range';
    displayName: 'Order Value Fee';
  };
  attributes: {
    description: Schema.Attribute.String;
    fee: Schema.Attribute.Decimal & Schema.Attribute.Required;
    maxOrderValue: Schema.Attribute.Decimal & Schema.Attribute.Required;
    minOrderValue: Schema.Attribute.Decimal & Schema.Attribute.Required;
  };
}

export interface VendorShopHours extends Struct.ComponentSchema {
  collectionName: 'components_vendor_shop_hours';
  info: {
    description: 'Shop business hours configuration for each day of the week';
    displayName: 'Shop Hours';
  };
  attributes: {
    friday: Schema.Attribute.Component<'vendor.day-hours', false>;
    monday: Schema.Attribute.Component<'vendor.day-hours', false>;
    saturday: Schema.Attribute.Component<'vendor.day-hours', false>;
    sunday: Schema.Attribute.Component<'vendor.day-hours', false>;
    thursday: Schema.Attribute.Component<'vendor.day-hours', false>;
    timezone: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Asia/Kolkata'>;
    tuesday: Schema.Attribute.Component<'vendor.day-hours', false>;
    wednesday: Schema.Attribute.Component<'vendor.day-hours', false>;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'device.device-info': DeviceDeviceInfo;
      'shared.media': SharedMedia;
      'shared.quote': SharedQuote;
      'shared.rich-text': SharedRichText;
      'shared.seo': SharedSeo;
      'shared.slider': SharedSlider;
      'user.user-info': UserUserInfo;
      'vendor.button-clicks': VendorButtonClicks;
      'vendor.button-config': VendorButtonConfig;
      'vendor.button-item': VendorButtonItem;
      'vendor.day-hours': VendorDayHours;
      'vendor.delivery-fees': VendorDeliveryFees;
      'vendor.distance-fee': VendorDistanceFee;
      'vendor.order-value-fee': VendorOrderValueFee;
      'vendor.shop-hours': VendorShopHours;
    }
  }
}
