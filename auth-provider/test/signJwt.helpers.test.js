const test = require("tape")
const sinon = require("sinon")
const proxyquire = require("proxyquire").noCallThru()

test("signJwt()", t => {
  const realSecret = "super-serial"
  /* eslint-disable-next-line max-len */
  const realJwt = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlVzZXIgTmFtZSIsImlhdCI6MTUxNjIzOTAyMn0.XW0-YlwR_GQuLOPB3cHWtmtayOnofsQpUOie7pjwvmc"
  const jwtOptions = {
    sub: "1234567890",
    name: "User Name",
    iat: 1516239022
  }
  const jwtSignSpy = sinon.spy()
  const {signJwt} = proxyquire("../src/db/helpers", {
    jsonwebtoken: {
      sign(options, secret, minutes) {
        jwtSignSpy(options, secret, minutes)
        return realJwt
      }
    }
  })

  let expDateValue = (new Date()).getTime() + 3600000

  signJwt(jwtOptions, realSecret)

  t.ok(
    jwtSignSpy.calledWith({
      ...jwtOptions,
      exp: expDateValue
    }, realSecret, undefined),
    "jwt.sign() is called with the provided jwt options and secret"
  )

  expDateValue = (new Date()).getTime() + (3600000 * 5)

  signJwt(jwtOptions, realSecret, 300)

  t.ok(
    jwtSignSpy.calledWith({
      ...jwtOptions,
      exp: expDateValue
    }, realSecret, undefined),
    "can change the number of minutes to expire the token from default of 60 mins to something custom"
  )
  t.end()
})
