module.exports = {
  Mutation: {
    async createStudent(_, student, { token, studentsClient, logger }) {
      try {
        const result = await studentsClient.getStudentById(student, token)
        logger.trace(result)
        return result
      } catch (err) {
        logger.error(err)
        return null
      }
    },

    async updateStudent(_, student, { token, studentsClient, logger }) {
      try {
        const result = await studentsClient.updateStudent(student, token)
        logger.trace(result)
        return result
      } catch (err) {
        logger.error(err)
        return null
      }
    },

    async deleteStudent(_, { id }, { token, studentsClient, logger }) {
      try {
        const result = await studentsClient.deleteStudent(id, token)
        logger.trace(result)
        return result
      } catch (err) {
        logger.error(err)
        return null
      }
    }
  },

  Query: {
    async studentById(_, { id }, { token, studentsClient, logger }) {
      try {
        const result = await studentsClient.getStudentById(id, token)
        logger.trace(result)
        return result
      } catch (err) {
        logger.error(err)
        return null
      }
    },

    async students(_p, _a, { token, studentsClient, logger }) {
      try {
        const result = await studentsClient.getStudents(token)
        logger.trace(result)
        return result
      } catch (err) {
        logger.error(err)
        return null
      }
    }
  }
}
