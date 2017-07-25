const {ObjectID} = require('mongodb')
const basicAuth = require('express-basic-auth')
const passport = require("passport");
const passportJWT = require("passport-jwt");
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

const ExtractJwt = passportJWT.ExtractJwt;
const Strategy = passportJWT.Strategy;
const params = {
    secretOrKey: JWT_SECRET,
    jwtFromRequest: ExtractJwt.fromAuthHeader()
};

function basicAuthAuthorizer(Users, req) {
  return async (username, password, cb) => {
    const user = await Users.findOne({
      email: username
    });
    let isUserAuthenticated = user && (user.password === password);
    if (isUserAuthenticated) {
      req.user = user;
    }
    cb(null, isUserAuthenticated);
  }
}

module.exports = {
  basicAuthAuthenticationMiddleware: ({Users}) => (req, res, next) => {
    basicAuth({
      authorizer: basicAuthAuthorizer(Users, req),
      authorizeAsync: true,
      challenge: true,
      realm: 'node-graphql'
    })(req, res, (err) => {
      next(err);
    });
  },
  authenticate: () => passport.authenticate('jwt', {session: false}),
  initialize: ({Users}) => {
    const strategy = new Strategy(params, (payload, done) => {
        Users.findOne({_id: new ObjectID(payload.id)}, (err, user) => {
          if (user) {
            return done(null, {
              _id: user._id
            });
          } else {
            return done(new Error('User not found'), null);
          }
        });
    });
    passport.use(strategy);
    return passport.initialize();
  },
  generateToken: (user) => {
    if (user) {
      let payload = {
          id: user._id
      };
      return jwt.sign(payload, JWT_SECRET);
    }
  }
};
