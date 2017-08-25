if (process.env.NODE_ENV !== 'production') require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const schema = require('./schema');
const buildDataloaders = require('./dataloaders');
const { graphqlExpress, graphiqlExpress } = require('graphql-server-express');
const formatError = require('./formatError');
const connectMongo = require('./mongo-connector');
const auth = require('./auth');

const {execute, subscribe} = require('graphql');
const {createServer} = require('http');
const {SubscriptionServer} = require('subscriptions-transport-ws');

const OpticsAgent = require('optics-agent');
OpticsAgent.instrumentSchema(schema);

const start = async () => {
  const mongo = await connectMongo();
  let app = express();
  // TODO before pushing to heroku, must use passport and secure authentication
  app.use(OpticsAgent.middleware());
  const HOST = (process.env.HOST || 'localhost'),
        PORT = (process.env.PORT || 5000);
  app.set('port', PORT);
  app.set('host', HOST);

  const buildOptions = (req, res) => {
    return {
      context: {
        dataloaders: buildDataloaders(mongo),
        mongo,
        opticsContext: OpticsAgent.context(req),
        user: req.user,
      },
      formatError,
      schema
    };
  };

  app.options("/*", function(req, res, next){
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    res.send(200);
  });
  app.use(auth.initialize(mongo));
  app.use('/graphql', auth.authenticate(), bodyParser.json(), graphqlExpress(buildOptions));
  app.use('/graphiql',
    auth.basicAuthAuthenticationMiddleware(mongo),
    graphiqlExpress((req, res) => {
      return {
        endpointURL: '/graphql',
        passHeader: `Authorization: 'JWT ${auth.generateToken(req.user)}'`,
        subscriptionsEndpoint: `ws://${HOST}:${PORT}/subscriptions`,
      }
    })
  );
  app.get('/', (req, res) => res.redirect('/graphiql'));


  const server = createServer(app);
  server.listen(PORT, () => {
    new SubscriptionServer(
      {execute, subscribe, schema},
      {server, path: '/subscriptions'},
    );
    console.log(`Hackernews GraphQL server running on port ${PORT}.`)
  });
}

start();
