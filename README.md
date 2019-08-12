# GraphQL API Gateway

A scalable service that consolidates multiple APIs (mostly RESTful) into a single, consolidated endpoint for consumers. Many different queries, mutations and subscriptions are all available from the single endpoint, effectively de-coupling front-end from back-end infrastructure and coupling instead to queries (which makes it easier to build re-usable front-end components).

# Dependencies

* [NodeJs](https://nodejs.org/en/)(v7.6 or later)

# Installation

Clone this repository and then run the shell command `npm install` to pull in all the third party dependencies and have the app ready to run.

# Usage

This app has a development mode and a production mode.

* To run in development mode, execute the shell command `npm run start:dev`.
* To run in production mode, execute the shell command `npm run start:prod`
* To run in a non-production mode where all data is locally mocked (no other services or databases need be running), execute the shell command `npm run start:mocked`
* To run the browseable docs, execute the shell command `npm start:docs`.
* To run the unit tests, execute the shell command `npm test`.
* To run the unit tests with a code coverage report `npm test:coverage`.


## TODO

* Demonstrate [Schema Directives](https://www.apollographql.com/docs/graphql-tools/schema-directives/)
* Integrate [supertest](https://www.npmjs.com/package/supertest)
* Integrate [dataloader](https://www.npmjs.com/package/dataloader) and [dataloader-warehouse](https://www.npmjs.com/package/dataloader-warehouse)
* Run parallel mocked services to simulate external APIs and databases
    * direct connection to a Mongo or Postgres database (connecting directly to a database isn't always desired in a GraphQL proxy, but this is just a demonstration of it)
    * RESTful API(s)
    * Auth server that implements or closely resembles OAuth2 flow
