module.exports = {
  publicPath: "./",
  configureWebpack: {
    resolve: {
      fallback: {
        "crypto": require.resolve("crypto-browserify")
      }
    },
    optimization: {
      splitChunks: {
        minSize: 10000,
        maxSize: 250000,
      },
    },
  },
};
