const mongoose = require("mongoose")
const {
  generateBase64String,
  createPbkdf2Hash,
  hasExpired,
  parseToken,
  signJwt
} = require("./helpers")

/**
 * A registered user.
 *
 * @typedef {Object<string, any>} User
 * @property {string} email The registered user's email address
 * @property {string} name The registered user's name
 * @property {string} hash The password hash
 * @property {string} salt The sensitive value used to generate the user's cryptographic password hash
 * @property {string} accessToken The last access token for the user
 * @property {string} [profile] An optional base64 encoded PNG profile photo
 * @property {boolean} hasTokenExpired Whether the current `accessToken` has expired
 * @property {function} clearToken A method that will remove the existing `accessToken`
 * @property {function} generateJwt A method that generates a JWT
 * @property {function} setAccessToken A method that sets this `accessToken` with a new value
 * @property {function} setPassword A method that generates a new cryptographic hash from a provided password value (using the salt too)
 */
const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  profile: String,
  hash: String,
  salt: String,
  accessToken: String
})


UserSchema.methods.clearToken = function clearToken() {
  this.accessToken = null
}

UserSchema.methods.generateJwt = function generateJwt(numOfMinutesUntilExpires) {
  return signJwt({
    _id: this._id,
    email: this.email,
    name: this.name
  }, numOfMinutesUntilExpires)
}

UserSchema.methods.setAccessToken = function setAccessToken() {
  this.accessToken = this.generateJwt()
}

UserSchema.methods.setPassword = function setPassword(password) {
  this.salt = generateBase64String()
  this.hash = createPbkdf2Hash(password)
}

UserSchema.methods.validPassword = function validPassword(password) {
  return createPbkdf2Hash(password) === this.hash
}

UserSchema.virtual("hasTokenExpired").get(function hasTokenExpired() {
  return !this.accessToken || hasExpired(parseToken(this.accessToken).exp)
})

UserSchema.set("toJSON", {
  getters: true,
  virtuals: true
})

module.exports = UserSchema
