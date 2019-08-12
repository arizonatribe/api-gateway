/* eslint-disable guard-for-in */
const test = require("tape")
const sinon = require("sinon")
const proxyquire = require("proxyquire").noCallThru()

test("useRefresh()", async t => {
  const doneSpy = sinon.spy()
  const passportUseSpy = sinon.spy()
  const findTokenByRefreshTokenSpy = sinon.spy()
  const realPassword = "1F#rest1"
  const realRefreshToken = "3bd9efc8-b880-4b69-90f9-2b58caad98fa"
  const realToken = { refreshToken: realRefreshToken }

  let cb
  class Strategy {
    constructor(options, callback) {
      cb = callback
      for (const key in options) {
        this[key] = options[key]
      }
    }
  }

  const {useRefresh} = proxyquire("../src/passport/strategies", {
    "../db/client": {
      findTokenByRefreshToken(refreshToken, populateArgs) {
        findTokenByRefreshTokenSpy(refreshToken, populateArgs)
        return refreshToken === realRefreshToken
          ? realToken
          : undefined
      }
    },
    "passport-local": { Strategy },
    passport: {
      use(kind, strat) {
        passportUseSpy(kind, strat)
        cb(realRefreshToken, realPassword, doneSpy)
      }
    }
  })

  const result = await useRefresh()

  t.ok(
    passportUseSpy.calledWith(
      "refresh",
      new Strategy({ usernameField: "token" })
    ),
    "invokes passport's use() with expected params"
  )
  t.ok(
    doneSpy.calledWith(null, realToken),
    "invokes passport's done() callback"
  )
  t.ok(
    findTokenByRefreshTokenSpy.calledWith(realRefreshToken, ["requester", "generateJwt"]),
    "invokes the findTokenByRefreshToken() db client method with expected params"
  )
  t.deepEqual(
    result,
    realToken,
    "resolves with the found token"
  )

  t.end()
})
