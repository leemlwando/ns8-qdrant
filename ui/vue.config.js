module.exports = {
  publicPath: "./",
  configureWebpack: {
    optimization: {
      splitChunks: {
        minSize: 10000,
        maxSize: 250000,
      },
    },
  },
  chainWebpack: (config) => {
    config.module
      .rule("images")
      .use("url-loader")
      .loader("url-loader")
      .tap((options) => {
        // Ensure options object exists
        if (!options) {
          options = {};
        }
        // Do not base64 encode images URLs. Needed to always generate module logo image
        options.limit = -1;
        return options;
      });
  },
  css: {
    loaderOptions: {
      sass: {
        sassOptions: {
          quietDeps: true, // Silences deprecation warnings from dependencies
        },
      },
    },
  },
};
