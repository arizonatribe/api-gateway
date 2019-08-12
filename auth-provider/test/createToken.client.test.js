/* eslint-disable class-methods-use-this */
const test = require("tape")
const sinon = require("sinon")
const proxyquire = require("proxyquire").noCallThru()

test("createToken()", async t => {
  const saveSpy = sinon.spy()
  const setCodeSpy = sinon.spy()
  const setRequesterSpy = sinon.spy()
  const setApplicationSpy = sinon.spy()
  const mongooseModelSpy = sinon.spy()
  const realAuthCode = "3bd9efc8-b880-4b69-90f9-2b58caad98fa"

  class Token {
    setCode() {
      setCodeSpy()
    }

    save(cb) {
      saveSpy()
      cb(undefined, { code: realAuthCode })
    }

    set requester(val) {
      setRequesterSpy(val)
    }

    set application(val) {
      setApplicationSpy(val)
    }
  }

  const {createToken} = proxyquire("../src/db/client", {
    mongoose: {
      model(modelName) {
        mongooseModelSpy(modelName)
        return Token
      }
    }
  })

  const user = {
    name: "mr. person",
    email: "mr.person@email.com"
  }
  const app = {
    name: "my app",
    redirectUri: "https://my-app.com"
  }

  const result = await createToken(user, app)

  t.ok(
    mongooseModelSpy.calledWith("Token"),
    "retrieves the mongoose Token model"
  )
  t.ok(
    setRequesterSpy.calledWith(user),
    "sets the user associated with the new token"
  )
  t.ok(
    setApplicationSpy.calledWith(app),
    "sets the application associated with the new token"
  )
  t.ok(
    saveSpy.calledOnce,
    "must save the new token record"
  )
  t.ok(
    setCodeSpy.calledOnce,
    "sets the auth code"
  )
  t.equal(
    result,
    realAuthCode,
    "the auth code is returned when the token is successfully created"
  )

  t.end()
})
