/* eslint-disable class-methods-use-this */
const test = require("tape")
const sinon = require("sinon")
const proxyquire = require("proxyquire").noCallThru()

test("creatLoggers()", async t => {
  const createPinoLoggerSpy = sinon.spy()
  const expressPinoLoggerSpy = sinon.spy()

  /*
   * The real logger will have FUNCTIONS of these names,
   * but for the sake of testing deep equality in the unit test,
   * just changing them to primitive values instead
   */
  const fogger = {
    trace: "trace",
    debug: "debug",
    info: "info",
    warn: "warn",
    error: "error",
    fatal: "fatal"
  }

  const createLoggers = proxyquire("../src/logger", {
    pino(config) {
      createPinoLoggerSpy(config)
      return fogger
    },
    "express-pino-logger"(config) {
      expressPinoLoggerSpy(config)
      return true
    }
  })

  const result = createLoggers({
    isProduction: false,
    logLevel: "WARN",
    appName: "my app"
  })

  t.ok(
    createPinoLoggerSpy.calledWith({ name: "my app", level: "warn" }),
    "creates the pino logger with the supplied configuration"
  )
  t.ok(
    expressPinoLoggerSpy.calledWith({ logger: fogger, name: "my app (request middleware)", prettyPrint: true }),
    "creates the express pino logger middleware with the supplied configuration"
  )
  t.deepEqual(
    result,
    { middleware: true, logger: fogger, level: "warn" },
    "the log level, logger, and middleware are all returned together"
  )

  let { level } = createLoggers({ appName: "my app" })

  t.equal(level, "info", "defaults to level of 'info'")

  level = createLoggers({ appName: "my app", logLevel: "something-fake" }).level

  t.equal(level, "info", "validates log levels")

  t.end()
})
