const envalid = require('envalid');

const { str, port } = envalid;

module.exports = envalid.cleanEnv(process.env, {
  PORT: port({
    default: 5000,
    example: 5000,
    desc: 'The port on which this service runs'
  }),
  DB_NAME: str({
    example: 'mydb',
    default: 'school',
    desc: 'The name of the database that the student service will connect to'
  }),
  DB_HOST: str({
    default: 'localhost',
    example: 'localhost',
    desc: 'The hostname or IP address for the database server'
  }),
  DB_PORT: port({
    default: 27017,
    example: 27017,
    desc: 'The port number that the (mongo) database runs on'
  }),
  DB_PASSWORD: str({
    devDefault: '',
    example: '<super_secret_password>',
    desc: 'If the databse requires a password, it should be provided'
  })
});
