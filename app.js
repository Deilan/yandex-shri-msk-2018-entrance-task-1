const cors = require('cors');
const express = require('express');

const graphqlRoutes = require('./graphql/routes');

const app = express();
app.use(cors());
app.use(require('express-blank-favicon'));
app.use('/graphql', graphqlRoutes);

module.exports = app;
