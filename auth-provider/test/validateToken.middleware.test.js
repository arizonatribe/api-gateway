const test = require("tape")
const sinon = require("sinon")
const proxyquire = require("proxyquire").noCallThru()

test("validateToken()", async t => {
  const res = {}
  const next = sinon.spy()
  const realSecret = "super-serial"
  const realAppId = "0db068eb-0ede-4ffb-9bfb-d0c253f4144c"
  const realUserId = "803f69a4-d313-450d-bef3-95ab59228097"
  const realAppSecret = "202acbc6-b29f-412b-923a-4114d25c027e"
  /* eslint-disable-next-line max-len */
  const realAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlVzZXIgTmFtZSIsImlhdCI6MTUxNjIzOTAyMn0.XW0-YlwR_GQuLOPB3cHWtmtayOnofsQpUOie7pjwvmc"
  const realToken = {
    accessToken: realAccessToken,
    application: {
      clientId: realAppId,
      clientSecret: realAppSecret
    },
    requester: {
      _id: realUserId,
      email: "lorem@ipsum.com"
    }
  }
  const sendErrorResponseSpy = sinon.spy()
  const findTokenByAccessTokenSpy = sinon.spy()
  const verifySpy = sinon.spy()
  const parseTokenSpy = sinon.spy()
  const {createTokenValidator} = proxyquire("../src/middleware/auth", {
    jsonwebtoken: {
      verify(token, sec, cb) {
        verifySpy(token, sec)
        cb(undefined)
      }
    },
    "../db/helpers": {
      parseToken(token) {
        parseTokenSpy(token)
        return {
          email: "lorem@ipsum.com"
        }
      }
    },
    "./helpers": {
      sendErrorResponse: sendErrorResponseSpy
    },
    "../db/client": {
      findTokenByAccessToken(token) {
        findTokenByAccessTokenSpy(token)
        if (token === realAccessToken) {
          return Promise.resolve(realToken)
        } else if (token === "test-email") {
          return Promise.resolve({
            ...realToken,
            requester: {
              ...realToken.requester,
              email: "notlorem@ipsum.com"
            }
          })
        } else if (token === "test-expiration") {
          return Promise.resolve({
            ...realToken,
            hasTokenExpired: true
          })
        }
        return Promise.resolve()
      }
    }
  })

  const validateToken = createTokenValidator(realSecret)

  await validateToken({}, res, next)

  t.ok(
    sendErrorResponseSpy.calledWith(res, 400, "No token was provided to validate"),
    "error when no token on the request"
  )

  await validateToken({ token: realAccessToken }, res, next)

  t.ok(
    sendErrorResponseSpy.calledWith(res, 400, "`client_id` missing from the request body / header"),
    "error when no client_id in request"
  )

  await validateToken({ token: realAccessToken, clientId: realAppId }, res, next)

  t.ok(
    sendErrorResponseSpy.calledWith(res, 400, "`client_secret` missing from the request body / header"),
    "error when no client_secret in request"
  )

  await validateToken({ token: "something-fake", clientId: realAppId, clientSecret: realAppSecret }, res, next)

  t.ok(
    sendErrorResponseSpy.calledWith(res, 401, "Unknown token"),
    "error when token is invalid"
  )

  await validateToken({
    token: "test-expiration",
    clientId: realAppId,
    clientSecret: realAppSecret
  }, res, next)

  t.ok(
    sendErrorResponseSpy.calledWith(res, 401, "Access token has expired. Please sign in again."),
    "error when token is expired"
  )

  await validateToken({
    token: "test-email",
    clientId: realAppId,
    clientSecret: realAppSecret
  }, res, next)

  t.ok(
    sendErrorResponseSpy.calledWith(res, 403, "This token was generated for a different user."),
    "error when token isn't for this user"
  )

  await validateToken({
    token: realAccessToken,
    clientId: "something-fake",
    clientSecret: realAppSecret
  }, res, next)

  t.ok(verifySpy.calledWith(realAccessToken, realSecret), "jwt is being verified")

  t.ok(
    sendErrorResponseSpy.calledWith(res, 403, "This token was not issued to this client."),
    "error when token isn't issued for this app client"
  )

  await validateToken({
    token: realAccessToken,
    clientId: realAppId,
    clientSecret: "something-no-so-secret"
  }, res, next)

  t.ok(
    sendErrorResponseSpy.calledWith(res, 403, "This token was not issued to this client."),
    "error when token isn't issued for this app client (secret)"
  )

  const req = { token: realAccessToken, clientId: realAppId, clientSecret: realAppSecret }
  await validateToken(req, res, next)

  t.ok(
    findTokenByAccessTokenSpy.calledWith(realAccessToken),
    "db client called with refresh token and methods to populate (on the model)"
  )
  t.equal(req.userId, realUserId, "userId placed onto the request object")
  t.ok(next.calledOnce, "middleware next() invoked")

  t.end()
})
