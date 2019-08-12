const test = require("tape")
const { isValidUri } = require("../src/middleware/helpers")

test("isValidUri()", t => {
  t.doesNotThrow(isValidUri, "no args will NOT throw")
  t.equal(isValidUri(), false, "no args will return false")
  t.equal(isValidUri("loremipsum"), false, "plain old text is not a URI")
  t.equal(isValidUri("localhost"), false, "localhost")
  t.equal(isValidUri("127.0.0.1"), false, "IP address for localhost")
  t.equal(isValidUri("/v1/api/some-endpoint"), false, "relative URL is not valid")

  t.equal(isValidUri("http://localhost"), true, "localhost with transport protocl is valid")
  t.equal(isValidUri("https://your-api.com"), true, "normal looking URL")

  t.end()
})
