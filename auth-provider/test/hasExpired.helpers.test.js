const test = require("tape")
const {hasExpired} = require("../src/db/helpers")

test("hasExpired()", t => {
  t.doesNotThrow(hasExpired, "failing to provide a value will not throw, but rather return false")

  const oldDate = new Date()
  oldDate.setFullYear(oldDate.getFullYear() - 1)

  t.equal(
    hasExpired(oldDate),
    true,
    "a date prior to now is considered expired"
  )

  const futureDate = new Date()
  futureDate.setFullYear(futureDate.getFullYear() + 1)

  t.equal(
    hasExpired(futureDate),
    false,
    "a date after now is not considered expired"
  )

  t.equal(
    hasExpired((new Date()).valueOf() - 100),
    true,
    "a value string of a date is acceptable too"
  )
  t.end()
})
