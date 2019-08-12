const test = require("tape")
const sinon = require("sinon")
const proxyquire = require("proxyquire").noCallThru()

test("validateUser()", t => {
  const res = {}
  const next = sinon.spy()
  const realUser = {
    _id: 1234,
    name: "yours"
  }
  const sendErrorResponseSpy = sinon.spy()
  const passportSpy = sinon.spy()
  const realEmail = "yours@email.com"
  const {validateUser} = proxyquire("../src/middleware/auth", {
    "./helpers": {
      sendErrorResponse: sendErrorResponseSpy
    },
    passport: {
      authenticate(authType, cb) {
        return (rq, rs) => {
          passportSpy(authType, rq, rs)
          cb(undefined, (rq.body && rq.body.email === realEmail) ? realUser : undefined)
        }
      }
    }
  })

  validateUser({}, res, next)

  t.ok(
    sendErrorResponseSpy.calledWith(res, 400, "Email and Password are both required to login"),
    "error when no email & password"
  )

  validateUser({ body: { email: "lorem@ipsum.com", password: "abc123" } }, res, next)

  t.ok(
    sendErrorResponseSpy.calledWith(res, 401, "Could not verify user"),
    "error when user is not valid"
  )

  const req = { body: { email: realEmail, password: "1Forest1" } }
  validateUser(req, res, next)

  t.ok(
    passportSpy.calledWith("user", req, res),
    "passport.authenticate() is called for 'user' type of authentication and passed the request and response objects"
  )
  t.equal(req.userId, 1234, "sets the userId onto the request object")
  t.ok(next.calledOnce, "middleware next() invoked")

  t.end()
})
