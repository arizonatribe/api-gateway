const test = require("tape")
const sinon = require("sinon")
const proxyquire = require("proxyquire").noCallThru()

test("generateBase64String()", t => {
  const randomBytesSpy = sinon.spy()
  const {generateBase64String} = proxyquire("../src/db/helpers", {
    crypto: {
      randomBytes(numOfBytes) {
        randomBytesSpy(numOfBytes)
        return Buffer.from(Array(numOfBytes).fill("a").join(""))
      }
    }
  })

  t.doesNotThrow(generateBase64String, "When no args are passed, it does not throw")

  const result = generateBase64String(8)

  t.ok(
    randomBytesSpy.calledWith(8),
    "crypto.randomBytes() is called with the provided number of bytes"
  )
  t.equal(
    result,
    "YWFhYWFhYWE=",
    "ensure that a base64 encoded string is returned instead of just a Buffer itself"
  )

  t.end()
})
