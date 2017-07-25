const {generateToken} = require('../../auth');
const {ObjectID} = require('mongodb')
const {URL} = require('url');

class ValidationError extends Error {
  constructor(message, field) {
    super(message);
    this.field = field;
  }
}

function assertValidLink({url}) {
  try {
    new URL(url);
  } catch (e) {
    if (e instanceof TypeError) {
      throw new ValidationError('Link validation error: invalid url.', 'url');
    }
    throw e;
  }
}

module.exports = {
 createLink: async (root, data, {mongo: {Links}, user}) => {
   assertValidLink(data);
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
};
