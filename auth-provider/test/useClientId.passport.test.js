/* eslint-disable guard-for-in */
const test = require("tape")
const sinon = require("sinon")
const proxyquire = require("proxyquire").noCallThru()

test("useClientId()", async t => {
  const doneSpy = sinon.spy()
  const passportUseSpy = sinon.spy()
  const findAppByClientIdAndSecretSpy = sinon.spy()
  const realPassword = "1F#rest1"
  const realAppId = "0db068eb-0ede-4ffb-9bfb-d0c253f4144c"
  const realApp = { clientId: realAppId }

  let cb
  class Strategy {
    constructor(options, callback) {
      cb = callback
      for (const key in options) {
        this[key] = options[key]
      }
    }
  }

  const {useClientId} = proxyquire("../src/passport/strategies", {
    "../db/client": {
      findAppByClientIdAndSecret(clientId) {
        findAppByClientIdAndSecretSpy(clientId)
        return clientId === realAppId
          ? realApp
          : undefined
      }
    },
    "passport-local": { Strategy },
    passport: {
      use(kind, strat) {
        passportUseSpy(kind, strat)
        cb(realAppId, realPassword, doneSpy)
      }
    }
  })

  const result = await useClientId()

  t.ok(
    passportUseSpy.calledWith(
      "clientid",
      new Strategy({ usernameField: "client_id" })
    ),
    "invokes passport's use() with expected params"
  )
  t.ok(
    doneSpy.calledWith(null, realApp),
    "invokes passport's done() callback"
  )
  t.ok(
    findAppByClientIdAndSecretSpy.calledWith(realAppId),
    "invokes the findAppByClientIdAndSecret() db client method with expected params"
  )
  t.deepEqual(
    result,
    realApp,
    "resolves with the found app"
  )

  t.end()
})
