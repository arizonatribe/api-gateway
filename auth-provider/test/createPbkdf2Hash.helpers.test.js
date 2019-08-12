const test = require("tape")
const sinon = require("sinon")
const proxyquire = require("proxyquire").noCallThru()

test("createPbkdf2Hash()", t => {
  const pbkdf2SyncSpy = sinon.spy()
  const {createPbkdf2Hash} = proxyquire("../src/db/helpers", {
    crypto: {
      pbkdf2Sync(salt, secret, numOfIterations, numOfBytes) {
        pbkdf2SyncSpy(salt, secret, numOfIterations, numOfBytes)
        return Buffer.from(Array(numOfBytes).fill("a").join(""))
      }
    }
  })

  t.doesNotThrow(createPbkdf2Hash, "When no args are passed, it does not throw")

  const result = createPbkdf2Hash("pepper", "super-secret", 8)

  t.ok(
    pbkdf2SyncSpy.calledWith("super-secret", "pepper", 1000, 8),
    "crypto.createPbkdf2Hash() is called with the provided number of bytes, the salt and secret"
  )
  t.equal(
    result,
    "YWFhYWFhYWE=",
    "ensure that a base64 encoded string is returned instead of just a Buffer itself"
  )

  t.end()
})
