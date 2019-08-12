const test = require("tape")
const sinon = require("sinon")
const { sendApplicationRegistrationPage } = require("../src/middleware/register")

test("sendApplicationRegistrationPage()", t => {
  const res = {
    render: sinon.spy()
  }

  sendApplicationRegistrationPage({ message: "get ready to register" }, res)

  t.ok(
    res.render.calledWith("registerapp", {
      title: "Application Registration",
      message: "get ready to register"
    }),
    "sends back app registration view"
  )

  t.end()
})
