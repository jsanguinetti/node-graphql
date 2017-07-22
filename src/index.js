if (process.env.NODE_ENV !== 'production') require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const schema = require('./schema');
const { graphqlExpress, graphiqlExpress } = require('graphql-server-express');
const connectMongo = require('./mongo-connector');

const start = async () => {
  const mongo = await connectMongo();
  let app = express();
  app.set('port', (process.env.PORT || 5000));

  app.use('/graphql', bodyParser.json(), graphqlExpress({
    context: { mongo },
    schema
  }));
  app.use('/graphiql', graphiqlExpress({
    endpointURL: '/graphql',
  }));
  app.get('/', (req, res) => res.redirect('/graphiql'));

  const PORT = app.get('port');

  app.listen(PORT, () => {
    console.log(`Hackernews GraphQL server running on port ${PORT}.`)
  });
}

start();
