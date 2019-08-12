const {
  serializeUser,
  deserializeUser,
  useUser,
  useApp,
  useEmail,
  useCode,
  useClientId,
  useRefresh,
  useToken
} = require("./strategies")

/**
 * Initializes passport, configuring it to translate its internal authentication methods to those used in this service.
 *
 * @function
 * @name setupPassport
 * @param {string} config.secret A sensitive value used to sign/seal JWTs
 */
function setupPassport(config) {
  return Promise.all([
    serializeUser(),
    deserializeUser(),
    useUser(),
    useEmail(),
    useCode(),
    useRefresh(),
    useToken(config.secret),
    useClientId(),
    useApp()
  ])
}

module.exports = setupPassport
