const test = require("tape")
const sinon = require("sinon")
const { emailRegex, passwordRegex } = require("../src/middleware/helpers")
const { sendRegistrationPage } = require("../src/middleware/register")

test("sendRegistrationPage()", t => {
  const res = {
    render: sinon.spy(),
    redirect: sinon.spy()
  }
  const emailRegexWithoutSlashes = emailRegex.toString().replace(/\//g, "").replace("$i", "")
  const passwordRegexWithoutSlashes = passwordRegex.toString().replace(/\//g, "").replace("$i", "")

  sendRegistrationPage({ message: "get ready to register" }, res)

  t.ok(
    res.render.calledWith("register", {
      title: "Registration Form",
      message: "get ready to register",
      email_pattern: emailRegexWithoutSlashes,
      password_pattern: passwordRegexWithoutSlashes
    }),
    "sends back register view"
  )

  sendRegistrationPage({
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
