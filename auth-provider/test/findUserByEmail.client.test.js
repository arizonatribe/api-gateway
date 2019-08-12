/* eslint-disable class-methods-use-this */
const test = require("tape")
const sinon = require("sinon")
const proxyquire = require("proxyquire").noCallThru()

test("findUserByEmail()", async t => {
  const findOneSpy = sinon.spy()
  const mongooseModelSpy = sinon.spy()
  const realEmail = "not-really-a-real-email@email.com"
  const realUser = {
    _id: "abc",
    email: realEmail
  }

  const User = {
    findOne({ email }, cb) {
      findOneSpy(email)
      cb(undefined, realUser)
    }
  }

  const {findUserByEmail} = proxyquire("../src/db/client", {
    mongoose: {
      model(modelName) {
        mongooseModelSpy(modelName)
        return User
      }
    }
  })

  await findUserByEmail(realEmail)

  t.ok(
    mongooseModelSpy.calledWith("User"),
    "retrieves the mongoose User model"
  )
  t.ok(
    findOneSpy.calledWith(realEmail),
    "tries to find a user by an email address"
  )

  t.end()
})
