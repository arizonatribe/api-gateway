/* eslint-disable guard-for-in */
const test = require("tape")
const sinon = require("sinon")
const proxyquire = require("proxyquire").noCallThru()

test("useToken()", async t => {
  const secret = "super-serial"
  const doneSpy = sinon.spy()
  const verifySpy = sinon.spy()
  const parseTokenSpy = sinon.spy()
  const passportUseSpy = sinon.spy()
  const findTokenByAccessTokenSpy = sinon.spy()
  const realPassword = "1F#rest1"
  /* eslint-disable-next-line max-len */
  const realAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlVzZXIgTmFtZSIsImlhdCI6MTUxNjIzOTAyMn0.XW0-YlwR_GQuLOPB3cHWtmtayOnofsQpUOie7pjwvmc"
  const realToken = {
    hasTokenExpired: false,
    accessToken: realAccessToken,
    parseToken(accessToken) {
      parseTokenSpy(accessToken)
      return {
        email: accessToken === realAccessToken
          ? "your.email@email.com"
          : "something@email.com"
      }
    },
    requester: {
      id: "c4193f12-905b-4b8e-8322-80c226819c05",
      email: "your.email@email.com"
    }
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

  const {useToken} = proxyquire("../src/passport/strategies", {
    "../db/client": {
      findTokenByAccessToken(accessToken, populateArgs) {
        findTokenByAccessTokenSpy(accessToken, populateArgs)
        return accessToken === realAccessToken
          ? realToken
          : undefined
      }
    },
    jsonwebtoken: {
      verify(token, sec, verifyCb) {
        verifySpy(token, sec)
        verifyCb(undefined)
      }
    },
    "passport-local": { Strategy },
    passport: {
      use(kind, strat) {
        passportUseSpy(kind, strat)
        cb(realAccessToken, realPassword, doneSpy)
      }
    }
  })

  const result = await useToken(secret)

  t.ok(
    passportUseSpy.calledWith(
      "token",
      new Strategy({ usernameField: "token" })
    ),
    "invokes passport's use() with expected params"
  )
  t.ok(
    parseTokenSpy.calledWith(realAccessToken),
    "parses the jwt and compares email"
  )
  t.ok(
    doneSpy.calledWith(null, realToken),
    "invokes passport's done() callback"
  )
  t.ok(
    findTokenByAccessTokenSpy.calledWith(realAccessToken, ["requester", "email"]),
    "invokes the findTokenByAccessToken db client method with expected params"
  )
  t.ok(
    verifySpy.calledWith(realAccessToken, secret),
    "attempt to verify the jwt"
  )
  t.deepEqual(
    result,
    realToken,
    "resolves with the found token"
  )

  t.end()
})
