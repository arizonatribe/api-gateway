const test = require("tape")
const sinon = require("sinon")
const proxyquire = require("proxyquire").noCallThru()

test("sendToken()", t => {
  const res = {}
  /* eslint-disable-next-line max-len */
  const realAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlVzZXIgTmFtZSIsImlhdCI6MTUxNjIzOTAyMn0.XW0-YlwR_GQuLOPB3cHWtmtayOnofsQpUOie7pjwvmc"
  const req = {
    token: realAccessToken
  }
  const btoaSpy = sinon.spy()
  const sendResponseSpy = sinon.spy()
  const {sendToken} = proxyquire("../src/middleware/auth", {
    btoa(token) {
      btoaSpy(token)
      return token
    },
    "./helpers": {
      sendResponse: sendResponseSpy
    }
  })

  sendToken(req, res)

  t.ok(
    sendResponseSpy.calledWith(res, 200, { token: realAccessToken }),
    "sends back token from the request object"
  )
  t.ok(
    btoaSpy.calledWith(realAccessToken),
    "btoa encodes the token"
  )

  t.end()
})
