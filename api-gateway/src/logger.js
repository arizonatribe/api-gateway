const createPinoLogger = require("pino")
const createLoggerMiddleware = require("express-pino-logger")

/**
 * Enum for supported log levels.
 * @readonly
 * @enum {number}
 */
const logLevels = {
  /** @type {string} */
  trace: "trace",
  /** @type {string} */
  debug: "debug",
  /** @type {string} */
  info: "info",
  /** @type {string} */
  warn: "warn",
  /** @type {string} */
  error: "error",
  /** @type {string} */
  fatal: "fatal"
}

/**
 * @typedef {Object<string, any>} loggers
 * @property {Object<string, function>} logger The pino logger instance with standard console methods
 * @property {function} middleware The Express middleware logger to stdout
 * @property {string} level The current logging threshold level
 */

/**
 * Using the app config (mainly the environment variables) different kinds of logging instances are created:
 *   * standard logging middleware (express)
 *   * stand alone logger (synonymous with most [Console](https://developer.mozilla.org/en-US/docs/Web/API/Console/info) methods)
 *
 * @function
 * @name createLoggers
 * @param {logLevel} config.logLevel The logLevel value for the middleware
 * @param {string} config.appName The name of the application
 * @param {boolean} config.isProduction Whether or not this is running in a production environment
 * @returns {loggers} The set of logging functions to log requests, as well
 * as a stand-alone logger and the current logging threshold level
 */
function createLoggers(config) {
  const level = logLevels[config.logLevel]
    || (config.logLevel && Object.values(logLevels).find(l => config.logLevel.toLowerCase() === l))
    || logLevels.info

  const logger = createPinoLogger({name: config.appName, level})

  const middleware = createLoggerMiddleware({
    logger,
    name: `${config.appName} (request middleware)`,
    prettyPrint: !config.isProduction
  })

  return { level, logger, middleware }
}

module.exports = createLoggers
