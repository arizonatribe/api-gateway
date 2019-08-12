const test = require("tape")
const sinon = require("sinon")
const proxyquire = require("proxyquire").noCallThru()

test("revokeAccessToken()", async t => {
  const res = {}
  const next = sinon.spy()
  /* eslint-disable-next-line max-len */
  const realAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlVzZXIgTmFtZSIsImlhdCI6MTUxNjIzOTAyMn0.XW0-YlwR_GQuLOPB3cHWtmtayOnofsQpUOie7pjwvmc"
  const sendErrorResponseSpy = sinon.spy()
  const removeTokenByAccessTokenSpy = sinon.spy()
  const {revokeAccessToken} = proxyquire("../src/middleware/auth", {
    "./helpers": {
      sendErrorResponse: sendErrorResponseSpy
    },
    "../db/client": {
      removeTokenByAccessToken(token) {
        removeTokenByAccessTokenSpy(token)
        if (!token) {
          throw new Error("Not a valid token")
        }
      }
    }
  })

  await revokeAccessToken({}, res, next)

  t.ok(
    sendErrorResponseSpy.calledWith(res, 500, "An error occurred revoking the access token"),
    "error when no token provided"
  )

  await revokeAccessToken({ token: realAccessToken }, res, next)

  t.ok(
    removeTokenByAccessTokenSpy.calledWith(realAccessToken),
    "db client called with access token to have it removed"
  )
  t.ok(next.calledOnce, "middleware next() invoked")

  t.end()
})
