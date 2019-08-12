const test = require("tape")
const sinon = require("sinon")
const proxyquire = require("proxyquire").noCallThru()

test("setupPassport()", async t => {
  const secret = "super-serial"
  const useAppSpy = sinon.spy()
  const useUserSpy = sinon.spy()
  const useCodeSpy = sinon.spy()
  const useEmailSpy = sinon.spy()
  const useTokenSpy = sinon.spy()
  const useRefreshSpy = sinon.spy()
  const useClientIdSpy = sinon.spy()
  const serializeUserSpy = sinon.spy()
  const deserializeUserSpy = sinon.spy()

  const setupPassport = proxyquire("../src/passport", {
    "./strategies": {
      useApp() {
        useAppSpy()
        return Promise.resolve("useApp")
      },
      useEmail() {
        useEmailSpy()
        return Promise.resolve("useEmail")
      },
      useUser() {
        useUserSpy()
        return Promise.resolve("useUser")
      },
      useCode() {
        useCodeSpy()
        return Promise.resolve("useCode")
      },
      useToken(sec) {
        useTokenSpy(sec)
        return Promise.resolve("useToken")
      },
      useRefresh() {
        useRefreshSpy()
        return Promise.resolve("useRefresh")
      },
      useClientId() {
        useClientIdSpy()
        return Promise.resolve("useClientId")
      },
      serializeUser() {
        serializeUserSpy()
        return Promise.resolve("serializeUser")
      },
      deserializeUser() {
        deserializeUserSpy()
        return Promise.resolve("deserializeUser")
      }
    }
  })

  const result = await setupPassport({ secret })

  t.ok(
    useUserSpy.calledOnce,
    "ensure the useUser strategy is set up"
  )
  t.ok(
    useAppSpy.calledOnce,
    "ensure the useApp strategy is set up"
  )
  t.ok(
    useEmailSpy.calledOnce,
    "ensure the useEmail strategy is set up"
  )
  t.ok(
    useTokenSpy.calledWith(secret),
    "ensure the useToken strategy is set up"
  )
  t.ok(
    useRefreshSpy.calledOnce,
    "ensure the useRefresh strategy is set up"
  )
  t.ok(
    useClientIdSpy.calledOnce,
    "ensure the useClientId strategy is set up"
  )
  t.ok(
    serializeUserSpy.calledOnce,
    "ensure the serializeUser strategy is set up"
  )
  t.ok(
    deserializeUserSpy.calledOnce,
    "ensure the deserializeUser strategy is set up"
  )
  t.deepEqual(
    result, [
      "serializeUser",
      "deserializeUser",
      "useUser",
      "useEmail",
      "useCode",
      "useRefresh",
      "useToken",
      "useClientId",
      "useApp"
    ],
    "resolves once all strategies have been employed"
  )

  t.end()
})
