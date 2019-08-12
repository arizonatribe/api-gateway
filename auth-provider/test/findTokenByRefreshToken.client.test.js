/* eslint-disable class-methods-use-this */
const test = require("tape")
const sinon = require("sinon")
const proxyquire = require("proxyquire").noCallThru()

test("findTokenByRefreshToken()", async t => {
  const findOneSpy = sinon.spy()
  const mongooseModelSpy = sinon.spy()
  const populateAppSpy = sinon.spy()
  const execQuerySpy = sinon.spy()
  const realRefreshToken = "3bd9efc8-b880-4b69-90f9-2b58caad98fa"
  /* eslint-disable-next-line max-len */
  const realAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlVzZXIgTmFtZSIsImlhdCI6MTUxNjIzOTAyMn0.XW0-YlwR_GQuLOPB3cHWtmtayOnofsQpUOie7pjwvmc"
  const app = {
    clientId: "0db068eb-0ede-4ffb-9bfb-d0c253f4144c",
    clientSecret: "202acbc6-b29f-412b-923a-4114d25c027e"
  }

  const Token = {
    findOne({ refreshToken }) {
      findOneSpy(refreshToken)
      return {
        populate(modelName, fields) {
          populateAppSpy(modelName, fields)
          return {
            exec(cb) {
              execQuerySpy()
              cb(undefined, {
                accessToken: realAccessToken,
                application: app
              })
            }
          }
        }
      }
    }
  }

  const {findTokenByRefreshToken} = proxyquire("../src/db/client", {
    mongoose: {
      model(modelName) {
        mongooseModelSpy(modelName)
        return Token
      }
    }
  })

  await findTokenByRefreshToken(realRefreshToken)

  t.ok(
    mongooseModelSpy.calledWith("Token"),
    "retrieves the mongoose Token model"
  )
  t.ok(
    findOneSpy.calledWith(realRefreshToken),
    "tries to find a token by a refresh token string"
  )
  t.ok(
    populateAppSpy.calledWith("application", "clientId clientSecret"),
    "must populate the associated app record on the token, but only the client ID and secret need be returned"
  )
  t.ok(
    execQuerySpy.calledOnce,
    "executes the query after populating the associated documents"
  )

  t.end()
})
