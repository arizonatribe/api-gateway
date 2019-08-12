const fetch = require("cross-fetch")

/**
 * A simple fetch Response handler that checks the status code and throws the relevant error (if necessary)
 *
 * @function
 * @name handleError
 * @throws {Error} when the status code is 400+
 * @param {number} response.status The numeric code corresponding to the http
 * response (400 level or 500 level codes are considered errors)
 * @param {string} response.statusText The general description of the response
 */
function handleError(response) {
  if (response.status >= 400) {
    throw new Error(response.statusText)
  }
}

/**
 * Examines an Http response and attempts to format its result as either JSON or string text.
 *
 * @function
 * @name handleResult
 * @throws {Error} if the response is neither JSON nor text, or if the response
 * doesn't contain the appropriate methods to determine it
 * @param {function} response.json Returns a JSON representation of the result
 * @param {function} response.text Returns a text representation of the result
 * @returns {string|Object<string, any>} A formatted representation of the
 * result of the Http request
 */
function handleResult(response) {
  try {
    return response.json()
  } catch (err) {
    return response.text()
  }
}

/**
 * Creates a NodeJS client for the Students API
 *
 * @function
 * @name createStudentsClient
 * @param {string} config.studentsURL The base URL for the students API
 * @returns {Object<string, function>} An API instance whose methods are
 * asynchronous functions that perform the desired query or mutation through the
 * Students RESTful API
 */
module.exports = function createStudentsClient(config) {
  const { studentsURL } = config

  return {
    async createStudent(student, token) {
      const response = await fetch(`${studentsURL}/students`, {
        method: "POST",
        body: JSON.stringify(student),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      })
      handleError(response)
      const result = await handleResult(response)
      return result
    },

    async updateStudent(student, token) {
      const response = await fetch(`${studentsURL}/students/${student.id}`, {
        method: "PUT",
        body: JSON.stringify(student),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      })
      handleError(response)
      const result = await handleResult(response)
      return result
    },

    async deleteStudent(id, token) {
      const response = await fetch(`${studentsURL}/students/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      })
      handleError(response)
      const result = await handleResult(response)
      return result
    },

    async getStudents(token) {
      const response = await fetch(`${studentsURL}/students`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      })
      handleError(response)
      const result = await handleResult(response)
      return result.students
    },

    async getStudentById(id, token) {
      const response = await fetch(`${studentsURL}/students/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      })
      handleError(response)
      const result = await handleResult(response)
      return result.student
    }
  }
}
