const mongoose = require("mongoose")

/**
 * Retrieves a `Token` record by a provided access token value
 *
 * @function
 * @name findTokenByAccessToken
 * @param {string} accessToken The security access token that corresponds to the full Token record
 * @returns {Promise<Token>} A promise that returns the token instance itself
 */
function findTokenByAccessToken(accessToken) {
  const Token = mongoose.model("Token")

  return new Promise((resolve, reject) => {
    Token.findOne({ accessToken })
      .populate("application", "clientId clientSecret")
      .populate("requester", "email _id")
      .exec((err, token) => {
        if (err) reject(err)
        else resolve(token)
      })
  })
}

/**
 * Retrieves a `Token` record by a provided auth code
 *
 * @function
 * @name findTokenByCode
 * @param {string} code The auth code used to sign JWTs associated with a particular `Token` record
 * @param {string[]} [populateArgs=["code"]] A tuple that names the linked document and any fields (space-separated) to isolate in the linked document
 * @returns {Promise<Token>} A promise that returns the token instance itself
 */
function findTokenByCode(code, populateArgs = ["code"]) {
  const Token = mongoose.model("Token")

  return new Promise((resolve, reject) => {
    Token.findOne({code})
      .populate("application", "clientId clientSecret")
      .populate(...populateArgs)
      .exec((err, token) => {
        if (err) reject(err)
        else resolve(token)
      })
  })
}

/**
 * Removes a `Token` record after finding it by access token
 *
 * @function
 * @name removeTokenByAccessToken
 * @param {string} accessToken The security access token that corresponds to the full Token record
 * @returns {Promise<boolean>} A promise that returns `true` if the token was removed successfully
 */
function removeTokenByAccessToken(accessToken) {
  const Token = mongoose.model("Token")

  return new Promise((resolve, reject) => {
    Token.findOneAndRemove({ accessToken }, err => {
      if (err) reject(err)
      else resolve(true)
    })
  })
}

/**
 * Retrieves a `Token` record by a provided refresh token
 *
 * @function
 * @name findTokenByRefreshToken
 * @param {string} refreshToken A base64-encoded string used to generate new access tokens for a given token record
 * @param {string[]} [populateArgs=["application","clientId clientSecret"]] A tuple that names the linked document and any fields (space-separated) to isolate in the linked document
 * @returns {Promise<Token>} A promise that returns the token instance itself
 */
function findTokenByRefreshToken(refreshToken, populateArgs = ["application", "clientId clientSecret"]) {
  const Token = mongoose.model("Token")

  return new Promise((resolve, reject) => {
    Token.findOne({ refreshToken })
      .populate(...populateArgs)
      .exec((err, token) => {
        if (err) reject(err)
        else resolve(token)
      })
  })
}

/**
 * Retrieves an `App` record by a provided client ID & secret value
 *
 * @function
 * @name findAppByClientIdAndSecret
 * @param {string} clientId The unique identifier for the registered application
 * @param {string} clientSecret The secret value associated with the registered application
 * @returns {Promise<App>} A promise that returns the registered application instance itself
 */
function findAppByClientIdAndSecret(clientId, clientSecret) {
  const App = mongoose.model("App")

  return new Promise((resolve, reject) => {
    const args = {clientId}

    if (clientSecret) {
      args.clientSecret = clientSecret
    }

    App.findOne(args).exec((err, app) => {
      if (err) reject(err)
      else resolve(app)
    })
  })
}

/**
 * Retrieves a `User` record by a provided user id
 *
 * @function
 * @name findUserById
 * @param {string} userId The unique identifier for the user
 * @param {string} [selectFields=""] One or more field names (space-separated) to isolate in the returned `User` (use leading -hyphens to omit fields)
 * @returns {Promise<User>} A promise that returns the user instance itself
 */
async function findUserById(userId, selectFields) {
  const User = mongoose.model("User")

  return new Promise((resolve, reject) => {
    function callback(err, user) {
      if (err) reject(err)
      else resolve(user)
    }

    if (selectFields) {
      User.findOne({ _id: userId }, selectFields, callback)
    } else {
      User.findOne({ _id: userId }, callback)
    }
  })
}

/**
 * Retrieves a `User` record by a provided user email address
 *
 * @function
 * @name findUserByEmail
 * @param {string} email The email address for the user
 * @returns {Promise<User>} A promise that returns the user instance itself
 */
async function findUserByEmail(email) {
  const User = mongoose.model("User")

  return new Promise((resolve, reject) => {
    User.findOne({ email }, (err, user) => {
      if (err) reject(err)
      else resolve(user)
    })
  })
}

/**
 * Creates a new `Token` record for a given `User` and registered `App`
 *
 * @function
 * @name createToken
 * @param {User} user An instance of a `User` model
 * @param {App} app An instance of an `App` model
 * @returns {Promise<string>} A promise that returns the `code` for the newly genreated `Token` (which is used to sign JWTs)
 */
async function createToken(user, app) {
  const Token = mongoose.model("Token")

  return new Promise((resolve, reject) => {
    const token = new Token()

    token.requester = user
    token.application = app

    token.setCode()
    token.save((err, { code }) => {
      if (err) reject(err)
      else resolve(code)
    })
  })
}

/**
 * Creates a new `App` record from a name and redirect URL
 *
 * @function
 * @name createApp
 * @param {string} name A name for the registered application
 * @param {string} [redirectUri] A URL to redirect users to after authenticating
 * @returns {Promise<App>} A promise that returns the newly generated `App`
 */
async function createApp(name, redirectUri) {
  const App = mongoose.model("App")

  return new Promise((resolve, reject) => {
    const app = new App()

    app.name = name
    app.redirectUri = decodeURIComponent(redirectUri)

    app.setClientId()
    app.setClientSecret()
    app.save(err => {
      if (err) reject(err)
      else resolve(app)
    })
  })
}

/**
 * Creates a new `User` record from the provided values
 *
 * @function
 * @name createUser
 * @param {string} name A name for the registered user
 * @param {string} email A name for the registered user
 * @param {string} password A name for the registered user
 * @param {string} [profileImg] An optional base64-encoded PNG string
 * @returns {Promise<User>} A promise that returns the newly generated `User`
 */
async function createUser(name, email, password, profileImg) {
  const User = mongoose.model("User")

  return new Promise((resolve, reject) => {
    const user = new User()

    user.name = name
    user.email = email
    user.profile = profileImg

    user.setPassword(password)
    user.save((err, usr) => {
      if (err) reject(err)
      else resolve(usr)
    })
  })
}

module.exports = {
  createApp,
  createUser,
  createToken,
  findUserById,
  findUserByEmail,
  findTokenByCode,
  findTokenByAccessToken,
  findTokenByRefreshToken,
  findAppByClientIdAndSecret,
  removeTokenByAccessToken
}
