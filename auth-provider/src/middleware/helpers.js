const url = require("url")

/* eslint-disable-next-line max-len */
const emailRegex = new RegExp(/^[-a-z0-9~!$%^&*_=+}{'?]+(\.[-a-z0-9~!$%^&*_=+}{'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(biz|com|edu|gov|info|mil|net|org|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i)

const passwordRegex = new RegExp(/((?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W]).{8,20})/)

/**
 * Takes an Express-wrapped Http Response object and renders the provided
 * status code along with any provided content as the Http response
 *
 * @function
 * @name sendResponse
 * @param {function} res.status A method that receives a numeric [HTTP response code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) and sets that as the response code
 * @param {function} res.json A method that will render any provided JSON content as the response body
 * @param {number} [status=200] A valid [HTTP response code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)
 * @param {Object<string, any>} [content={success:true}] Some JSON content to render to the client
 */
function sendResponse(res, status = 200, content = { success: true }) {
  res.status(status)
  res.json(content)
}

/**
 * Checks whether a given string can be identified to have a "host" via the NodeJs [url.parse()](https://nodejs.org/api/url.html) API
 *
 * @function
 * @name isValidUri
 * @param {string} uri A string which may or may not be a valid URI
 * @returns {boolean} Whether or not the string value has a "host" that can be identified
 */
function isValidUri(uri) {
  try {
    return !!(url.parse(uri).host)
  } catch (err) {
    // must not have been a valid URI
    return false
  }
}

/**
 * Checks whether two given URI strings are part of the same host
 *
 * @function
 * @name areUrisOnSameHost
 * @param {string} uri The first URI string (to compare against)
 * @param {string} uri2 The second URI string (to compare)
 * @returns {boolean} Whether or not the URIs are part of the same URL host
 */
function areUrisOnSameHost(uri, uri2) {
  try {
    const { host: uriHost } = url.parse(uri)
    return !!uriHost && uriHost === url.parse(uri2).host
  } catch (err) {
    // must not be valid URIs
    return false
  }
}

/**
 * Checks a URI value that it is on the same host as a baseline URI, and returns it only if so.
 *
 * @function
 * @name parseRedirectUri
 * @param {string} compareUri The URI that the `uri` param must be on the same Host with
 * @param {string} uri The URI that may or may not be on the same Host as the baseline URI
 * @returns {string|undefined} The URI string - if on the same host as the comparer URI string
 */
/* eslint-disable-next-line consistent-return */
function parseRedirectUri(compareUri, uri) {
  if (isValidUri(uri) && (!compareUri || !areUrisOnSameHost(uri, compareUri))) {
    return uri
  }
}

/**
 * Sets up an Express Http error response
 *
 * @function
 * @name sendErrorResponse
 * @param {function} res.status A method that receives a valid Http response code and sets that for the Http response
 * @param {number} [status=400] A valid [HTTP response code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)
 * @param {string} [message="An unknown error occurred"] An error message to show the user
 */
function sendErrorResponse(res, status = 400, message = "An unknown error occurred") {
  res.status(status)
  res.json({ success: false, message })
}

module.exports = {
  emailRegex,
  passwordRegex,
  isValidUri,
  sendResponse,
  areUrisOnSameHost,
  parseRedirectUri,
  sendErrorResponse
}
