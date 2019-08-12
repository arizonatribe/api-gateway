/* eslint-disable class-methods-use-this */
const test = require("tape")
const sinon = require("sinon")
const proxyquire = require("proxyquire").noCallThru()

test("findUserById()", async t => {
  const findOneSpy = sinon.spy()
  const mongooseModelSpy = sinon.spy()
  const realUserId = "a116160e-58d7-4267-96e2-340a82716909"
  const realUser = {
    _id: realUserId,
    email: "not-really-a-real-email@email.com"
  }

  const User = {
    findOne({ _id: userId }, fields, cb) {
      if (Array.isArray(fields)) {
        findOneSpy(userId, fields)
        cb(undefined, realUser)
      } else {
        findOneSpy(userId)
        fields(undefined, realUser)
      }
    }
  }

  const {findUserById} = proxyquire("../src/db/client", {
    mongoose: {
      model(modelName) {
        mongooseModelSpy(modelName)
        return User
      }
    }
  })

  await findUserById(realUserId)

  t.ok(
    mongooseModelSpy.calledWith("User"),
    "retrieves the mongoose User model"
  )
  t.ok(
    findOneSpy.calledWith(realUserId),
    "tries to find a user by an id"
  )

  await findUserById(realUserId, ["email", "some-other-field"])

  t.ok(
    findOneSpy.secondCall.calledWith(realUserId, ["email", "some-other-field"]),
    "can also pass the fields to be populated"
  )

  t.end()
})
