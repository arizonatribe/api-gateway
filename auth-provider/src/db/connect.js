const mongoose = require("mongoose")

const AppSchema = require("./app.model")
const TokenSchema = require("./token.model")
const UserSchema = require("./user.model")

/**
 * Creates a database connection through mongoose (most likely) to Mongo
 *
 * @function
 * @name connectToDb
 * @throws {Error} When no connection string is provided
 * @param {string} config.connectionString The required connection string to the database instance
 * @returns {Object<string, any>} The database connection (by way of the mongoose ORM)
 */
function setupDb(config = {}) {
  if (!config.connectionString) {
    throw new Error("Missing the connection string to the Mongo database")
  }

  const conn = mongoose.connect(config.connectionString)

  mongoose.model("App", AppSchema)
  mongoose.model("User", UserSchema)
  mongoose.model("Token", TokenSchema)

  return conn
}

module.exports = setupDb
