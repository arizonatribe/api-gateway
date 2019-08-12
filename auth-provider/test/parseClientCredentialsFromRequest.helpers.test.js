const test = require("tape")
const sinon = require("sinon")
const { parseClientCredentialsFromRequest } = require("../src/middleware/auth")

test("parseClientCredentialsFromRequest()", t => {
  const res = {}
  const next = sinon.spy()

  function beforeEach(reqConfig = {}) {
    return {
      ...reqConfig,
      headers: {
        authorization: "Basic bG9yZW06aXBzdW0=",
        ...(reqConfig.headers || {})
      }
    }
  }

  let req = beforeEach()
  parseClientCredentialsFromRequest(req, res, next)

  t.ok(next.calledOnce, "middleware next() invoked")
  t.equal(req.clientId, "lorem", "Parse the clientId from the Authorization header")
  t.equal(req.clientSecret, "ipsum", "Parse the clientSecret from the Authorization header")

  req = beforeEach({ headers: { authorization: "lorem" } })
  parseClientCredentialsFromRequest(req, res, next)

  t.equal(req.clientId, undefined, "Ignores non-basic auth")

  req = beforeEach({
    body: { client_id: "Ym9keS1jbGllbnQ=", client_secret: "Ym9keS1zZWNyZXQ=" },
    headers: { authorization: "" }
  })
  parseClientCredentialsFromRequest(req, res, next)

  t.equal(req.clientId, "body-client", "checks for client_id in the request body")
  t.equal(req.clientSecret, "body-secret", "checks for client_secret in the request body")

  req = beforeEach({ body: { client_id: "Ym9keS1jbGllbnQ=", client_secret: "Ym9keS1zZWNyZXQ=" } })
  parseClientCredentialsFromRequest(req, res, next)

  t.equal(req.clientId, "lorem", "favors clientId in the header over the request body")
  t.equal(req.clientSecret, "ipsum", "favors client_secret in the header over the request body")

  req = beforeEach({
    query: { client_id: "Ym9keS1jbGllbnQ=", client_secret: "cXVlcnktc2VjcmV0" },
    headers: { authorization: "" }
  })
  parseClientCredentialsFromRequest(req, res, next)

  t.equal(req.clientId, "body-client", "checks for clientId in the query string too")
  t.equal(req.clientSecret, "query-secret", "checks for clientSecret in the query string too")

  req = beforeEach({
    query: { client_id: "Ym9keS1jbGllbnQ=", client_secret: "cXVlcnktc2VjcmV0" },
    body: { client_id: "Ym9keS1jbGllbnQ=", client_secret: "Ym9keS1zZWNyZXQ=" }
  })
  parseClientCredentialsFromRequest(req, res, next)

  t.equal(req.clientId, "lorem", "favors clientId in the header over the query string")
  t.equal(req.clientSecret, "ipsum", "favors clientSecret in the header over the query string")

  req = beforeEach({
    query: { client_id: "Ym9keS1jbGllbnQ=", client_secret: "cXVlcnktc2VjcmV0" },
    body: { client_id: "Ym9keS1jbGllbnQ=", client_secret: "Ym9keS1zZWNyZXQ=" },
    headers: { authorization: "" }
  })
  parseClientCredentialsFromRequest(req, res, next)

  t.equal(req.clientId, "body-client", "favors clientId in the body over the query string")
  t.equal(req.clientSecret, "body-secret", "favors clientSecret in the body over the query string")

  t.end()
})
