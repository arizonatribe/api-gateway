const path = require("path")
const { makeExecutableSchema } = require("graphql-tools")
const { fileLoader, mergeTypes, mergeResolvers } = require("merge-graphql-schemas")

module.exports = function createSchema(config) {
  const typesArray = fileLoader(path.join(__dirname, "./types"))
  const resolversArray = fileLoader(
    path.join(__dirname, config.shouldMock ? "./mock-resolvers" : "./resolvers")
  )

  const typeDefs = mergeTypes(typesArray, { all: true })
  const resolvers = mergeResolvers(resolversArray)

  return makeExecutableSchema({ typeDefs, resolvers })
}
