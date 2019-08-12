const router = require("express").Router()

const {
  sendBackToReferrer,
  sendAuthorizationPage,
  sendToken,
  sendUserId,
  sendRevocationResponse,
  generateAccessToken,
  grantAuthorization,
  parseState,
  parseTokenFromRequest,
  parseClientCredentialsFromRequest,
  refreshAccessToken,
  revokeAccessToken,
  validateAuthCode,
  validateAuthRequest,
  validateClientIdAndSecret,
  validateRefreshToken,
  createTokenValidator,
  validateUser
} = require("./middleware/auth")

const {
  sendLoginPage,
  sendLogoutResponse,
  sendLoginResponse
} = require("./middleware/login")

const {
  validateUri,
  sendRegistrationPage,
  sendRegistrationResponse,
  sendApplicationRegistrationPage,
  sendApplicationRegistrationResponse
} = require("./middleware/register")

/**
 * Creates the auth and registration routes for the Express app
 *
 * @function
 * @name createRoutes
 * @param {string} config.secret The JWT secret value used to generate and sign the tokens
 * @returns {Object<string, any>} An instance of the [Express Router](https://expressjs.com/en/api.html#router)
 */
function createRoutes(config) {
  const validateToken = createTokenValidator(config.secret)

  router.get("/register", sendRegistrationPage)
  router.post("/register", sendRegistrationResponse)

  router.get("/registerapp", sendApplicationRegistrationPage)
  router.post("/registerapp", validateUri, sendApplicationRegistrationResponse)

  router.get(
    "/oauth/authorize",
    parseState,
    parseClientCredentialsFromRequest,
    validateUri,
    validateAuthRequest,
    sendAuthorizationPage
  )
  router.post(
    "/oauth/authorize",
    validateUser,
    parseClientCredentialsFromRequest,
    grantAuthorization,
    sendBackToReferrer
  )
  router.post(
    "/oauth/token",
    parseState,
    parseClientCredentialsFromRequest,
    validateClientIdAndSecret,
    validateAuthCode,
    generateAccessToken,
    sendToken
  )
  router.post(
    "/oauth/revoke",
    parseClientCredentialsFromRequest,
    parseTokenFromRequest,
    validateToken,
    revokeAccessToken,
    sendRevocationResponse
  )
  router.post(
    "/oauth/validate",
    parseClientCredentialsFromRequest,
    parseTokenFromRequest,
    validateToken,
    sendUserId
  )
  router.post(
    "/oauth/refresh",
    parseState,
    parseClientCredentialsFromRequest,
    validateClientIdAndSecret,
    validateRefreshToken,
    refreshAccessToken,
    sendToken
  )
  router.get("/login", sendLoginPage)
  router.post(
    "/login",
    validateUser,
    sendLoginResponse
  )
  router.get(
    "/logout",
    parseClientCredentialsFromRequest,
    validateToken,
    sendLogoutResponse
  )

  return router
}

module.exports = createRoutes
