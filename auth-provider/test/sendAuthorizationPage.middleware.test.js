const test = require("tape")
const sinon = require("sinon")
const proxyquire = require("proxyquire").noCallThru()

test("sendAuthorizationPage()", t => {
  const res = {
    render: sinon.spy()
  }
  const req = {
    message: "you are authorized to view this page",
    app_name: "yur-app",
    client_id: "77442b1e-62fc-4c03-9956-9094134edf93"
  }
  const encodedId = "Nzc0NDJiMWUtNjJmYy00YzAzLTk5NTYtOTA5NDEzNGVkZjkz"
  const btoaSpy = sinon.spy()
  const {sendAuthorizationPage} = proxyquire("../src/middleware/auth", {
    "./helpers": {
      btoa(cid) {
        btoaSpy(cid)
        return encodedId
      }
    }
  })

  sendAuthorizationPage(req, res)

  t.ok(
    res.render.calledWith("authorize", {
      title: "Authorization Form",
      message: req.message,
      app_name: req.app_name,
      client_id: encodedId
    }),
    "sends back authorization view"
  )

  t.end()
})
