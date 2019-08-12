const test = require("tape")
const sinon = require("sinon")
const proxyquire = require("proxyquire").noCallThru()
const { parseTokenFromRequest } = require("../src/middleware/auth")

test("parseTokenFromRequest()", t => {
  const res = {}
  const next = sinon.spy()

  function beforeEach(reqConfig = {}) {
    return {
      ...reqConfig,
      headers: {
        authorization: "Bearer my-token",
        ...(reqConfig.headers || {})
      }
    }
  }

  let req = beforeEach()
  parseTokenFromRequest(req, res, next)

  t.ok(next.calledOnce, "middleware next() invoked")
  t.equal(req.token, "my-token", "Parse the token from the Authorization header")

  req = beforeEach({ headers: { authorization: "my-token" } })
  parseTokenFromRequest(req, res, next)

  t.equal(req.token, undefined, "Ignores non-bearer tokens")

  req = beforeEach({ body: { accessToken: "body-token" }, headers: { authorization: "" } })
  parseTokenFromRequest(req, res, next)

  t.equal(req.token, "body-token", "checks for token in the request body")

  req = beforeEach({ body: { accessToken: "body-token" } })
  parseTokenFromRequest(req, res, next)

  t.equal(req.token, "my-token", "favors token in the header over the request body")

  req = beforeEach({ query: { accessToken: "query-token" }, headers: { authorization: "" } })
  parseTokenFromRequest(req, res, next)

  t.equal(req.token, "query-token", "checks for token in the query string too")

  req = beforeEach({ body: { access_token: "body-token" }, headers: { authorization: "" } })
  parseTokenFromRequest(req, res, next)

  t.equal(req.token, "body-token", "checks for camelcased or underscore separated token")

  req = beforeEach({ query: { accessToken: "query-token" }, body: { accessToken: "body-token" } })
  parseTokenFromRequest(req, res, next)

  t.equal(req.token, "my-token", "favors token in the header over the query string")

  req = beforeEach({
    query: { accessToken: "query-token" },
    body: { accessToken: "body-token" },
    headers: { authorization: "" }
  })
  parseTokenFromRequest(req, res, next)

  t.equal(req.token, "body-token", "favors token in the body over the query string")

  req = beforeEach({ query: { access_token: "query-token" }, headers: { authorization: "" } })
  parseTokenFromRequest(req, res, next)

  t.equal(req.token, "query-token", "checks for camelcased or underscore separated token")

  t.end()
})
