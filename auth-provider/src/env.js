const envalid = require("envalid")

const { str, port } = envalid

module.exports = envalid.cleanEnv(process.env, {
  ASSETS_DIRECTORY: str({
    default: "./public",
    desc: "The directory where the images, stylesheets, and any other assets required for server-rendered views"
  }),
  APP_NAME: str({
    default: "auth-provider",
    desc: "The human-readable app name (will be used in logs)"
  }),
  DB_PASSWORD: str({
    desc: "The (required) password for connecting to the database instance (will be part of the connection string)"
  }),
  DB_PORT: port({
    default: 27017,
    example: 27017,
    desc: "The port number on which the database server is running"
  }),
  DB_HOST: str({
    default: "localhost",
    desc: "The base URL for the databse server"
  }),
  JWT_SECRET: str({
    desc: "The super secret value used to sign JWTs"
  }),
  LOG_LEVEL: str({
    default: "info",
    /* eslint-disable-next-line max-len */
    desc: "The logging threshold level (default level is 'info'). Choices are 'trace', 'debug', 'info', 'warn', 'error', 'fatal'."
  }),
  PORT: port({
    default: 5100,
    example: 5100,
    desc: "The port on which this Auth provider will run"
  })
})
