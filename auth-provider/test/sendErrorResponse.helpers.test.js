const test = require("tape")
const sinon = require("sinon")
const { sendErrorResponse } = require("../src/middleware/helpers")

test("sendErrorResponse()", t => {
  function beforeEach() {
    return { json: sinon.spy(), status: sinon.spy() }
  }

  let res = beforeEach()

  sendErrorResponse(res)

  t.ok(res.status.calledWith(400), "Default status code is set to 400")
  t.ok(
    res.json.calledWith({ success: false, message: "An unknown error occurred" }),
    "Default content passed is {success:false,message:'An unknown error occurred'}"
  )

  res = beforeEach()

  sendErrorResponse(res, 404, "You have an error")

  t.ok(res.status.calledWith(404), "Applies the status code you set")
  t.ok(
    res.json.calledWith({ success: false, message: "You have an error" }),
    "Passes content you supply in response"
  )

  t.end()
})
