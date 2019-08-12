const crypto = require("crypto")
const jwt = require("jsonwebtoken")

/**
 * Checks if a given date value is expired (ie, if it is later than now)
 *
 * @function
 * @name hasExpired
 * @param {date|number} expiresIn A (required) numeric representation of a date or a date itself
 * @returns {boolean} Whether or not the provided date value is _later_ than right now
 */
function hasExpired(expiresIn = "") {
  const expiresValue = (typeof expiresIn === "object" && typeof expiresIn.valueOf === "function")
    ? expiresIn.valueOf()
    : +expiresIn

  return (new Date()).valueOf() > (expiresValue || 0)
}

/**
 * Decodes a base64 encoded JWT string into its corresponding JSON
 *
 * @function
 * @name parseToken
 * @param {string} jwtString A base64 encoded JWT string value
 * @returns {Object<string, any>|undefined} The decoded JWT value (if successful) or undefined (if it failed to decode)
 */
/* eslint-disable-next-line consistent-return */
function parseToken(jwtString) {
  try {
    return jwt.decode(jwtString)
  } catch (err) {
    // let it just return undefined if decoding fails
  }
}

/**
 * Creates a randomly generated base64 string value of a specified byte length
 *
 * @function
 * @name generateBase64String
 * @param {number} [numOfBytes=64] The number of bytes that the generated base64 string should be
 * @returns {string} A randomly generated base64 string value
 */
function generateBase64String(numOfBytes = 64) {
  return crypto.randomBytes(numOfBytes).toString("base64")
}

/**
 * Creates a cryptographic hash based on [the PBKDF2 algorithm](https://en.wikipedia.org/wiki/PBKDF2)
 *
 * @function
 * @name createPbkdf2Hash
 * @param {string} salt A random value that is used to create the hash
 * @param {string} secret A sensitive value that is used to create the encryption
 * @param {number} [numOfBytes=64] The number of bytes that the generated base64 string should be
 * @returns {string} A cryptographic key generated from the provided `secret` and `salt` values
 */
function createPbkdf2Hash(salt, secret, numOfBytes = 64) {
  return crypto.pbkdf2Sync(secret, salt, 1000, numOfBytes).toString("base64")
}

/**
 * Creates a cryptographic hash of a given string
 *
 * @function
 * @name createShaHash
 * @param {string} str A value to be hashed
 * @returns {string} A base64-encoded string based on the originally provided value
 */
function createShaHash(str) {
  return crypto.createHash("sha256").update(str, "base64").digest("base64")
}

/**
 * Takes a set of key/value pairs and serializes them into a JWT string
 *
 * @function
 * @name signJwt
 * @param {Object<string, any>} options An object whose key/value pairs will be serialized in the resulting JWT string
 * @param {string} secret A secure value that is used to "sign" the JWT string
 * @param {number} [minutesUntilExpires=60] The number of minutes until it should expire
 * @returns {string} A signed and secure JWT string that contains the serialized `options`
 */
function signJwt(options, secret, minutesUntilExpires = 60) {
  const expiresIn = new Date()
  const exp = expiresIn.setTime(expiresIn.getTime() + (minutesUntilExpires * 60000))

  return jwt.sign({ ...(options || {}), exp }, secret)
}

module.exports = {
  generateBase64String,
  createPbkdf2Hash,
  createShaHash,
  hasExpired,
  parseToken,
  signJwt
}
