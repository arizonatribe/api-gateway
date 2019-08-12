const test = require("tape")
const sinon = require("sinon")
const proxyquire = require("proxyquire").noCallThru()

test("deserializeUser()", async t => {
  const doneSpy = sinon.spy()
  const deserializeUserSpy = sinon.spy()
  const findUserByIdSpy = sinon.spy()
  const realUser = {
    id: "c4193f12-905b-4b8e-8322-80c226819c05",
    name: "your name"
  }

  const {deserializeUser} = proxyquire("../src/passport/strategies", {
    "../db/client": {
      findUserById(id, populateFields) {
        findUserByIdSpy(id, populateFields)
        return id === realUser.id
          ? realUser
          : undefined
      }
    },
    passport: {
      deserializeUser(cb) {
        deserializeUserSpy()
        cb(realUser.id, doneSpy)
      }
    }
  })

  const result = await deserializeUser()

  t.ok(
    deserializeUserSpy.calledOnce,
    "invokes passport's deserializeUser()"
  )
  t.ok(
    doneSpy.calledWith(null, realUser),
    "invokes passport's done() callback"
  )
  t.ok(
    findUserByIdSpy.calledWith(realUser.id, "-hash -salt"),
    "invokes the findUserById() db client method with expected params"
  )
  t.deepEqual(
    result,
    realUser,
    "resolves with the found user"
  )

  t.end()
})
