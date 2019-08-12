const test = require("tape")
const sinon = require("sinon")
const proxyquire = require("proxyquire").noCallThru()

test("validateRefreshToken()", async t => {
  const res = {}
  const next = sinon.spy()
  const realAppId = "0db068eb-0ede-4ffb-9bfb-d0c253f4144c"
  const realAppSecret = "202acbc6-b29f-412b-923a-4114d25c027e"
  /* eslint-disable-next-line max-len */
  const realAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlVzZXIgTmFtZSIsImlhdCI6MTUxNjIzOTAyMn0.XW0-YlwR_GQuLOPB3cHWtmtayOnofsQpUOie7pjwvmc"
  const realRefreshToken = "3bd9efc8-b880-4b69-90f9-2b58caad98fa"
  const realToken = {
    accessToken: realAccessToken,
    application: {
      clientId: realAppId,
      clientSecret: realAppSecret
    }
  }
  const sendErrorResponseSpy = sinon.spy()
  const findTokenByRefreshTokenSpy = sinon.spy()
  const {validateRefreshToken} = proxyquire("../src/middleware/auth", {
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

  await validateRefreshToken({}, res, next)

  t.ok(
    sendErrorResponseSpy.calledWith(res, 400, "No `refresh_token` was provided in the request body"),
    "error when no refresh token in request"
  )

  await validateRefreshToken({ refreshToken: realRefreshToken }, res, next)

  t.ok(
    sendErrorResponseSpy.calledWith(res, 400, "client_id missing from the request query string (or request body)"),
    "error when no client_id in request"
  )

  await validateRefreshToken({ refreshToken: realRefreshToken, clientId: realAppId }, res, next)

  t.ok(
    sendErrorResponseSpy.calledWith(res, 400, "client_secret missing from the request query string (or request body)"),
    "error when no client_secret in request"
  )

  await validateRefreshToken({
    refreshToken: "something-fake",
    clientId: realAppId,
    clientSecret: realAppSecret
  }, res, next)

  t.ok(
    sendErrorResponseSpy.calledWith(res, 401, "Unknown refresh token"),
    "error when refresh token is invalid"
  )

  await validateRefreshToken({
    body: { refresh_token: realRefreshToken },
    clientId: "fake-id",
    clientSecret: realAppSecret
  }, res, next)

  t.ok(
    sendErrorResponseSpy.calledWith(res, 403, "This client not allowed to use this refresh token."),
    "error when refresh token is invalid"
  )

  const req = { query: { refresh_token: realRefreshToken }, clientId: realAppId, clientSecret: realAppSecret }
  await validateRefreshToken(req, res, next)

  t.ok(
    findTokenByRefreshTokenSpy.calledWith(realRefreshToken),
    "db client called with refresh token and methods to populate (on the model)"
  )
  t.ok(next.calledOnce, "middleware next() invoked")

  t.end()
})
