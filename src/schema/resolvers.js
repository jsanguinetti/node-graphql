const {generateToken} = require('../auth');
const {ObjectID} = require('mongodb')

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
    createVote: async (root, data, {mongo: {Votes}, user}) => {
      const newVote = {
        userId: user && user._id,
        linkId: new ObjectID(data.linkId),
      };
      await Votes.insert(newVote);
      return newVote;
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
    postedBy: async ({postedById}, data, {dataloaders: {userLoader}}) => {
      return postedById && await userLoader.load(postedById);
    },
    votes: async ({_id}, data, {mongo: {Votes}}) => {
      return await Votes.find({linkId: _id}).toArray();
    },
  },
  User: {
    id: root => root._id || root.id,
    votes: async ({_id}, data, {mongo: {Votes}}) => {
      return await Votes.find({userId: _id}).toArray();
    },
  },
  Vote: {
    id: root => root._id || root.id,
    user: async ({userId}, data, {dataloaders: {userLoader}}) => {
      return userId && await userLoader.load(userId);
    },
    link: async ({linkId}, data, {mongo: {Links}}) => {
      return await Links.findOne({_id: linkId});
    },
  }
};
