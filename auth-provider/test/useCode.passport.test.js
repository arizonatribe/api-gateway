/* eslint-disable guard-for-in */
const test = require("tape")
const sinon = require("sinon")
const proxyquire = require("proxyquire").noCallThru()

test("useCode()", async t => {
  const doneSpy = sinon.spy()
  const passportUseSpy = sinon.spy()
  const findTokenByCodeSpy = sinon.spy()
  const realPassword = "1F#rest1"
  const realAuthCode = "3bd9efc8-b880-4b69-90f9-2b58caad98fa"
  const realToken = {
    code: realAuthCode,
    hasCodeExpired: false
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

  const {useCode} = proxyquire("../src/passport/strategies", {
    "../db/client": {
      findTokenByCode(code, populateArgs) {
        findTokenByCodeSpy(code, populateArgs)
        return code === realAuthCode
          ? realToken
          : undefined
      }
    },
    "passport-local": { Strategy },
    passport: {
      use(kind, strat) {
        passportUseSpy(kind, strat)
        cb(realAuthCode, realPassword, doneSpy)
      }
    }
  })

  const result = await useCode()

  t.ok(
    passportUseSpy.calledWith(
      "code",
      new Strategy({ usernameField: "code" })
    ),
    "invokes passport's use() with expected params"
  )
  t.ok(
    doneSpy.calledWith(null, realToken),
    "invokes passport's done() callback"
  )
  t.ok(
    findTokenByCodeSpy.calledWith(realAuthCode, ["requester", "generateJwt"]),
    "invokes the findTokenByCode() db client method with expected params"
  )
  t.deepEqual(
    result,
    realToken,
    "resolves with the found token"
  )

  t.end()
})
