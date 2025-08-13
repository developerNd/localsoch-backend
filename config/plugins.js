module.exports = () => ({
  upload: {
    config: {
      provider: 'local',
      sizeLimit: 10 * 1024 * 1024, // 10MB
    },
  },
});
