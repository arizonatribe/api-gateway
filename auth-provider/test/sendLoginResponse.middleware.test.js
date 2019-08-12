const test = require("tape")
const sinon = require("sinon")
const proxyquire = require("proxyquire").noCallThru()

test("sendLoginResponse()", t => {
  const res = {}
  const passportSpy = sinon.spy()
  const sendResponseSpy = sinon.spy()
  const sendErrorResponseSpy = sinon.spy()
  const realUser = {
    generateJwt() {
      return "secret-token"
    }
  }
  const {sendLoginResponse} = proxyquire("../src/middleware/login", {
    passport: {
      authenticate(kind, cb) {
        return (req, _res) => {
          passportSpy(kind)
          if (req.CREATE_ERROR) {
            cb("not found", realUser)
          } else if (req.NO_USER) {
            cb(undefined, undefined, "not authorized")
          } else {
            cb(undefined, realUser)
          }
        }
      }
    },
    "./helpers": {
      sendResponse: sendResponseSpy,
      sendErrorResponse: sendErrorResponseSpy
    }
  })

  sendLoginResponse({}, res)

  t.ok(
    sendErrorResponseSpy.calledWith(res, 400, "Email and Password are both required to login"),
    "email and password required on the request body"
  )

  sendLoginResponse({ CREATE_ERROR: true, body: { email: "lorem@ipsum.com", password: "1Forest1" }}, res)

  t.ok(
    sendErrorResponseSpy.calledWith(res, 404, "not found"),
    "error handling"
  )

  sendLoginResponse({ NO_USER: true, body: { email: "lorem@ipsum.com", password: "1Forest1" }}, res)

  t.ok(
    sendErrorResponseSpy.calledWith(res, 401, "not authorized"),
    "user not found (error handling)"
  )

  sendLoginResponse({ body: { email: "lorem@ipsum.com", password: "1Forest1" }}, res)

  t.ok(
    passportSpy.calledWith("user"),
    "passport user authentication being used"
  )
  t.ok(
    sendResponseSpy.calledWith(res, 200, { token: "secret-token" }),
    "sends back the token"
  )

  t.end()
})
