const mongoose = require("mongoose")
const {generateBase64String, createPbkdf2Hash} = require("./helpers")

/**
 * A registered application
 *
 * @typedef {Object<string, any>} App
 * @property {string} name The application's name
 * @property {string} clientId The application's unique identifier
 * @property {string} clientSecret The application's sensitive "secret" value
 * @property {string} salt The application's sensitive value used to generate the client secret
 * @property {string} redirectUri The registered application's URL for the auth provider to redirect back to (after authenticating)
 * @property {string} [refreshToken] An optional token that can be used to generate a new `accessToken` once the previous one has expired
 * @property {boolean} hasCodeExpired Whether the code used to sign the JWT is expired
 * @property {boolean} hasTokenExpired Whether the current `accessToken` has expired
 * @property {function} clearToken A method that will remove the existing `accessToken`
 * @property {function} setClientId A method that sets the `clientId` for the application
 * @property {function} setClientSecret A method that sets the `clientSecret` for the application (generating from the app's `salt`)
 */
const AppSchema = new mongoose.Schema({
  clientId: {
    type: String,
    unique: true,
    required: true
  },
  clientSecret: {
    type: String,
    unique: true,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  redirectUri: {
    type: String,
    required: true
  },
  salt: String
})

AppSchema.methods.setClientId = function setClientId() {
  this.clientId = generateBase64String()
}

AppSchema.methods.setClientSecret = function setClientSecret() {
  this.salt = generateBase64String()
  this.clientSecret = createPbkdf2Hash(this.salt)
}

AppSchema.set("toJSON", { getters: true, virtuals: true })

module.exports = AppSchema
