const test = require("tape")
const sinon = require("sinon")
const proxyquire = require("proxyquire").noCallThru()

test("sendUserId()", async t => {
  const res = {}
  const sendResponseSpy = sinon.spy()
  const {sendUserId} = proxyquire("../src/middleware/auth", {
    "./helpers": {
      sendResponse: sendResponseSpy
    }
  })

  await sendUserId({ userId: 12 }, res)

  t.ok(
    sendResponseSpy.calledWith(res, 200, { user_id: 12, message: "Token is valid" }),
    "sends back response to request to received user id"
  )

  t.end()
})
