const test = require("tape")
const sinon = require("sinon")
const proxyquire = require("proxyquire").noCallThru()

test("createUser()", async t => {
  const saveSpy = sinon.spy()
  const setPasswordSpy = sinon.spy()
  const mongooseModelSpy = sinon.spy()
  const realPassword = "1F#rest1"
  const profileImg = "imaginethisisabase64encodedpngstring"

  class User {
    /* eslint-disable-next-line class-methods-use-this */
    setPassword(password) {
      setPasswordSpy(password)
    }

    save(cb) {
      saveSpy(cb)
      cb(undefined, this)
    }
  }

  const {createUser} = proxyquire("../src/db/client", {
    mongoose: {
      model(modelName) {
        mongooseModelSpy(modelName)
        return User
      }
    }
  })

  const result = await createUser(
    "mr. person",
    "mr.person@email.com",
    realPassword,
    profileImg
  )

  t.ok(
    mongooseModelSpy.calledWith("User"),
    "retrieves the mongoose User model"
  )
  t.ok(
    setPasswordSpy.calledWith(realPassword),
    "sets the password via the helper, but NEVER as a directly set field (salt and hashing, etc.)"
  )
  t.ok(
    saveSpy.calledOnce,
    "must save the new user record"
  )
  t.deepEqual(
    result,
    { name: "mr. person", email: "mr.person@email.com", profile: profileImg },
    "the name, email and profile are set on the new user instance being created"
  )

  t.end()
})
