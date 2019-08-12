/* eslint-disable class-methods-use-this */
const test = require("tape")
const sinon = require("sinon")
const proxyquire = require("proxyquire").noCallThru()

test("createApp()", async t => {
  const saveSpy = sinon.spy()
  const setClientIdSpy = sinon.spy()
  const setClientSecretSpy = sinon.spy()
  const mongooseModelSpy = sinon.spy()

  class App {
    setClientId() {
      setClientIdSpy()
    }

    setClientSecret() {
      setClientSecretSpy()
    }

    save(cb) {
      saveSpy(cb)
      cb(undefined, this)
    }
  }

  const {createApp} = proxyquire("../src/db/client", {
    mongoose: {
      model(modelName) {
        mongooseModelSpy(modelName)
        return App
      }
    }
  })

  const result = await createApp("my app", "https://my-app.com")

  t.ok(
    mongooseModelSpy.calledWith("App"),
    "retrieves the mongoose App model"
  )
  t.ok(
    setClientIdSpy.calledOnce,
    "sets the client id"
  )
  t.ok(
    setClientSecretSpy.calledOnce,
    "sets the client secret"
  )
  t.ok(
    saveSpy.calledOnce,
    "must save the new app record"
  )
  t.deepEqual(
    result,
    { name: "my app", redirectUri: "https://my-app.com" },
    "the name and redirect URI are set on the new app instance being created"
  )

  t.end()
})
