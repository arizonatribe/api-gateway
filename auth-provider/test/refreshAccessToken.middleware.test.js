const test = require("tape")
const sinon = require("sinon")
const proxyquire = require("proxyquire").noCallThru()

test("refreshAccessToken()", async t => {
  const res = {}
  const next = sinon.spy()
  const setAccessTokenSpy = sinon.spy()
  const generateJwtSpy = sinon.spy()
  const saveSpy = sinon.spy()
  /* eslint-disable-next-line max-len */
  const realAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlVzZXIgTmFtZSIsImlhdCI6MTUxNjIzOTAyMn0.XW0-YlwR_GQuLOPB3cHWtmtayOnofsQpUOie7pjwvmc"
  const realRefreshToken = "3bd9efc8-b880-4b69-90f9-2b58caad98fa"
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
  const sendErrorResponseSpy = sinon.spy()
  const findTokenByRefreshTokenSpy = sinon.spy()
  const {refreshAccessToken} = proxyquire("../src/middleware/auth", {
    "./helpers": {
      sendErrorResponse: sendErrorResponseSpy
    },
    "../db/client": {
      findTokenByRefreshToken(refreshToken, populateMethods) {
        findTokenByRefreshTokenSpy(refreshToken, populateMethods)
        return refreshToken === realRefreshToken
          ? Promise.resolve(realToken)
          : Promise.resolve()
      }
    }
  })

  await refreshAccessToken({}, res, next)

  t.ok(
    sendErrorResponseSpy.calledWith(res, 400, "refresh_token missing from the request query string (or request body)"),
    "error when no refresh token"
  )

  await refreshAccessToken({ refreshToken: "something-fake" }, res, next)

  t.ok(
    sendErrorResponseSpy.calledWith(res, 403, "Unable to find a matching token"),
    "error when refresh token is invalid"
  )

  const req = { body: { refresh_token: realRefreshToken } }
  await refreshAccessToken(req, res, next)

  t.ok(
    findTokenByRefreshTokenSpy.calledWith(realRefreshToken, ["requester", "generateJwt"]),
    "db client called with refresh token and methods to populate (on the model)"
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
