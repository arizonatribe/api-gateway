const http = require("http")
const express = require("express")
// const bodyParser = require("body-parser")
const { ApolloServer } = require("apollo-server-express")
const createSchema = require("./graphql/schema")
const config = require("./config")
const createLoggers = require("./logger")
const createStudentsClient = require("./apis/students.client")

const { port } = config

const app = express()
const schema = createSchema(config)
const studentsClient = createStudentsClient(config)

const { logger, middleware: loggingMiddleware } = createLoggers(config)

// app.use(loggingMiddleware)

const apolloServer = new ApolloServer({
  schema,
  context({ req }) {
    const [_, token] = (req.headers.authorization || "").split(" ")
    return { ...config, studentsClient, logger, token }
  }
})

apolloServer.applyMiddleware({ app })

const server = http.createServer(app)

apolloServer.installSubscriptionHandlers(server)

server.listen({ port }, () => {
  logger.info(`🚀  Server ready at ${apolloServer.graphqlPath}`)
})
