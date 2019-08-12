const test = require("tape")
const { areUrisOnSameHost } = require("../src/middleware/helpers")

test("areUrisOnSameHost()", t => {
  t.doesNotThrow(areUrisOnSameHost, "no args will NOT throw")
  t.equal(areUrisOnSameHost(), false, "no args will cause to return false")
  t.equal(areUrisOnSameHost("lorem", "ipsum"), false, "plain old text invalidates the comparison")
  t.equal(areUrisOnSameHost("localhost", "localhost"), false, "localhost isn't a valid URI")
  t.equal(areUrisOnSameHost("www.lorem.com/ipsum", "www.lorem.com/dolor"), false, "relative URLs cannot be compared")

  t.equal(
    areUrisOnSameHost("http://www.lorem.com/ipsum", "http://www.lorem.com/v1/api/get-dimsum"),
    true,
    "full URLs with transport protocol is able to be compared"
  )
  t.equal(
    areUrisOnSameHost("http://www.lorem.com/ipsum", "http://www.your-company.com/v1/api/get-dimsum"),
    false,
    "recognizes full URLs which are truly on different domains"
  )
  t.end()
})
