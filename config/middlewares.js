module.exports = [
  'strapi::logger',
  'strapi::errors',
  'strapi::security',
  'strapi::cors',
  'strapi::poweredBy',
  'strapi::query',
  {
    name: 'strapi::body',
    config: {
      formLimit: '10mb',
      jsonLimit: '10mb',
      textLimit: '10mb',
      formidable: {
        maxFileSize: 10 * 1024 * 1024, // 10MB
        keepExtensions: true,
        uploadDir: './tmp',
      },
      multipart: true,
    },
  },
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
