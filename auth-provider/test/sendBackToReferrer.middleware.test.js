const test = require("tape")
const sinon = require("sinon")
const proxyquire = require("proxyquire").noCallThru()

test("sendBackToReferrer()", t => {
  const res = {
    redirect: sinon.spy()
  }
  const req = {
    redirectUri: "https://your-app.com",
    authorization_code: "77442b1e-62fc-4c03-9956-9094134edf93"
  }
  const encodedId = "Nzc0NDJiMWUtNjJmYy00YzAzLTk5NTYtOTA5NDEzNGVkZjkz"
  const btoaSpy = sinon.spy()
  const querystringSpy = sinon.spy()
  const {sendBackToReferrer} = proxyquire("../src/middleware/auth", {
    "./helpers": {
      querystring: {
        stringify(obj) {
          querystringSpy(obj)
          return `${Object.keys(obj)[0]}=${encodedId}`
        }
      },
      btoa(cid) {
        btoaSpy(cid)
        return encodedId
      }
    }
  })

  sendBackToReferrer(req, res)

  t.ok(
    res.redirect.calledWith(`${req.redirectUri}?code=${encodedId}`),
    "sends back to referring app"
  )

  sendBackToReferrer({ authorization_code: req.authorization_code }, res)

  t.ok(
    res.redirect.calledWith(`?code=${encodedId}`),
    "when no redirect URI, is a relative URI"
  )
  t.end()
})
