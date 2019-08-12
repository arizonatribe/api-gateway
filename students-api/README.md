# Student Info API

A simple ExpressJs microservice that retrieves Student information from the `school` MongoDB collection - through a RESTful API.

## Dependencies

* [NodeJs](https://nodejs.org/en/download/)
* [MongoDB](https://www.mongodb.com/) - Specifically an instance of MongoDB that contains the `fatvStats` and a corresponding `conversation_turns` collection

## Usage

First, make sure the instance of MongoDB is running.

For production:

```bash
npm run start:prod
```

For local development (with a live-reload server):

```bash
npm run start:dev
```

## Environment Variables

* __PORT__ - The port on which this service runs (defaults to 5000)
* __DB_NAME__ - The name of the database that the conversation services will connect to (defaults to `school`)
* __DB_HOST__ - The hostname or IP address for the database server (defaults to `localhost`)
* __DB_PORT__ - The port number that the (mongo) database runs on (defaults to Mongo's default 27017)
* __DB_PASSWORD__ - If the databse requires a password, it should be provided

