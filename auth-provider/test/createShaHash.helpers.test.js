const test = require("tape")
const sinon = require("sinon")
const proxyquire = require("proxyquire").noCallThru()

test("createShaHash()", t => {
  const createHashSpy = sinon.spy()
  const hashUpdateSpy = sinon.spy()
  const digestSpy = sinon.spy()
  const realHash = "HkmfenOkP8zgzWWe69CzPmauolEcqiAzM8wdQE8UBAo="
  const {createShaHash} = proxyquire("../src/db/helpers", {
    crypto: {
      createHash(hashType) {
        createHashSpy(hashType)
        return {
          update(str, strType) {
            hashUpdateSpy(str, strType)
            return {
              digest(digestType) {
                digestSpy(digestType)
                return realHash
              }
            }
          }
        }
      }
    }
  })

  t.doesNotThrow(createShaHash, "When no args are passed, it does not throw")

  const result = createShaHash("yesplease")

  t.ok(
    createHashSpy.calledWith("sha256"),
    "crypto.createShaHash() is invoked for sha256 hash types"
  )
  t.ok(
    hashUpdateSpy.calledWith("yesplease", "base64"),
    "crypto.createShaHash().update() is invoked for the given string"
  )
  t.ok(
    digestSpy.calledWith("base64"),
    "crypto.createShaHash().update().digest() is invoked for base64 strings"
  )
  t.equal(result, realHash)

  t.end()
})
