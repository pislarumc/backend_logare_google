const GoogleStrategy = require('passport-google-oauth20').Strategy
const LocalStrategy = require('passport-local').Strategy
const mongoose = require('mongoose')
const User = require('../models/User')

module.exports = function (passport) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        const newUser = {
          googleId: profile.id,
          displayName: profile.displayName,
          firstName: profile.name.givenName,
          lastName: profile.name.familyName,
          image: profile.photos[0].value,
        }

        try {
          let user = await User.findOne({ googleId: profile.id })

          if (user) {
            done(null, user)
          } else {
            user = await User.create(newUser)
            done(null, user)
          }
        } catch (err) {
          console.error(err)
        }
      }
    )
  )

  passport.use('local-signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  },
    function (req, email, password, done) {
      process.nextTick(function () {
        if (!req.user) {
          User.findOne({ 'local.email': email }, function (err, user) {
            if (err) {
              console.error(err);
              return done(err);
            }
            if (user) {
              return done(null, false, { errMsg: 'email already exists' });
            }
            else {
              var newUser = new User();
              newUser.local.username = req.body.username;
              newUser.local.email = email;
              newUser.local.password = newUser.generateHash(password);
              newUser.save(function (err) {
                if (err) {
                  if (err.message == 'User validation failed') {
                    return done(null, false, { errMsg: 'Please fill all fields' });
                  }
                  console.error(err);
                  return done(err);
                }
                return done(null, newUser);
              });
            }
          });
        }
        else {//user exists and is loggedin
          var user = req.user; // pull the user out of the session
          // update the current users local credentials
          user.local.username = req.body.username;
          user.local.email = email;
          user.local.password = user.generateHash(password);
          // save modifications to user
          user.save(function (err) {
            if (err) {
              console.error(err);
              return done(err);
            }
            return done(null, user);
          });
        }
      });
    }));

  passport.use('local-login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  },
    function (req, email, password, done) {
      User.findOne({ 'local.email': email }, function (err, user) {
        if (err) {
          return done(err);
        }
        if (!user) {
          return done(null, false, {
            errMsg: 'User does not exist, please' +
              ' <a href="/signup">signup</a>'
          });
        }
        if (!user.validPassword(password)) {
          return done(null, false, { errMsg: 'Invalid password try again' });
        }
        return done(null, user);
      });
    })
  );
  passport.serializeUser((user, done) => {
    done(null, user.id)
  })

  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => done(err, user))
  })
}