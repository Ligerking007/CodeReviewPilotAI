const appJson = require("./app.json");

const config = appJson.expo;
const baseUrl = process.env.EXPO_BASE_URL?.trim().replace(/\/+$/, "");

module.exports = {
  ...config,
  ...(baseUrl
    ? {
        experiments: {
          ...(config.experiments ?? {}),
          baseUrl,
        },
      }
    : {}),
};
