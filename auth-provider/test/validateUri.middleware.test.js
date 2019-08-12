const test = require("tape")
const sinon = require("sinon")
const proxyquire = require("proxyquire").noCallThru()

test("validateUri()", t => {
  const res = {}
  const next = sinon.spy()
  const isValidUriSpy = sinon.spy()
  const sendErrorResponseSpy = sinon.spy()
  const realRedirectUri = "https://yur-app.com"
  const {validateUri} = proxyquire("../src/middleware/register", {
    decodeURIComponent: v => v,
    "./helpers": {
      isValidUri(uri) {
        isValidUriSpy(uri)
        return !!uri
      },
      sendErrorResponse: sendErrorResponseSpy
    }
  })

  validateUri({}, res, next)

  t.ok(
    sendErrorResponseSpy.calledWith(res, 400, "Invalid redirect URL 'undefined'"),
    "redirect URI is required on the request body or query string"
  )

  const req = { body: { redirect_uri: realRedirectUri } }
  validateUri(req, res, next)

  t.ok(
    isValidUriSpy.calledWith(realRedirectUri),
    "checks the isValidUri() helper to determine if URI is valid"
  )
  t.equal(
    req.redirectUri,
    realRedirectUri,
    "redirectUri placed onto the request object"
  )
  t.ok(next.calledOnce, "middleware next() invoked")

  t.end()
})
