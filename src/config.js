const env = require("./env")

module.exports = {
  port: env.PORT,
  appName: env.APP_NAME,
  isProduction: env.isProduction,
  logLevel: env.LOG_LEVEL,
  shouldMock: env.MOCK_RESOLVERS,
  studentsURL: env.STUDENTS_API_URL,
  connectionString: [
    "mongodb://",
    env.DB_HOST,
    env.DB_PASSWORD ? `:${env.DB_PASSWORD}:` : ":",
    env.DB_PORT,
    `/${env.DB_NAME}`
  ].join("")
}
