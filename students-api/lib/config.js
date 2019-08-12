const env = require('./env');

module.exports = {
  isProduction: env.isProduction,
  port: env.PORT,
  connectionString: [
    'mongodb://',
    env.DB_HOST,
    env.DB_PASSWORD ? `:${env.DB_PASSWORD}:` : ':',
    env.DB_PORT,
    `/${env.DB_NAME}`
  ].join('')
};
