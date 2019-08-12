const mongoose = require("mongoose")
const {signJwt, hasExpired, parseToken} = require("./helpers")

/**
 * A token for a registered user. This includes the literal token (aka "access token") as well as other values that are used alongside it.
 *
 * @typedef {Object<string, any>} Token
 * @property {Date} requested The date the token was requested
 * @property {string} code The authorization code that is used to sign the base64 encoded JWT
 * @property {string} accessToken The actual token (should be a base64 encoded JWT)
 * @property {string} [refreshToken] An optional token that can be used to generate a new `accessToken` once the previous one has expired
 * @property {boolean} hasCodeExpired Whether the code used to sign the JWT is expired
 * @property {boolean} hasTokenExpired Whether the current `accessToken` has expired
 * @property {function} clearToken A method that will remove the existing `accessToken`
 * @property {function} setAccessToken A method that sets the `accessToken` to the provided value
 * @property {function} setCode A method that clears the existing token and generates a new code that will be used for generating the next `accessToken`
 * @property {function} validateCode A method that checks whether a given value matches the code used to generate te access token
 */
const TokenSchema = new mongoose.Schema({
  requester: {
    type: mongoose.Schema.ObjectId,
    ref: "User"
  },
  application: {
    type: mongoose.Schema.ObjectId,
    ref: "App"
  },
  requested: {
    type: Date,
    default: Date.now
  },
  code: String,
  accessToken: String,
  refreshToken: String
})

TokenSchema.methods.clearToken = function clearToken() {
  this.accessToken = null
}

TokenSchema.methods.setAccessToken = function setAccessToken(token) {
  this.accessToken = token
}

TokenSchema.methods.setCode = function setCode(numOfMinutesUntilExpires) {
  this.clearToken()
  this.code = signJwt(numOfMinutesUntilExpires)
}

TokenSchema.methods.validateCode = function validateCode(code) {
  return code && this.code === code && !this.hasCodeExpired
}

TokenSchema.virtual("hasCodeExpired").get(function hasCodeExpired() {
  return !this.code || hasExpired(parseToken(this.code).exp)
})

TokenSchema.virtual("hasTokenExpired").get(function hasTokenExpired() {
  return !this.accessToken || hasExpired(parseToken(this.accessToken).exp)
})

TokenSchema.set("toJSON", {
  getters: true,
  virtuals: true
})

module.exports = TokenSchema
