const test = require("tape")
const sinon = require("sinon")
const { parseState } = require("../src/middleware/auth")

test("parseState()", t => {
  const next = sinon.spy()

  let req = { body: { state: "of-mind" } }
  parseState(req, {}, next)

  t.ok(next.calledOnce, "middleware next() invoked")
  t.equal(req.state, "of-mind", "Parse the state from the request body")

  req = { query: { state: "of-mind" } }
  parseState(req, {}, next)

  t.equal(req.state, "of-mind", "Parse the state from the request query string")

  req = { query: { state: "of-mind" }, body: { state: "happy" } }
  parseState(req, {}, next)

  t.equal(req.state, "of-mind", "favors state in the query string over the request body")

  req = { query: { }, body: { } }
  parseState(req, {}, next)

  t.equal(req.state, undefined, "if not on query string or request body, state is undefined")

  t.end()
})
