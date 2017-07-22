const {generateToken} = require('../auth');

module.exports = {
  Query: {
    allLinks: async (root, data, { mongo: {Links} }) => {
      return await Links.find({}).toArray();
    },
  },
  Mutation: {
    createLink: async (root, data, {mongo: {Links}, user}) => {
      const newLink = Object.assign({postedById: user && user._id}, data);
      await Links.insert(newLink);
      return newLink;
    },
    createUser: async (root, data, {mongo: {Users}}) => {
      // You need to convert the given arguments into the format for the
      // `User` type, grabbing email and password from the "authProvider".
      const newUser = {
        name: data.name,
        email: data.authProvider.email.email,
        password: data.authProvider.email.password,
      };
      await Users.insert(newUser);
      return newUser;
    },
    signinUser: async (root, data, {mongo: {Users}}) => {
      const user = await Users.findOne({email: data.email.email});
      if (data.email.password === user.password) {
        return { token: generateToken(user) };
      }
    },
  },

  Link: {
    id: root => root._id || root.id,
    postedBy: async ({postedById}, data, {mongo: {Users}}) => {
      return await Users.findOne({_id: postedById});
    },
  },
  User: {
    id: root => root._id || root.id,
  },
};
