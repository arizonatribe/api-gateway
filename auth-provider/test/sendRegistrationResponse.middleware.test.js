const test = require("tape")
const sinon = require("sinon")
const proxyquire = require("proxyquire").noCallThru()
const {passwordRegex, emailRegex} = require("../src/middleware/helpers")

test("sendRegistrationResponse()", async t => {
  const res = {}
  const sendResponseSpy = sinon.spy()
  const sendErrorResponseSpy = sinon.spy()
  const createUserSpy = sinon.spy()
  const realUser = {
    _id: "d2270ac2-1bb3-45ba-bb5f-1ecf1aa857af",
    name: "yours"
  }
  const error500 = new Error("Testing the error handling of this thing")
  const {sendRegistrationResponse} = proxyquire("../src/middleware/register", {
    "../db/client": {
      createUser(...args) {
        createUserSpy(...args)
        if (args[0] === "test-throw") {
          throw error500
        }
        return realUser
      }
    },
    "./helpers": {
      emailRegex,
      passwordRegex,
      sendResponse: sendResponseSpy,
      sendErrorResponse: sendErrorResponseSpy
    }
  })

  sendRegistrationResponse({}, res)

  t.ok(
    sendErrorResponseSpy.calledWith(res, 400, "Name, Email and Password are all required to register"),
    "name, email and password required on the request body"
  )

  sendRegistrationResponse({
    body: {
      name: "yup, got one of those",
      email: "lorem@ipsum.com",
      password: "a"
    }
  }, res)

  t.ok(
    /* eslint-disable-next-line max-len */
    sendErrorResponseSpy.calledWith(res, 400, "Password must be alpha-numeric (mixed-case) contain at least one symbol and span between 8 and 20 characters in length."),
    "passowrd formatting violation"
  )

  sendRegistrationResponse({
    body: {
      name: "yup, got one of those",
      email: "lorem@ipsum.com",
      password: "1F#rest1",
      confirm_password: "no"
    }
  }, res)

  t.ok(
    sendErrorResponseSpy.calledWith(res, 400, "Password and confirmation did not match."),
    "password and confirmation must match"
  )

  sendRegistrationResponse({
    body: {
      name: "yup, got one of those",
      email: "loremipsum",
      password: "1F#rest1",
      confirm_password: "1F#rest1"
    }
  }, res)

  t.ok(
    sendErrorResponseSpy.calledWith(res, 400, "The email address you entered is not valid (or perhaps unusual)."),
    "email formatting violation"
  )

  await sendRegistrationResponse({
    body: {
      name: "test-throw",
      email: "lorem@ipsum.com",
      password: "1F#rest1",
      confirm_password: "1F#rest1"
    }
  }, res)

  t.ok(
    sendErrorResponseSpy.calledWith(res, 500, error500),
    "test error thrown is caught during user creation"
  )

  await sendRegistrationResponse({
    body: {
      name: "forest gump",
      email: "lorem@ipsum.com",
      password: "1F#rest1",
      confirm_password: "1F#rest1"
    }
  }, res)

  t.ok(
    sendResponseSpy.calledWith(res, 200, { user_id: realUser._id, message: "You have been successfully registered." }),
    "responds with the user id and confirmation message"
  )
  t.ok(
    createUserSpy.calledWith("forest gump", "lorem@ipsum.com", "1F#rest1", undefined),
    "user creation db client is invoked properly"
  )

  t.end()
})
