const test = require("tape")
const sinon = require("sinon")
const proxyquire = require("proxyquire").noCallThru()

test("sendRevocationResponse()", async t => {
  const res = {}
  const sendResponseSpy = sinon.spy()
  const {sendRevocationResponse} = proxyquire("../src/middleware/auth", {
    "./helpers": {
      sendResponse: sendResponseSpy
    }
  })

  await sendRevocationResponse({}, res)

  t.ok(
    sendResponseSpy.calledWith(res, 200, { message: "Token has been revoked" }),
    "sends back response to request to revoke token"
  )

  t.end()
})
