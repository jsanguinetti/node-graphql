module.exports = Object.assign({
    Query: require('./queries'),
    Mutation: require('./mutations'),
  },
  require('./types')
);
