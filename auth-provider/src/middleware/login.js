const passport = require("passport")
const {sendResponse, sendErrorResponse} = require("./helpers")

/**
 * Receives a submitted login attempt and tries to authenticate the user
 *
 * @function
 * @name sendLoginResponse
 * @param {string} req.body.email The user's submitted email address
 * @param {string} req.body.password The user's submitted password
 * @param {object} res The HTTP Response object
 */
function sendLoginResponse(req, res) {
  if (!req.body || !req.body.email || !req.body.password) {
    sendErrorResponse(res, 400, "Email and Password are both required to login")
  }

  passport.authenticate("user", (err, user, info) => {
    if (err) sendErrorResponse(res, 404, err)
    else if (user) {
      const token = user.generateJwt()
      sendResponse(res, 200, { token })
    } else {
      sendErrorResponse(res, 401, info)
    }
  })(req, res)
}

/**
 * Renders a login page if the `user` is not on the request object
 *
 * @function
 * @name sendLoginPage
 * @param {object} req.user A `User` instance that is used to drive whether to render the login page or send them home
 * @param {string} [req.message] An optional message to send back for the view
 * @param {object} res The HTTP Response it will send
 */
function sendLoginPage(req, res) {
  if (!req.user) {
    res.render("login", {
      title: "Login Form",
      message: req.message || ""
    })
  } else {
    res.redirect("/")
  }
}

/**
 * Logs the user out and redirects them to their home page
 *
 * @function
 * @name sendLogoutResponse
 * @param {function} req.logout A method used to perform the logout operation
 * @param {function} res.redirect A method used to redirect the user to home
 */
function sendLogoutResponse(req, res) {
  req.logout()
  res.redirect("/")
}

module.exports = {
  sendLoginPage,
  sendLogoutResponse,
  sendLoginResponse
}
