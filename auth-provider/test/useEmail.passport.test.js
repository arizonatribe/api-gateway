/* eslint-disable guard-for-in */
const test = require("tape")
const sinon = require("sinon")
const proxyquire = require("proxyquire").noCallThru()

test("useEmail()", async t => {
  const doneSpy = sinon.spy()
  const passportUseSpy = sinon.spy()
  const findUserByEmailSpy = sinon.spy()
  const validatePasswordSpy = sinon.spy()
  const realPassword = "1F#rest1"
  const realUser = {
    id: "c4193f12-905b-4b8e-8322-80c226819c05",
    name: "your name",
    email: "your.email@email.com",
    validPassword(pwd) {
      validatePasswordSpy(pwd)
      return Boolean(pwd)
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

  const {useEmail} = proxyquire("../src/passport/strategies", {
    "../db/client": {
      findUserByEmail(email) {
        findUserByEmailSpy(email)
        return email === realUser.email
          ? realUser
          : undefined
      }
    },
    "passport-local": { Strategy },
    passport: {
      use(kind, strat) {
        passportUseSpy(kind, strat)
        cb(realUser.email, realPassword, doneSpy)
      }
    }
  })

  const result = await useEmail()

  t.ok(
    passportUseSpy.calledWith(
      "email",
      new Strategy({ usernameField: "email" })
    ),
    "invokes passport's use() with expected params"
  )
  t.ok(
    validatePasswordSpy.calledWith(realPassword),
    "Checks the password validator method"
  )
  t.ok(
    doneSpy.calledWith(null, realUser),
    "invokes passport's done() callback"
  )
  t.ok(
    findUserByEmailSpy.calledWith(realUser.email),
    "invokes the findUserByEmail() db client method with expected params"
  )
  t.deepEqual(
    result,
    realUser,
    "resolves with the found user"
  )

  t.end()
})
