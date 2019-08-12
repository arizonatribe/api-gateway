const test = require("tape")
const sinon = require("sinon")
const proxyquire = require("proxyquire").noCallThru()

test("validateAuthCode()", async t => {
  const res = {}
  const next = sinon.spy()
  const realAppId = "0db068eb-0ede-4ffb-9bfb-d0c253f4144c"
  const realAppSecret = "202acbc6-b29f-412b-923a-4114d25c027e"
  const realAuthCode = "3bd9efc8-b880-4b69-90f9-2b58caad98fa"
  const encodedAuthCode = "M2JkOWVmYzgtYjg4MC00YjY5LTkwZjktMmI1OGNhYWQ5OGZh"
  const realToken = {
    application: {
      clientId: realAppId,
      clientSecret: realAppSecret
    },
    validateCode(code) {
      return code === realAuthCode
    }
  }
  const atobSpy = sinon.spy()
  const sendErrorResponseSpy = sinon.spy()
  const findTokenByCodeSpy = sinon.spy()
  const {validateAuthCode} = proxyquire("../src/middleware/auth", {
    atob(code) {
      atobSpy(code)
      return code === encodedAuthCode
        ? realAuthCode
        : code
    },
    "./helpers": {
      sendErrorResponse: sendErrorResponseSpy
    },
    "../db/client": {
      findTokenByCode(code) {
        findTokenByCodeSpy(code)
        if (code === realAuthCode || code === "test-validate") {
          return Promise.resolve(realToken)
        } else if (code === "test-expired-code") {
          return Promise.resolve({
            ...realToken,
            hasCodeExpired: true
          })
        }
        return Promise.resolve()
      }
    }
  })

  await validateAuthCode({}, res, next)

  t.ok(
    sendErrorResponseSpy.calledWith(res, 400, "No authorization `code` was provided in the request body"),
    "error when no auth code in request"
  )

  await validateAuthCode({ code: encodedAuthCode }, res, next)

  t.ok(
    sendErrorResponseSpy.calledWith(res, 400, "`client_id` missing from the request body / header"),
    "error when no client_id in request"
  )

  await validateAuthCode({ code: encodedAuthCode, clientId: realAppId }, res, next)

  t.ok(
    sendErrorResponseSpy.calledWith(res, 400, "`client_secret` missing from the request body / header"),
    "error when no client_secret in request"
  )

  await validateAuthCode({
    query: { code: "something-else" },
    clientId: realAppId,
    clientSecret: realAppSecret
  }, res, next)

  t.ok(
    sendErrorResponseSpy.calledWith(res, 401, "Unknown authorization code something-else"),
    "error when auth code is invalid"
  )

  await validateAuthCode({
    query: { code: "test-validate" },
    clientId: realAppId,
    clientSecret: realAppSecret
  }, res, next)

  t.ok(
    sendErrorResponseSpy.calledWith(res, 403, "The auth code 'test-validate' is invalid."),
    "error when auth code is invalid (own method)"
  )

  await validateAuthCode({
    query: { code: "test-expired-code" },
    clientId: realAppId,
    clientSecret: realAppSecret
  }, res, next)

  t.ok(
    sendErrorResponseSpy.calledWith(res, 401, "Auth code expired. Please restart authentication."),
    "error when auth code is expired"
  )

  await validateAuthCode({
    body: { code: encodedAuthCode },
    clientId: "fake-id",
    clientSecret: realAppSecret
  }, res, next)

  t.ok(
    sendErrorResponseSpy.calledWith(res, 403, "This code was not issued to this client."),
    "error when client id/secret isn't associated with the auth code"
  )

  const req = { query: { code: encodedAuthCode }, clientId: realAppId, clientSecret: realAppSecret }
  await validateAuthCode(req, res, next)

  t.ok(
    atobSpy.calledWith(encodedAuthCode),
    "db client called with auth code"
  )
  t.ok(
    findTokenByCodeSpy.calledWith(realAuthCode),
    "db client called with auth code"
  )
  t.ok(next.calledOnce, "middleware next() invoked")

  t.end()
})
