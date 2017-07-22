const basicAuth = require('express-basic-auth')
const passport = require("passport");
const passportJWT = require("passport-jwt");
const { encode } = require("jwt-simple");
const JWT_SECRET = process.env.JWT_SECRET;
console.log(JWT_SECRET);

const ExtractJwt = passportJWT.ExtractJwt;
const Strategy = passportJWT.Strategy;
const params = {
    secretOrKey: JWT_SECRET,
    jwtFromRequest: ExtractJwt.fromAuthHeader()
};

function basicAuthAuthorizer(Users, req) {
  return (username, password, cb) => {
    Users.findOne({
      email: username
    }, (err, user) => {
      console.log("user from basic auth", user);
      let isUserAuthenticated = user && (user.password === password);
      if (isUserAuthenticated) {
        req.user = user;
      }
      cb(err, isUserAuthenticated);
    });
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
  initialize: ({Users, ObjectID}) => {
    const strategy = new Strategy(params, (payload, done) => {
        Users.findOne({_id: ObjectID(payload.id)}, (err, user) => {
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
      return encode(payload, JWT_SECRET);
    }
  }
};
