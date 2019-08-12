const test = require("tape")
const sinon = require("sinon")
const { sendLoginPage } = require("../src/middleware/login")

test("sendLoginPage()", t => {
  const res = {
    render: sinon.spy(),
    redirect: sinon.spy()
  }

  sendLoginPage({ message: "get ready to login" }, res)

  t.ok(
    res.render.calledWith("login", {
      title: "Login Form",
      message: "get ready to login"
    }),
    "sends back login view"
  )

  sendLoginPage({
    user: {
      id: "77442b1e-62fc-4c03-9956-9094134edf93",
      name: "yours"
    }
  }, res)

  t.ok(
    res.redirect.calledWith("/"),
    "redirects home if no user on the request object"
  )

  t.end()
})
