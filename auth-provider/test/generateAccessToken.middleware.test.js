const test = require("tape")
const sinon = require("sinon")
const proxyquire = require("proxyquire").noCallThru()

test("generateAccessToken()", async t => {
  const res = {}
  const next = sinon.spy()
  const setAccessTokenSpy = sinon.spy()
  const generateJwtSpy = sinon.spy()
  const saveSpy = sinon.spy()
  /* eslint-disable-next-line max-len */
  const realAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlVzZXIgTmFtZSIsImlhdCI6MTUxNjIzOTAyMn0.XW0-YlwR_GQuLOPB3cHWtmtayOnofsQpUOie7pjwvmc"
  const realToken = {
    accessToken: realAccessToken,
    save(cb) {
      saveSpy(cb)
      cb(undefined, { accessToken: realAccessToken })
    },
    setAccessToken(accessToken) {
      setAccessTokenSpy(accessToken)
    },
    requester: {
      generateJwt() {
        generateJwtSpy()
        return realAccessToken
      }
    }
  }
  const atobSpy = sinon.spy()
  const realAuthCode = "3bd9efc8-b880-4b69-90f9-2b58caad98fa"
  const encodedAuthCode = "M2JkOWVmYzgtYjg4MC00YjY5LTkwZjktMmI1OGNhYWQ5OGZh"
  const sendErrorResponseSpy = sinon.spy()
  const findTokenByCodeSpy = sinon.spy()
  const {generateAccessToken} = proxyquire("../src/middleware/auth", {
    atob(code) {
      atobSpy(code)
      return code === encodedAuthCode
        ? realAuthCode
        : "something-else"
    },
    "./helpers": {
      sendErrorResponse: sendErrorResponseSpy
    },
    "../db/client": {
      findTokenByCode(code, populateMethods) {
        findTokenByCodeSpy(code, populateMethods)
        return code === realAuthCode
          ? Promise.resolve(realToken)
          : Promise.resolve()
      }
    }
  })

  await generateAccessToken({}, res, next)

  t.ok(
    sendErrorResponseSpy.calledWith(res, 400, "Authorization code could not be found on the request."),
    "error when no auth code"
  )

  await generateAccessToken({ code: "dGFsa2Vy" }, res, next)

  t.ok(
    atobSpy.calledWith("dGFsa2Vy"),
    "atob translates base64 string"
  )
  t.ok(
    sendErrorResponseSpy.calledWith(res, 400, "Unknown Authorization Code"),
    "error when auth code is invalid"
  )

  const req = { code: encodedAuthCode }
  await generateAccessToken(req, res, next)

  t.ok(
    findTokenByCodeSpy.calledWith(realAuthCode, ["requester", "generateJwt"]),
    "db client called with auth code and methods to populate (on the model)"
  )

  t.ok(
    generateJwtSpy.calledOnce,
    "access token is generated"
  )
  t.ok(
    setAccessTokenSpy.calledWith(realAccessToken),
    "access token is generated and placed onto the token record"
  )
  t.ok(
    saveSpy.calledOnce,
    "updated token record is saved"
  )
  t.equal(req.token, realAccessToken, "sets the access token onto the request object")
  t.ok(next.calledOnce, "middleware next() invoked")

  t.end()
})
