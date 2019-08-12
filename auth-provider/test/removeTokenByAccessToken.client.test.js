/* eslint-disable class-methods-use-this */
const test = require("tape")
const sinon = require("sinon")
const proxyquire = require("proxyquire").noCallThru()

test("removeTokenByAccessToken()", async t => {
  const findOneAndRemoveSpy = sinon.spy()
  const mongooseModelSpy = sinon.spy()
  /* eslint-disable-next-line max-len */
  const realAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlVzZXIgTmFtZSIsImlhdCI6MTUxNjIzOTAyMn0.XW0-YlwR_GQuLOPB3cHWtmtayOnofsQpUOie7pjwvmc"

  const Token = {
    findOneAndRemove({ accessToken }, cb) {
      findOneAndRemoveSpy(accessToken)
      cb(undefined)
    }
  }

  const {removeTokenByAccessToken} = proxyquire("../src/db/client", {
    mongoose: {
      model(modelName) {
        mongooseModelSpy(modelName)
        return Token
      }
    }
  })

  const result = await removeTokenByAccessToken(realAccessToken)

  t.ok(
    mongooseModelSpy.calledWith("Token"),
    "retrieves the mongoose Token model"
  )
  t.ok(
    findOneAndRemoveSpy.calledWith(realAccessToken),
    "tries to remove a token by an access token string"
  )
  t.equal(result, true, "returns 'true' if successful")

  t.end()
})
