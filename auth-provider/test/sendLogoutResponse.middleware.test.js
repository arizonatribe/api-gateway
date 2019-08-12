const test = require("tape")
const sinon = require("sinon")
const {sendLogoutResponse} = require("../src/middleware/login")

test("sendLogoutResponse()", t => {
  const res = {
    redirect: sinon.spy()
  }
  const req = {
    logout: sinon.spy()
  }

  sendLogoutResponse(req, res)

  t.ok(
    res.redirect.calledWith("/"),
    "redirects home"
  )
  t.ok(
    req.logout.calledOnce,
    "invokes .logout() on the request object"
  )

  t.end()
})
