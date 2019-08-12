const test = require("tape")
const sinon = require("sinon")
const proxyquire = require("proxyquire").noCallThru()

test("setupDb()", t => {
  const mongooseModelSpy = sinon.spy()
  const mongooseConnectSpy = sinon.spy()
  const connectionString = "mongodb://mongouser:supersecretpassword@some-domain.com:27017/auth"
  const AppSchema = { name: "my-app" }
  const UserSchema = { name: "human" }
  const TokenSchema = { accessToken: "yup" }
  const setupDb = proxyquire("../src/db/connect", {
    mongoose: {
      connect(connString) {
        mongooseConnectSpy(connString)
        // No need to really mock out ALL the methods on [the Mongoose Connection](https://mongoosejs.com/docs/api.html#connection_Connection)
        return { close() {} }
      },
      model(modelName, schema) {
        mongooseModelSpy(modelName, schema)
      }
    },
    "./app.model": AppSchema,
    "./user.model": UserSchema,
    "./token.model": TokenSchema
  })

  t.throws(setupDb, "throws when no connection string is provided")

  const result = setupDb({ connectionString })

  t.ok(
    mongooseConnectSpy.calledWith(connectionString),
    "mongoose.connect() called with connection string"
  )
  t.ok(
    mongooseModelSpy.calledThrice,
    "don't forget to add any assertions when new models are added!"
  )
  t.ok(
    mongooseModelSpy.calledWith("App", AppSchema),
    "mongoose.model() called for the App schema"
  )
  t.ok(
    mongooseModelSpy.calledWith("User", UserSchema),
    "mongoose.model() called for the User schema"
  )
  t.ok(
    mongooseModelSpy.calledWith("Token", TokenSchema),
    "mongoose.model() called for the Token schema"
  )
  t.ok(
    typeof result.close === "function",
    "make sure the mongoose connection object is returned"
  )

  t.end()
})
