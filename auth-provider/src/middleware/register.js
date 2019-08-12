const {createApp, createUser} = require("../db/client")
const {
  isValidUri,
  sendResponse,
  emailRegex,
  passwordRegex,
  sendErrorResponse
} = require("./helpers")

/**
 * Checks that the `redirect_uri` (part of either the query string or request body) is a valid URI
 *
 * @function
 * @name validateUri
 * @param {string} [req.body.redirect_uri] The URL for the registered application (which user's will be redirected to after authentication)
 * @param {string} [req.query.redirect_uri] The URL for the registered application (which user's will be redirected to after authentication)
 * @param {object} res The HTTP Response object
 * @param {function} next The Express middleware static function that continues middelware execution forward
 */
function validateUri(req, res, next) {
  const uri = (req.query && req.query.redirect_uri) || (req.body && req.body.redirect_uri)

  if (uri != null && isValidUri(decodeURIComponent(uri))) {
    req.redirectUri = decodeURIComponent(uri)
    next()
  }

  sendErrorResponse(res, 400, `Invalid redirect URL '${uri}'`)
}

/**
 * Responds to a new user registration request and attempts to create the corresponding `User` record
 *
 * @function
 * @name sendRegistrationResponse
 * @param {string} req.body.name The name the user provided during registration
 * @param {string} req.body.email The email the user provided during registration
 * @param {string} req.body.password The password the user provided during registration
 * @param {string} req.body.confirm_password The password confirmation the user provided during registration
 * @param {string} [req.body.profile] The base64 encoded PNG string for the user's profile image
 * @param {object} res The HTTP Response object
 */
async function sendRegistrationResponse(req, res) {
  const { name, email, profile, password, confirm_password } = req.body || {}

  if (!name || !email || !password) {
    sendErrorResponse(res, 400, "Name, Email and Password are all required to register")
  } else if (!passwordRegex.test(password)) {
    /* eslint-disable-next-line max-len */
    sendErrorResponse(res, 400, "Password must be alpha-numeric (mixed-case) contain at least one symbol and span between 8 and 20 characters in length.")
  } else if (password !== confirm_password) {
    sendErrorResponse(res, 400, "Password and confirmation did not match.")
  } else if (!emailRegex.test(email)) {
    sendErrorResponse(res, 400, "The email address you entered is not valid (or perhaps unusual).")
  } else {
    try {
      const user = await createUser(name, email, password, profile)

      sendResponse(res, 200, {
        user_id: user._id,
        message: "You have been successfully registered."
      })
    } catch (err) {
      sendErrorResponse(res, 500, err)
    }
  }
}

/**
 * Processes the submitted application registration and attempts to create a new `App` from it
 *
 * @function
 * @name sendApplicationRegistrationResponse
 * @param {string} req.body.name The app name the user provided during registration
 * @param {string} req.body.redirect_uri The URL for the registered application (which user's will be redirected to after authentication)
 * @param {object} res The HTTP Response object
 */
async function sendApplicationRegistrationResponse(req, res) {
  const { name: appName, redirect_uri } = req.body || {}

  if (!appName || !redirect_uri) {
    sendErrorResponse(res, 400, "Application Name and URL are required to register")
  } else {
    try {
      const { clientId, clientSecret } = await createApp(appName, redirect_uri)

      sendResponse(res, 200, {
        client_id: clientId,
        client_secret: clientSecret
      })
    } catch (err) {
      sendErrorResponse(res, 500, err)
    }
  }
}

/**
 * Renders a user registration view if the `user` is not present on the request object
 *
 * @function
 * @name sendRegistrationPage
 * @param {object} req.user A `User` instance that is used to drive whether to render the registration page or send them home
 * @param {string} [req.message] An optional message to display in the registration view
 * @param {function} res.render A method that renders the desired view
 */
function sendRegistrationPage(req, res) {
  if (!req.user) {
    res.render("register", {
      title: "Registration Form",
      message: req.message || "",
      password_pattern: passwordRegex.toString().replace(/\//g, "").replace("$i", ""),
      email_pattern: emailRegex.toString().replace(/\//g, "").replace("$i", "")
    })
  } else {
    res.redirect("/")
  }
}

/**
 * Renders an application registration page
 *
 * @function
 * @name sendApplicationRegistrationPage
 * @param {string} [req.message] An optional message to display in the registration view
 * @param {function} res.render A method that renders the desired view
 */
function sendApplicationRegistrationPage(req, res) {
  res.render("registerapp", {
    title: "Application Registration",
    message: req.message || ""
  })
}

module.exports = {
  validateUri,
  sendApplicationRegistrationResponse,
  sendApplicationRegistrationPage,
  sendRegistrationResponse,
  sendRegistrationPage
}
