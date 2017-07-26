const pubsub = require('../../pubsub');

module.exports = Object.assign({
    Query: require('./queries'),
    Mutation: require('./mutations'),
    Subscription: {
      Link: {
        subscribe: () => pubsub.asyncIterator('Link'),
      },
    },
  },
  require('./types')
);
