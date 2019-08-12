const test = require("tape")
const sinon = require("sinon")
const proxyquire = require("proxyquire").noCallThru()

test("parseToken()", t => {
  /* eslint-disable-next-line max-len */
  const realAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlVzZXIgTmFtZSIsImlhdCI6MTUxNjIzOTAyMn0.XW0-YlwR_GQuLOPB3cHWtmtayOnofsQpUOie7pjwvmc"
  const decodedJwt = {
    sub: "1234567890",
    name: "User Name",
    iat: 1516239022
  }
  const jwtDecodeSpy = sinon.spy()
  const {parseToken} = proxyquire("../src/db/helpers", {
    jsonwebtoken: {
      decode(jwtString) {
        if (jwtString !== realAccessToken) {
          throw new Error("Uh-oh! An uncaught error in parseToken()")
        }
        jwtDecodeSpy(jwtString)
        return decodedJwt
      }
    }
  })

  t.doesNotThrow(parseToken, "Errors are caught in parseToken() helper")

  const result = parseToken(realAccessToken)

  t.ok(
    jwtDecodeSpy.calledWith(realAccessToken),
    "jwt.decode() is called with the provided jwt string value"
  )
  t.deepEqual(
    result,
    decodedJwt,
    "confirm the result of jwt.decode() is returned to the caller"
  )

  t.end()
})
