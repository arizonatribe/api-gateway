const jwt = require("jsonwebtoken")
const passport = require("passport")
const { Strategy: LocalStrategy } = require("passport-local")
const {
  findAppByClientIdAndSecret,
  findTokenByRefreshToken,
  findTokenByAccessToken,
  findTokenByCode,
  findUserByEmail,
  findUserById
} = require("../db/client")

function serializeUser() {
  return new Promise((resolve, reject) => {
    passport.serializeUser((user, done) => {
      if (!user) {
        const err = new Error("user could not be found")
        done(err)
        reject(err)
      } else {
        done(null, user.id)
        resolve(user.id)
      }
    })
  })
}

function deserializeUser() {
  return new Promise((resolve, reject) => {
    passport.deserializeUser(async (id, done) => {
      try {
        const user = await findUserById(id, "-hash -salt")

        if (!user) {
          const err = new Error("user could not be found")
          done(err)
          reject(err)
        } else {
          done(null, user)
          resolve(user)
        }
      } catch (err) {
        done(err)
        reject(err)
      }
    })
  })
}

function useUser() {
  return new Promise((resolve, reject) => {
    passport.use("user", new LocalStrategy({
      usernameField: "email",
      passReqToCallback: true
    }, async (req, email, password, done) => {
      try {
        let err = null
        const user = await findUserByEmail(email)

        if (!user) {
          err = new Error("user could not be found")
        } else if (!user.validPassword(password)) {
          err = new Error("Invalid password")
        }

        if (err) {
          done(err)
          reject(err)
        } else {
          done(err, user)
          resolve(user)
        }
      } catch (err) {
        done(err)
        reject(err)
      }
    }))
  })
}

function useEmail() {
  return new Promise((resolve, reject) => {
    passport.use("email", new LocalStrategy({
      usernameField: "email"
    }, async (email, password, done) => {
      try {
        let err = null
        const user = await findUserByEmail(email)

        if (!user) {
          err = new Error("user could not be found")
        } else if (!user.validPassword(password)) {
          err = new Error("Invalid password")
        }

        if (err) {
          done(err)
          reject(err)
        } else {
          done(err, user)
          resolve(user)
        }
      } catch (err) {
        done(err)
        reject(err)
      }
    }))
  })
}

function useCode() {
  return new Promise((resolve, reject) => {
    passport.use("code", new LocalStrategy({
      usernameField: "code"
    }, async (code, password, done) => {
      try {
        let err = null
        const token = await findTokenByCode(code, ["requester", "generateJwt"])

        if (!token || !code || token.code !== code) {
          err = new Error("Unknown auth code")
        } else if (token.hasCodeExpired) {
          err = new Error("Code is not valid anymore. Please sign in again.")
        }

        if (err) {
          done(err)
          reject(err)
        } else {
          done(err, token)
          resolve(token)
        }
      } catch (err) {
        done(err)
        reject(err)
      }
    }))
  })
}

function useToken(secret) {
  return new Promise((resolve, reject) => {
    passport.use("token", new LocalStrategy({
      usernameField: "token"
    }, async (accessToken, password, done) => {
      try {
        let err = null
        const token = await findTokenByAccessToken(accessToken, ["requester", "email"])

        if (!token) {
          err = new Error("Unknown token")
        } else if (!accessToken || token.accessToken !== accessToken) {
          err = new Error("Invalid Access Token")
        } else if (token.hasTokenExpired) {
          err = new Error("Access token has expired. Please sign in again.")
        } else if (token.requester.email !== token.parseToken(token.accessToken).email) {
          err = new Error("This token was generated for a different user.")
        } else {
          jwt.verify(accessToken, secret, err2 => {
            if (err2) {
              err = new Error("Forged! Access Token was not issued here.")
            }
          })
        }

        if (err) {
          done(err)
          reject(err)
        } else {
          done(err, token)
          resolve(token)
        }
      } catch (err) {
        done(err)
        reject(err)
      }
    }))
  })
}

function useRefresh() {
  return new Promise((resolve, reject) => {
    passport.use("refresh", new LocalStrategy({
      usernameField: "token"
    }, async (refreshToken, password, done) => {
      try {
        let err = null
        const token = await findTokenByRefreshToken(refreshToken, ["requester", "generateJwt"])

        if (!token) {
          err = new Error("Unknown token")
        } else if (!refreshToken || token.refreshToken !== refreshToken) {
          err = new Error("Invalid Refresh Token")
        }

        if (err) {
          done(err)
          reject(err)
        } else {
          done(err, token)
          resolve(token)
        }
      } catch (err) {
        done(err)
        reject(err)
      }
    }))
  })
}

function useClientId() {
  return new Promise((resolve, reject) => {
    passport.use("clientid", new LocalStrategy({
      usernameField: "client_id"
    }, async (clientId, password, done) => {
      try {
        let err = null
        const app = await findAppByClientIdAndSecret(clientId)

        if (!app) {
          err = new Error("Unknown application")
        } else if (!clientId || app.clientId !== clientId) {
          err = new Error("Invalid Client Id")
        }

        if (err) {
          done(err)
          reject(err)
        } else {
          done(err, app)
          resolve(app)
        }
      } catch (err) {
        done(err)
        reject(err)
      }
    }))
  })
}

function useApp() {
  return new Promise((resolve, reject) => {
    passport.use("app", new LocalStrategy({
      usernameField: "client_id",
      passwordField: "client_secret"
    }, async (clientId, clientSecret, done) => {
      try {
        let err = null
        const app = await findAppByClientIdAndSecret(clientId, clientSecret)

        if (!app) {
          err = new Error("Unknown application")
        } else if (!clientSecret || app.clientSecret !== clientSecret) {
          err = new Error("Invalid Client Secret")
        } else if (!clientId || app.clientId !== clientId) {
          err = new Error("Invalid Client Id")
        }

        if (err) {
          done(err)
          reject(err)
        } else {
          done(err, app)
          resolve(app)
        }
      } catch (err) {
        done(err)
        reject(err)
      }
    }))
  })
}

module.exports = {
  serializeUser,
  deserializeUser,
  useUser,
  useApp,
  useEmail,
  useCode,
  useClientId,
  useRefresh,
  useToken
}
