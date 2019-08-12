const test = require("tape")
const sinon = require("sinon")
const proxyquire = require("proxyquire").noCallThru()

test("sendApplicationRegistrationResponse()", async t => {
  const res = {}
  const sendResponseSpy = sinon.spy()
  const sendErrorResponseSpy = sinon.spy()
  const createAppSpy = sinon.spy()
  const realAppId = "0db068eb-0ede-4ffb-9bfb-d0c253f4144c"
  const realAppSecret = "202acbc6-b29f-412b-923a-4114d25c027e"
  const realApp = {
    name: "yur-app",
    redirectUri: "https://yur-app.com",
    clientId: realAppId,
    clientSecret: realAppSecret
  }
  const error500 = new Error("Testing the error handling of this thing")
  const {sendApplicationRegistrationResponse} = proxyquire("../src/middleware/register", {
    "../db/client": {
      createApp(...args) {
        createAppSpy(...args)
        if (args[0] === "test-throw") {
          throw error500
        }
        return realApp
      }
    },
    "./helpers": {
      sendResponse: sendResponseSpy,
      sendErrorResponse: sendErrorResponseSpy
    }
  })

  sendApplicationRegistrationResponse({}, res)

  t.ok(
    sendErrorResponseSpy.calledWith(res, 400, "Application Name and URL are required to register"),
    "app name and redirect URI are required on the request body"
  )

  await sendApplicationRegistrationResponse({
    body: {
      name: "test-throw",
      redirect_uri: realApp.redirectUri
    }
  }, res)

  t.ok(
    sendErrorResponseSpy.calledWith(res, 500, error500),
    "test error thrown is caught during app creation"
  )

  await sendApplicationRegistrationResponse({
    body: {
      name: realApp.name,
      redirect_uri: realApp.redirectUri
    }
  }, res)

  t.ok(
    sendResponseSpy.calledWith(res, 200, { client_id: realApp.clientId, client_secret: realApp.clientSecret }),
    "responds with the app client id and secret"
  )
  t.ok(
    createAppSpy.calledWith(realApp.name, realApp.redirectUri),
    "app creation db client is invoked properly"
  )

  t.end()
})
