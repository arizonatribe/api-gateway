const test = require("tape")
const sinon = require("sinon")
const proxyquire = require("proxyquire").noCallThru()

test("validateClientIdAndSecret()", async t => {
  const res = {}
  const next = sinon.spy()
  const realAppId = "0db068eb-0ede-4ffb-9bfb-d0c253f4144c"
  const realAppSecret = "202acbc6-b29f-412b-923a-4114d25c027e"
  const realApp = {
    name: "yur-app",
    redirectUri: "https://yur-app.com",
    clientId: realAppId,
    clientSecret: realAppSecret
  }
  const sendErrorResponseSpy = sinon.spy()
  const parseRedirectUriSpy = sinon.spy()
  const findAppByClientIdAndSecretSpy = sinon.spy()
  const {validateClientIdAndSecret} = proxyquire("../src/middleware/auth", {
    "./helpers": {
      sendErrorResponse: sendErrorResponseSpy,
      parseRedirectUri(reqUri, appUri) {
        parseRedirectUriSpy(reqUri, appUri)
        return appUri || reqUri
      }
    },
    "../db/client": {
      findAppByClientIdAndSecret(clientId, clientSecret) {
        findAppByClientIdAndSecretSpy(clientId, clientSecret)
        return (clientId === realAppId && clientSecret === realAppSecret)
          ? Promise.resolve(realApp)
          : Promise.resolve()
      }
    }
  })

  await validateClientIdAndSecret({}, res, next)

  t.ok(
    sendErrorResponseSpy.calledWith(res, 400, "`client_id` missing from the request body / header"),
    "error when no client_id in request"
  )

  await validateClientIdAndSecret({ clientId: realAppId }, res, next)

  t.ok(
    sendErrorResponseSpy.calledWith(res, 400, "`client_secret` missing from the request body / header"),
    "error when no client_secret in request"
  )

  await validateClientIdAndSecret({ clientId: "fake-id", clientSecret: realAppSecret }, res, next)

  t.ok(
    sendErrorResponseSpy.calledWith(res, 401, "Unknown client application fake-id"),
    "error when client id or secret is invalid"
  )

  const req = { clientId: realAppId, clientSecret: realAppSecret, redirectUri: "http://bad-uri.com" }
  await validateClientIdAndSecret(req, res, next)

  t.ok(
    parseRedirectUriSpy.calledWith("http://bad-uri.com", realApp.redirectUri),
    "parseRedirectUri() is used to figure out what to set the redirect URI to"
  )
  t.equal(
    req.redirect_uri,
    realApp.redirectUri,
    "redirect_uri is set on the request, populated from the app record over anything in the request (for security)"
  )
  t.equal(req.app_name, "yur-app", "app_name is set on the request")
  t.ok(
    findAppByClientIdAndSecretSpy.calledWith(realAppId, realAppSecret),
    "db client called with client id and secret"
  )
  t.ok(next.calledOnce, "middleware next() invoked")

  t.end()
})
