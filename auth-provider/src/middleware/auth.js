const atob = require("atob")
const btoa = require("btoa")
const jwt = require("jsonwebtoken")
const passport = require("passport")
const querystring = require("querystring")
const {parseToken} = require("../db/helpers")
const {
  sendResponse,
  parseRedirectUri,
  sendErrorResponse
} = require("./helpers")
const {
  createToken,
  findUserById,
  findTokenByCode,
  findTokenByAccessToken,
  findTokenByRefreshToken,
  findAppByClientIdAndSecret,
  removeTokenByAccessToken
} = require("../db/client")

/**
 * Retrieves the access token from the raw Request object at one of three possible locations and places it at `req.token`.
 *
 * @function
 * @name parseTokenFromRequest
 * @param {string} [req.headers.authorization] A potential location for the access token (if using "Bearer" auth)
 * @param {string} [req.body.access_token] A potential location for the access token
 * @param {string} [req.query.access_token] A potential location for the access token
 * @param {Object<string, any>} res The HTTP Response
 * @param {function} next Standard connect middleware function that pushes execution forward
 */
/* eslint-disable-next-line consistent-return */
function parseTokenFromRequest(req, res, next) {
  if (req.headers && /Bearer\s\S+/i.test(req.headers.authorization || req.headers.Authorization)) {
    /* eslint-disable-next-line prefer-destructuring */
    req.token = (req.headers.authorization || req.headers.Authorization).split(" ")[1]
  } else if (req.body && (req.body.access_token || req.body.accessToken)) {
    req.token = req.body.access_token || req.body.accessToken
  } else if (req.query && (req.query.access_token || req.query.accessToken)) {
    req.token = req.query.access_token || req.query.accessToken
  }

  next()
}

/**
 * A simple piece of middleware that parses the `state` property from either the
 * query string or the request body and places it at the root level of the request object.
 *
 * @function
 * @name parseState
 * @param {string} [req.query.state] If the `state` value is on the query string
 * @param {string} [req.body.state] If the `state` value is in the request body
 * @param {Object<string, any>} res The HTTP Response
 * @param {function} next Standard connect middleware function that pushes execution forward
 */
function parseState(req, res, next) {
  if (req.query && req.query.state) {
    req.state = req.query.state
  } else if (req.body && req.body.state) {
    req.state = req.body.state
  }
  next()
}

/**
 * Retrieves an app's client id and secret value from one of three possible locations on the request object.
 *
 * @function
 * @name parseClientCredentialsFromRequest
 * @param {string} [req.headers.authorization] A potential location for the app client id and secret (if using "Basic" auth)
 * @param {string} [req.body.client_id] A potential location for the app client id
 * @param {string} [req.query.client_id] A potential location for the app client id
 * @param {string} [req.body.client_secret] A potential location for the app secret
 * @param {string} [req.query.client_secret] A potential location for the app secret
 * @param {Object<string, any>} res The HTTP Response
 * @param {function} next Standard connect middleware function that pushes execution forward
 */
function parseClientCredentialsFromRequest(req, res, next) {
  if (req.headers && /Basic\s\S+/i.test(req.headers.authorization || req.headers.Authorization)) {
    ({
      0: req.clientId,
      1: req.clientSecret
    } = atob((req.headers.authorization || req.headers.Authorization).split(" ")[1]).split(":"))
  } else if (req.body && req.body.client_id) {
    req.clientId = atob(req.body.client_id)
    req.clientSecret = req.body.client_secret ? atob(req.body.client_secret) : null
  } else if (req.query && req.query.client_id) {
    req.clientId = atob(req.query.client_id)
    req.clientSecret = req.query.client_secret ? atob(req.query.client_secret) : null
  }

  next()
}

/**
 * Because the `validateToken()` middleware has to verify JWTs, a sensitive
 * "secret" value must be provided and captured in a closure for it to use.
 * This factory function is simply to rely on directly provided values instead
 * of global APIs that are a little harder to test (personal preference).
 *
 * @function
 * @name createTokenValidator
 * @param {string} secret A sensistive value used to sign JWTs
 * @returns {function} A middleware function that is ready to validate JWTs
 */
function createTokenValidator(secret) {
  /**
   * Ensures a given access token is still valid and generated through this service.
   * If valid, the corresponding `userId` is placed onto the Request object
   *
   * @function
   * @name validateToken
   * @param {string} req.token The access token, obtained from the request headers
   * @param {string} req.clientId The application's client id, parsed in an earlier piece of middleware (which is used to verify the token was issued for this application)
   * @param {string} req.clientSecret The application's client id, parsed in an earlier piece of middleware (which is used to verify the token was issued for this application)
   * @param {Object<string, any>} res The HTTP Response
   * @param {function} next Standard connect middleware function that pushes execution forward
   */
  return async function validateToken(req, res, next) {
    const { clientId, clientSecret } = req

    if (!req.token) {
      sendErrorResponse(res, 400, "No token was provided to validate")
    } else if (!clientId) {
      sendErrorResponse(res, 400, "`client_id` missing from the request body / header")
    } else if (!clientSecret) {
      sendErrorResponse(res, 400, "`client_secret` missing from the request body / header")
    } else {
      try {
        const token = await findTokenByAccessToken(req.token)

        if (!token) {
          sendErrorResponse(res, 401, "Unknown token")
        } else if (token.hasTokenExpired) {
          sendErrorResponse(res, 401, "Access token has expired. Please sign in again.")
        } else if (token.requester.email !== parseToken(token.accessToken).email) {
          sendErrorResponse(res, 403, "This token was generated for a different user.")
        } else {
          jwt.verify(token.accessToken, secret, err2 => {
            if (err2) {
              sendErrorResponse(res, 403, "Forged! Access Token was not issued here.")
            } else if (token.application.clientId !== clientId || token.application.clientSecret !== clientSecret) {
              sendErrorResponse(res, 403, "This token was not issued to this client.")
            } else {
              req.userId = token.requester._id
              next()
            }
          })
        }
      } catch (err) {
        sendErrorResponse(res, 500, "An error occurred validating the access token")
      }
    }
  }
}

/**
 * Validates a given user's email and password, and places the associated `userId` onto the Request middleware object
 *
 * @function
 * @name validateUser
 * @param {Object<string, any>} req The HTTP Request
 * @param {Object<string, any>} res The HTTP Response
 * @param {function} next Standard connect middleware function that pushes execution forward
 */
function validateUser(req, res, next) {
  if (!req.body || !req.body.email || !req.body.password) {
    sendErrorResponse(res, 400, "Email and Password are both required to login")
  } else {
    passport.authenticate("user", (err, user, _info) => {
      if (err) {
        sendErrorResponse(res, 500, "Error authenticating user")
      } else if (!user) {
        sendErrorResponse(res, 401, "Could not verify user")
      } else {
        req.userId = user._id

        next()
      }
    })(req, res)
  }
}

/**
 * Validates the client id and secret from the Request object.
 * The App's corresponding `redirect_uri`, `clientId`, and `app_name` are placed onto the Request object if found.
 *
 * @function
 * @name validateClientIdAndSecret
 * @param {string} req.clientId The application's client id, parsed in an earlier piece of middleware
 * @param {string} req.clientSecret The application's client id, parsed in an earlier piece of middleware
 * @param {string} [req.redirectUri] The redirect URL for the app (might be on the Request object from earlier middleware)
 * @param {Object<string, any>} res The Http Response
 * @param {function} next Standard connect middleware function that pushes execution forward
 */
async function validateClientIdAndSecret(req, res, next) {
  const { clientId, clientSecret } = req

  if (!clientId) {
    sendErrorResponse(res, 400, "`client_id` missing from the request body / header")
  } else if (!clientSecret) {
    sendErrorResponse(res, 400, "`client_secret` missing from the request body / header")
  } else {
    try {
      const app = await findAppByClientIdAndSecret(clientId, clientSecret)

      if (!app) {
        sendErrorResponse(res, 401, `Unknown client application ${clientId}`)
      } else {
        req.app_name = app.name
        req.client_id = clientId
        req.redirect_uri = parseRedirectUri(req.redirectUri, app.redirectUri)

        next()
      }
    } catch (err) {
      sendErrorResponse(res, 500, "An error occurred validating the client credentials")
    }
  }
}

/**
 *
 * @function
 * @name validateAuthCode
 * @param {string} req.body.code An auth code associated with a `Token`
 * @param {string} req.clientId The application's client id, parsed in an earlier piece of middleware (which is used to verify the token was issued for this application)
 * @param {string} req.clientSecret The application's client id, parsed in an earlier piece of middleware (which is used to verify the token was issued for this application)
* @param {Object<string, any>} res The Http Response
 * @param {function} next Standard connect middleware function that pushes execution forward
 */
async function validateAuthCode(req, res, next) {
  const { clientId, clientSecret } = req
  const authCode = req.code
    || (req.body && req.body.code)
    || (req.query && req.query.code)

  if (!authCode) {
    sendErrorResponse(res, 400, "No authorization `code` was provided in the request body")
  } else if (!clientId) {
    sendErrorResponse(res, 400, "`client_id` missing from the request body / header")
  } else if (!clientSecret) {
    sendErrorResponse(res, 400, "`client_secret` missing from the request body / header")
  } else {
    try {
      const code = atob(authCode)
      const token = await findTokenByCode(code)

      if (!token) {
        sendErrorResponse(res, 401, `Unknown authorization code ${code}`)
      } else if (token.hasCodeExpired) {
        sendErrorResponse(res, 401, "Auth code expired. Please restart authentication.")
      } else if (!token.validateCode(code)) {
        sendErrorResponse(res, 403, `The auth code '${code}' is invalid.`)
      } else if (token.application.clientId !== clientId || token.application.clientSecret !== clientSecret) {
        sendErrorResponse(res, 403, "This code was not issued to this client.")
      } else {
        next()
      }
    } catch (err) {
      sendErrorResponse(res, 500, "An error occurred validating the auth code")
    }
  }
}

/**
 *
 * @function
 * @name grantAuthorization
 * @param {string} req.userId The validated user's unique id (placed there from an earlier middleware function)
 * @param {string} req.clientId The registered application's unique identifier that the user registered through (placed there from an earlier middleware function)
 * @param {Object<string, any>} res The Http Response
 * @param {function} next Standard connect middleware function that pushes execution forward
 */
async function grantAuthorization(req, res, next) {
  if (!req.clientId) {
    sendErrorResponse(res, 400, "Client Id must provided before authorizing.")
  } else if (!req.userId) {
    sendErrorResponse(res, 400, "User Id must provided before authorizing.")
  } else {
    try {
      const app = await findAppByClientIdAndSecret(req.clientId)

      if (!app) {
        sendErrorResponse(res, 401, `Unknown application ${req.clientId}`)
      } else {
        const user = await findUserById(req.userId)

        if (!user) {
          sendErrorResponse(res, 401, `Unknown user ${req.userId}`)
        } else {
          const code = await createToken(user, app)
          req.authorization_code = code
          next()
        }
      }
    } catch (err) {
      sendErrorResponse(res, 500, "An error occurred granting authorization")
    }
  }
}

/**
 * Checks a given refresh token is valid and that its token was make for the app's client id & secret.
 *
 * @function
 * @name validateRefreshToken
 * @param {Object<string, any>} req The Http Request
 * @param {string} req.clientId The application's client id, parsed in an earlier piece of middleware (which is used to verify the user's refresh token was associated with this application)
 * @param {string} req.clientSecret The application's client secret value, parsed in an earlier piece of middleware (which is used to verify the user's refresh token was associated with this application)
 * @param {Object<string, any>} res The Http Response
 * @param {function} next Standard connect middleware function that pushes execution forward
 */
async function validateRefreshToken(req, res, next) {
  const refreshToken = req.refreshToken
    || (req.body && req.body.refresh_token)
    || (req.query && req.query.refresh_token)

  if (!refreshToken) {
    sendErrorResponse(res, 400, "No `refresh_token` was provided in the request body")
  } else if (!req.clientId) {
    sendErrorResponse(res, 400, "client_id missing from the request query string (or request body)")
  } else if (!req.clientSecret) {
    sendErrorResponse(res, 400, "client_secret missing from the request query string (or request body)")
  } else {
    try {
      const token = await findTokenByRefreshToken(refreshToken)

      if (!token) {
        sendErrorResponse(res, 401, "Unknown refresh token")
      } else {
        const { clientId, clientSecret } = req

        if (token.application.clientId !== clientId || token.application.clientSecret !== clientSecret) {
          sendErrorResponse(res, 403, "This client not allowed to use this refresh token.")
        } else {
          next()
        }
      }
    } catch (err) {
      sendErrorResponse(res, 500, "An error occurred validating the refresh token")
    }
  }
}

/**
 * Checks a given application client id and places the corresponding registered app data onto the Request object and moves execution forward.
 *
 * @function
 * @name validateAuthRequest
 * @param {string} req.clientId The application's client id, parsed in an earlier piece of middleware
 * @param {string} [req.redirectUri] The redirect URL for the app (might be on the Request object from earlier middleware)
 * @param {string} req.query.response_type An OAuth response type (either "code" or "token")
 * @param {Object<string, any>} res The HTTP Response
 * @param {function} next Standard connect middleware function that pushes execution forward
 */
async function validateAuthRequest(req, res, next) {
  const { clientId } = req

  if (!clientId) {
    sendErrorResponse(res, 400, "`client_id` missing from the request body / header")
  } else if (!req.query || !req.query.response_type) {
    sendErrorResponse(res, 400, "response_type was not specified")
  } else if (!/(code|token)/i.test(req.query.response_type)) {
    sendErrorResponse(res, 400, `response_type ${req.query.response_type} is invalid`)
  } else {
    try {
      const app = await findAppByClientIdAndSecret(clientId)

      if (!app) {
        sendErrorResponse(res, 401, `Unknown client application: ${atob(clientId)}`)
      } else {
        req.app_name = app.name
        req.client_id = clientId
        req.redirect_uri = parseRedirectUri(req.redirectUri, app.redirectUri)

        next()
      }
    } catch (err) {
      sendErrorResponse(res, 500, "An error occurred validating the client application")
    }
  }
}

/**
 * Refreshes a given access token using a refresh token, and places the `token` onto the Request object and moves forward.
 *
 * @function
 * @name refreshAccessToken
 * @param {string} req.body.refresh_token A base64 encoded string that is used to generate new access tokens
 * @param {Object<string, any>} res The HTTP Response
 * @param {function} next Standard connect middleware function that pushes execution forward
 */
async function refreshAccessToken(req, res, next) {
  const refreshToken = req.refreshToken
    || (req.body && req.body.refresh_token)
    || (req.query && req.query.refresh_token)

  if (!refreshToken) {
    sendErrorResponse(res, 400, "refresh_token missing from the request query string (or request body)")
  } else {
    try {
      const token = await findTokenByRefreshToken(refreshToken, ["requester", "generateJwt"])

      if (!token) {
        sendErrorResponse(res, 403, "Unable to find a matching token")
      } else {
        token.setAccessToken(token.requester.generateJwt())
        token.save((err2, { accessToken }) => {
          if (err2) sendErrorResponse(res, 500, "Unable to refresh the access token")
          else {
            req.token = accessToken
            next()
          }
        })
      }
    } catch (err) {
      sendErrorResponse(res, 500, "An error occurred refreshing the access token")
    }
  }
}

/**
 * Generates a new access token using the auth code associated with a user's `Token` record (for signing/sealing JWTs),
 * places it onto the Request object and moves forward.
 *
 * @function
 * @name generateAccessToken
 * @param {string} [req.body.code] One possible location for the auth code created for a new `Token` record that is used to sign/seal JWTs
 * @param {string} [req.query.code] Another possible location for the auth code created for a new `Token` record that is used to sign/seal JWTs
 * @param {string} [req.code] Another possible location for the auth code created for a new `Token` record that is used to sign/seal JWTs
 * @param {Object<string, any>} res The HTTP Response
 * @param {function} next Standard connect middleware function that pushes execution forward
 */
async function generateAccessToken(req, res, next) {
  if (!req.code || (req.body && !req.body.code) || (req.query && !req.query.code)) {
    sendErrorResponse(res, 400, "Authorization code could not be found on the request.")
  } else {
    try {
      const code = atob(req.code || req.body.code || req.query.code)
      const token = await findTokenByCode(code, ["requester", "generateJwt"])

      if (token) {
        token.setAccessToken(token.requester.generateJwt())
        token.save((err2, { accessToken }) => {
          if (err2) {
            sendErrorResponse(res, 500, "Unable to create token")
          } else {
            req.token = accessToken
            next()
          }
        })
      } else {
        sendErrorResponse(res, 400, "Unknown Authorization Code")
      }
    } catch (err) {
      sendErrorResponse(res, 500, "An error occurred creating the access token")
    }
  }
}

/**
 * Revokes a given access token
 *
 * @function
 * @name revokeAccessToken
 * @param {Object<string, any>} req The HTTP Request
 * @param {Object<string, any>} res The HTTP Response
 * @param {function} next Standard connect middleware function that pushes execution forward
 */
async function revokeAccessToken(req, res, next) {
  try {
    await removeTokenByAccessToken(req.token)
    next()
  } catch (err) {
    sendErrorResponse(res, 500, "An error occurred revoking the access token")
  }
}

/**
 * Redirects the user to the URI registered for their app, providing the authorization code in the query string
 *
 * @function
 * @name sendBackToReferrer
 * @param {string} req.authorization_code An auth code generated by the provider
 * @param {string} [req.redirectUri] A URI to redirect the user
 * @param {function} res.redirect A method that will force the flow to redirect to a a given URL
 */
function sendBackToReferrer(req, res) {
  res.redirect(`${
    req.redirectUri ? req.redirectUri : ""
  }?${
    querystring.stringify({ code: btoa(req.authorization_code) })
  }`)
}

/**
 * Retrieves the token from the request object (ie, earlier middleware function put it there) and sends it to the user
 *
 * @function
 * @name sendToken
 * @param {string} req.token The base64 encoded access token
 * @param {Object<string, any>} res The HTTP Response
 */
function sendToken(req, res) {
  sendResponse(res, 200, { token: btoa(req.token) })
}

/**
 * Sends back the user id corresponding to the provided token
 *
 * @name sendUserId
 * @param {string} req.userId The unique identifier for the user
 * @param {Object<string, any>} res The HTTP Response
 */
function sendUserId(req, res) {
  sendResponse(res, 200, {
    message: "Token is valid",
    user_id: req.userId
  })
}

/**
 * Renders an authorization view
 *
 * @function
 * @name sendAuthorizationPage
 * @param {string} [req.message] The message to provide to the user in the view itself
 * @param {string} req.title The title for the view
 * @param {string} req.app_name The name of te app being authorized through the view
 * @param {string} req.client_id The unique identifier for the registered app the user is authenticating into
 * @param {function} res.render A method that will render a view
 */
function sendAuthorizationPage(req, res) {
  res.render("authorize", {
    title: "Authorization Form",
    message: req.message || "",
    app_name: req.app_name,
    client_id: btoa(req.client_id)
  })
}

/**
 * Sends back a response that the provided token has been revoked
 *
 * @function
 * @name sendRevocationResponse
 * @param {Object<string, any>} req The HTTP Request
 * @param {Object<string, any>} res The HTTP Response
 */
function sendRevocationResponse(req, res) {
  sendResponse(res, 200, { message: "Token has been revoked" })
}

module.exports = {
  createTokenValidator,
  generateAccessToken,
  grantAuthorization,
  parseState,
  parseTokenFromRequest,
  parseClientCredentialsFromRequest,
  refreshAccessToken,
  revokeAccessToken,
  sendAuthorizationPage,
  sendBackToReferrer,
  sendRevocationResponse,
  sendToken,
  sendUserId,
  validateAuthCode,
  validateAuthRequest,
  validateClientIdAndSecret,
  validateRefreshToken,
  validateUser
}
