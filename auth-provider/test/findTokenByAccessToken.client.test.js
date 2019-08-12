/* eslint-disable class-methods-use-this */
const test = require("tape")
const sinon = require("sinon")
const proxyquire = require("proxyquire").noCallThru()

test("findTokenByAccessToken()", async t => {
  const findOneSpy = sinon.spy()
  const mongooseModelSpy = sinon.spy()
  const populateAppSpy = sinon.spy()
  const populateUserSpy = sinon.spy()
  const execQuerySpy = sinon.spy()
  /* eslint-disable-next-line max-len */
  const realAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlVzZXIgTmFtZSIsImlhdCI6MTUxNjIzOTAyMn0.XW0-YlwR_GQuLOPB3cHWtmtayOnofsQpUOie7pjwvmc"
  const user = {
    _id: "abc",
    email: "mr.person@email.com"
  }
  const app = {
    clientId: "0db068eb-0ede-4ffb-9bfb-d0c253f4144c",
    clientSecret: "202acbc6-b29f-412b-923a-4114d25c027e"
  }

  const Token = {
    findOne({ accessToken }) {
      findOneSpy(accessToken)
      return {
        populate(modelName, fields) {
          populateAppSpy(modelName, fields)
          return {
            populate(mName, flds) {
              populateUserSpy(mName, flds)
              return {
                exec(cb) {
                  execQuerySpy()
                  cb(undefined, {
                    accessToken: realAccessToken,
                    requester: user,
                    application: app
                  })
                }
              }
            }
          }
        }
      }
    }
  }

  const {findTokenByAccessToken} = proxyquire("../src/db/client", {
    mongoose: {
      model(modelName) {
        mongooseModelSpy(modelName)
        return Token
      }
    }
  })

  await findTokenByAccessToken(realAccessToken)

  t.ok(
    mongooseModelSpy.calledWith("Token"),
    "retrieves the mongoose Token model"
  )
  t.ok(
    findOneSpy.calledWith(realAccessToken),
    "tries to find a token by an access token string"
  )
  t.ok(
    populateUserSpy.calledWith("requester", "email _id"),
    "must populate the associated user record on the token, but only the email and ID need be returned"
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
