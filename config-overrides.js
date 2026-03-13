module.exports = function override(config) {
  config.plugins = config.plugins.filter(
    (plugin) =>
      plugin.constructor &&
      plugin.constructor.name !== "ForkTsCheckerWebpackPlugin",
  );

  return config;
};
