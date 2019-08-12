const env = require("./env")

module.exports = {
  appName: env.APP_NAME,
  isProduction: env.isProduction,
  logLevel: env.LOG_LEVEL,
  port: env.PORT,
  secret: env.JWT_SECRET,
  assetsDir: env.ASSETS_DIRECTORY,
  connectionString: [
    "mongodb://",
    env.DB_HOST,
    env.DB_PASSWORD ? `:${env.DB_PASSWORD}:` : ":",
    env.DB_PORT,
    "/auth"
  ].join("")
}
