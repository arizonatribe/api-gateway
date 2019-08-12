const bodyParser = require('body-parser');
const compression = require('compression');
const cors = require('cors');
const { createWhitelistMiddleware } = require('cors-helper');
const express = require('express');
const helmet = require('helmet');
const mongoose = require('mongoose');
const morgan = require('morgan');

const config = require('./config');
const createRoutes = require('./routes');
const { allowCrossDomain } = require('./middleware');
const corsOptions = createWhitelistMiddleware([
  'http://localhost',
  'http://locahost:3000'
]);

const { port, isProduction, connectionString } = config;

express()
  .use(bodyParser.urlencoded({ extended: false }))
  .use(bodyParser.json())
  .use(morgan(isProduction ? 'tiny' : 'dev'))
  .options('*', cors(corsOptions))
  .use(allowCrossDomain())
  .use(compression())
  .use(helmet())
  .use('/api', createRoutes(connectionString))
  .listen(port, '0.0.0.0', () => console.log(`server is now listening on port ${port}`));
