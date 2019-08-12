const test = require("tape")
const sinon = require("sinon")
const proxyquire = require("proxyquire").noCallThru()

test("serializeUser()", async t => {
  const doneSpy = sinon.spy()
  const serializeUserSpy = sinon.spy()
  const realUser = {
    id: "c4193f12-905b-4b8e-8322-80c226819c05",
    name: "your name"
  }

  const {serializeUser} = proxyquire("../src/passport/strategies", {
    passport: {
      serializeUser(cb) {
        serializeUserSpy()
        cb(realUser, doneSpy)
      }
    }
  })

  const result = await serializeUser()

  t.ok(
    serializeUserSpy.calledOnce,
    "invokes passport's serializeUser()"
  )
  t.ok(
    doneSpy.calledWith(null, realUser.id),
    "invokes passport's done() callback"
  )
  t.equal(
    result,
    realUser.id,
    "resolves with the found user's id"
  )

  t.end()
})
