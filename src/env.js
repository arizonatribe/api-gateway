/* eslint-disable max-len */
const envalid = require("envalid")

const { bool, str, port } = envalid

module.exports = envalid.cleanEnv(process.env, {
  APP_NAME: str({
    default: "api-gateway",
    desc: "The human-readable app name (will be used in logs)"
  }),
  MOCK_RESOLVERS: bool({
    default: false,
    desc: "When a connection to external APIs and/or database is not available or ideal, realistic looking data can be generated instead"
  }),
  LOG_LEVEL: str({
    default: "info",
    desc: "The logging threshold level (default level is 'info'). Choices are 'trace', 'debug', 'info', 'warn', 'error', 'fatal'."
  }),
  PORT: port({
    default: 5000,
    example: 5000,
    desc: "The port on which this API gateway will run"
  }),
  STUDENTS_API_URL: str({
    default: "http://localhost:6000/api",
    desc: "The URL for the students API"
  })
})
