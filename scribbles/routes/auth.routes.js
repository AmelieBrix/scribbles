const router = require("express").Router();
const bcryptjs = require('bcryptjs');
const User = require('../models/User.model')
const { isLoggedIn, isLoggedOut } = require('../middleware/route-guard.js');
const saltRounds = 10;

router.get("/signup",isLoggedOut, (req, res, next) => {
    res.render("auth/signup");
  });

  router.post('/signup',isLoggedOut, (req, res, next) => {
    const {first_Name, last_Name, username, email, password } = req.body;
   console.log(req.body)
    bcryptjs
      .genSalt(saltRounds)
      .then(salt => bcryptjs.hash(password, salt))
      .then(hashedPassword => {
        return User.create({
            first_Name,
            last_Name,
          username,
          email,
          passwordHash: hashedPassword
        });
      })
      .then(userFromDB => {
        res.render('auth/profile');   //replaced redirect with render
      })
      .catch(error => next(error));
  });

  router.get('/userProfile',isLoggedIn, (req, res) => {
    console.log('req.session', req.session)
    res.render('auth/profile',{user: req.session.currentUser})
  });

  router.get('/login',isLoggedOut, (req, res, next) => {
    res.render("auth/login")
  });

  router.post('/login',isLoggedOut, (req, res, next) => {
    console.log('SESSION =====> ', req.session);
    console.log(req.body)
    const { email, password } = req.body;
    if (email === '' || password === '') {
      res.render('auth/login', {
        errorMessage: 'Please enter both, email and password to login.'
      });
      return;
    }
    User.findOne({ email })
      .then(user => {
        console.log(user)
        if (!user) {
          console.log("Email not registered. ");
          res.render('auth/login', { errorMessage: 'User not found and/or incorrect password.' });
          return;
        } else if (bcryptjs.compareSync(password, user.passwordHash)) {
          req.session.currentUser = user;
          res.render('auth/profile');
        } else {
          console.log("Incorrect password. ");
          res.render('auth/login', { errorMessage: 'User not found and/or incorrect password.' });
        }
      })
      .catch(error => next(error));
  });

  router.get('/logout',isLoggedIn, (req, res, next) => {
    req.session.destroy(err => {
      if (err) next(err);
      res.render('auth/login');
    });
  });

  module.exports = router;