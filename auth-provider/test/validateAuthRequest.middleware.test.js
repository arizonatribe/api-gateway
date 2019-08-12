const test = require("tape")
const sinon = require("sinon")
const proxyquire = require("proxyquire").noCallThru()

test("validateAuthRequest()", async t => {
  const res = {}
  const next = sinon.spy()
  const realAppId = "0db068eb-0ede-4ffb-9bfb-d0c253f4144c"
  const realApp = {
    name: "yur-app",
    redirectUri: "https://yur-app.com",
    clientId: realAppId
  }
  const atobSpy = sinon.spy()
  const sendErrorResponseSpy = sinon.spy()
  const parseRedirectUriSpy = sinon.spy()
  const findAppByClientIdAndSecretSpy = sinon.spy()
  const {validateAuthRequest} = proxyquire("../src/middleware/auth", {
    atob(str) {
      atobSpy(str)
      return str
    },
    "./helpers": {
      sendErrorResponse: sendErrorResponseSpy,
      parseRedirectUri(reqUri, appUri) {
        parseRedirectUriSpy(reqUri, appUri)
        return appUri || reqUri
      }
    },
    "../db/client": {
      findAppByClientIdAndSecret(clientId) {
        findAppByClientIdAndSecretSpy(clientId)
        return clientId === realAppId
          ? Promise.resolve(realApp)
          : Promise.resolve()
      }
    }
  })

  await validateAuthRequest({}, res, next)

  t.ok(
    sendErrorResponseSpy.calledWith(res, 400, "`client_id` missing from the request body / header"),
    "error when no client_id in request"
  )

  await validateAuthRequest({ clientId: realAppId }, res, next)

  t.ok(
    sendErrorResponseSpy.calledWith(res, 400, "response_type was not specified"),
    "error when no response_type in request query string"
  )

  await validateAuthRequest({ clientId: realAppId, query: { response_type: "something" } }, res, next)

  t.ok(
    sendErrorResponseSpy.calledWith(res, 400, "response_type something is invalid"),
    "error when response_type is not 'code' or 'token'"
  )

  await validateAuthRequest({ clientId: "fake-id", query: { response_type: "code" } }, res, next)

  t.ok(
    atobSpy.calledWith("fake-id"),
    "db client called with client id"
  )
  t.ok(
    sendErrorResponseSpy.calledWith(res, 401, "Unknown client application: fake-id"),
    "error when client id is invalid"
  )

  const req = {
    clientId: realAppId,
    query: { response_type: "token" },
    redirectUri: "http://bad-uri.com"
  }
  await validateAuthRequest(req, res, next)

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
    findAppByClientIdAndSecretSpy.calledWith(realAppId),
    "db client called with client id"
  )
  t.ok(next.calledOnce, "middleware next() invoked")

  t.end()
})
