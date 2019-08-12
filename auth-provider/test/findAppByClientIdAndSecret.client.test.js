/* eslint-disable class-methods-use-this */
const test = require("tape")
const sinon = require("sinon")
const proxyquire = require("proxyquire").noCallThru()

test("findAppByClientIdAndSecret()", async t => {
  const findOneSpy = sinon.spy()
  const mongooseModelSpy = sinon.spy()
  const execQuerySpy = sinon.spy()
  const realApp = {
    clientId: "0db068eb-0ede-4ffb-9bfb-d0c253f4144c",
    clientSecret: "202acbc6-b29f-412b-923a-4114d25c027e"
  }

  const App = {
    findOne({ clientId, clientSecret }) {
      findOneSpy({ clientId, clientSecret })
      return {
        exec(cb) {
          execQuerySpy()
          cb(undefined, realApp)
        }
      }
    }
  }

  const {findAppByClientIdAndSecret} = proxyquire("../src/db/client", {
    mongoose: {
      model(modelName) {
        mongooseModelSpy(modelName)
        return App
      }
    }
  })

  await findAppByClientIdAndSecret(realApp.clientId, realApp.clientSecret)

  t.ok(
    mongooseModelSpy.calledWith("App"),
    "retrieves the mongoose App model"
  )
  t.ok(
    findOneSpy.calledWith(realApp),
    "tries to find an app by a client id & secret"
  )
  t.ok(
    execQuerySpy.calledOnce,
    "executes the query after populating the associated documents"
  )

  t.end()
})
