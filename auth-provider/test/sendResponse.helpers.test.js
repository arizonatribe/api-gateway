const test = require("tape")
const sinon = require("sinon")
const { sendResponse } = require("../src/middleware/helpers")

test("sendResponse()", t => {
  function beforeEach() {
    return { json: sinon.spy(), status: sinon.spy() }
  }

  let res = beforeEach()

  sendResponse(res)

  t.ok(res.status.calledWith(200), "Default status code is set to 200")
  t.ok(res.json.calledWith({ success: true }), "Default content passed is {success:true}")

  res = beforeEach()

  sendResponse(res, 400, { message: "You have an error" })

  t.ok(res.status.calledWith(400), "Applies the status code you set")
  t.ok(res.json.calledWith({ message: "You have an error" }), "Passes content you supply in response")

  t.end()
})
