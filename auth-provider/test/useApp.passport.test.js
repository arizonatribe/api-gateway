/* eslint-disable guard-for-in */
const test = require("tape")
const sinon = require("sinon")
const proxyquire = require("proxyquire").noCallThru()

test("useApp()", async t => {
  const doneSpy = sinon.spy()
  const passportUseSpy = sinon.spy()
  const findAppByClientIdAndSecretSpy = sinon.spy()
  const realAppId = "0db068eb-0ede-4ffb-9bfb-d0c253f4144c"
  const realAppSecret = "202acbc6-b29f-412b-923a-4114d25c027e"
  const realApp = {
    clientId: realAppId,
    clientSecret: realAppSecret
  }

  let cb
  class Strategy {
    constructor(options, callback) {
      cb = callback
      for (const key in options) {
        this[key] = options[key]
      }
    }
  }

  const {useApp} = proxyquire("../src/passport/strategies", {
    "../db/client": {
      findAppByClientIdAndSecret(clientId, clientSecret) {
        findAppByClientIdAndSecretSpy(clientId, clientSecret)
        return (clientId === realAppId && clientSecret === realAppSecret)
          ? realApp
          : undefined
      }
    },
    "passport-local": { Strategy },
    passport: {
      use(kind, strat) {
        passportUseSpy(kind, strat)
        cb(realAppId, realAppSecret, doneSpy)
      }
    }
  })

  const result = await useApp()

  t.ok(
    passportUseSpy.calledWith(
      "app",
      new Strategy({ usernameField: "client_id", passwordField: "client_secret" })
    ),
    "invokes passport's use() with expected params"
  )
  t.ok(
    doneSpy.calledWith(null, realApp),
    "invokes passport's done() callback"
  )
  t.ok(
    findAppByClientIdAndSecretSpy.calledWith(realAppId, realAppSecret),
    "invokes the findAppByClientIdAndSecret() db client method with expected params"
  )
  t.deepEqual(
    result,
    realApp,
    "resolves with the found app"
  )

  t.end()
})
