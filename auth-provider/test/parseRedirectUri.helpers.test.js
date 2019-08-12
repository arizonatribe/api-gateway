const test = require("tape")
const { parseRedirectUri } = require("../src/middleware/helpers")

test("parseRedirectUri()", t => {
  t.doesNotThrow(parseRedirectUri, "no args will NOT throw")
  t.equal(parseRedirectUri(), undefined, "no args will cause to return undefined")
  t.equal(
    parseRedirectUri(null, "https://your-company.com"),
    "https://your-company.com",
    "falsy first arg will cause redirect URI to win by default"
  )
  t.equal(parseRedirectUri("https://www.your-company.com"), undefined, "one arg will cause to return undefined")

  t.equal(parseRedirectUri("lorem", "ipsum"), undefined, "plain old text invalidates the comparison")
  t.equal(parseRedirectUri("localhost", "localhost"), undefined, "localhost isn't a valid URI")
  t.equal(parseRedirectUri("www.lorem.com/ipsum", "www.lorem.com/dolor"), undefined, "relative URLs cannot be compared")

  t.equal(
    parseRedirectUri("http://www.lorem.com/ipsum", "http://www.lorem.com/v1/api/get-dimsum"),
    undefined,
    "URLs on the same domain will cause undefined to be returned"
  )
  t.equal(
    parseRedirectUri("http://www.lorem.com/ipsum", "http://www.your-company.com/v1/api/get-dimsum"),
    "http://www.your-company.com/v1/api/get-dimsum",
    "recognizes that URIs are on different domains (and returns 2nd arg)"
  )
  t.end()
})
