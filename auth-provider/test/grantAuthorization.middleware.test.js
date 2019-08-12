const test = require("tape")
const sinon = require("sinon")
const proxyquire = require("proxyquire").noCallThru()

test("grantAuthorization()", async t => {
  const res = {}
  const next = sinon.spy()
  const realAppId = "0db068eb-0ede-4ffb-9bfb-d0c253f4144c"
  const realApp = {
    id: realAppId,
    name: "your app"
  }
  const realUserId = "b62fc632-16af-465b-9d0b-f0a15f16160c"
  const realUser = {
    id: realUserId,
    name: "you"
  }
  const realAuthCode = "3bd9efc8-b880-4b69-90f9-2b58caad98fa"
  const sendErrorResponseSpy = sinon.spy()
  const findUserByIdSpy = sinon.spy()
  const findAppByClientIdAndSecretSpy = sinon.spy()
  const createTokenSpy = sinon.spy()
  const {grantAuthorization} = proxyquire("../src/middleware/auth", {
    "./helpers": {
      sendErrorResponse: sendErrorResponseSpy
    },
    "../db/client": {
      findUserById(userId) {
        findUserByIdSpy(userId)
        return userId === realUserId
          ? Promise.resolve(realUser)
          : Promise.resolve()
      },
      findAppByClientIdAndSecret(clientId) {
        findAppByClientIdAndSecretSpy(clientId)
        return clientId === realAppId
          ? Promise.resolve(realApp)
          : Promise.resolve()
      },
      createToken(user, app) {
        createTokenSpy(user, app)
        return user.id === realUserId && app.id === realAppId
          ? Promise.resolve(realAuthCode)
          : Promise.resolve()
      }
    }
  })

  await grantAuthorization({}, res, next)

  t.ok(
    sendErrorResponseSpy.calledWith(res, 400, "Client Id must provided before authorizing."),
    "error when no clientId"
  )

  await grantAuthorization({ clientId: realAppId }, res, next)

  t.ok(
    sendErrorResponseSpy.calledWith(res, 400, "User Id must provided before authorizing."),
    "error when no userId"
  )

  await grantAuthorization({ clientId: "foo", userId: 1 }, res, next)

  t.ok(
    findAppByClientIdAndSecretSpy.calledWith("foo"),
    "call db client to verify app (with invalid id)"
  )
  t.ok(
    sendErrorResponseSpy.calledWith(res, 401, "Unknown application foo"),
    "error when clientId is invalid"
  )

  await grantAuthorization({ clientId: realAppId, userId: 1 }, res, next)

  t.ok(
    findAppByClientIdAndSecretSpy.calledWith(realAppId),
    "call db client to verify app (with valid id)"
  )
  t.ok(
    findUserByIdSpy.calledWith(1),
    "call db client to verify user (with invalid id)"
  )
  t.ok(
    sendErrorResponseSpy.calledWith(res, 401, "Unknown user 1"),
    "error when userId is invalid"
  )

  const req = { clientId: realAppId, userId: realUserId }
  await grantAuthorization(req, res, next)

  t.ok(
    findUserByIdSpy.calledWith(realUserId),
    "call db client to verify user (with valid id)"
  )
  t.ok(
    createTokenSpy.calledWith(realUser, realApp),
    "call db client to create auth code for user and associated app"
  )
  t.equal(req.authorization_code, realAuthCode, "sets the auth code onto the request object")
  t.ok(next.calledOnce, "middleware next() invoked")

  t.end()
})
