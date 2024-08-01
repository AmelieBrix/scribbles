const router = require("express").Router();
const bcryptjs = require('bcryptjs');
const User = require('../models/User.model')
const Scribble = require('../models/Scribble.model')
const Comment = require('../models/Comment.model')
const fileUploader = require('../config/cloudinary.config');
const { isLoggedIn, isLoggedOut } = require('../middleware/route-guard.js');
const saltRounds = 10;

router.get("/signup",isLoggedOut, (req, res, next) => {
    res.render("auth/signup");
  });

  router.post('/signup',isLoggedOut,fileUploader.single('profilePicture'), (req, res, next) => {
    const {first_Name, last_Name, username, email, password } = req.body;
   if (!first_Name || !last_Name || !username || !email || !password) {
    res.render('auth/signup', { errorMessage: 'All fields are mandatory. Please provide your information.' });
    return;
    }
    bcryptjs
      .genSalt(saltRounds)
      .then(salt => bcryptjs.hash(password, salt))
      .then(hashedPassword => {
        const profilePicture = req.file ? req.file.path : '/images/default.jpg'; // Set default value if no file is uploaded

        return User.create({
          first_Name,
          last_Name,
          username,
          email,
          passwordHash: hashedPassword,
          profilePicture: profilePicture
        });
      })
      .then(userFromDB => {
        res.redirect('/login');   
      })
      .catch(error => {
        if (error.code === 11000) {
            res.render('auth/signup', { errorMessage: 'Email or username already exists. Please try a different one.' });
        } else {
            next(error);
        }
    });
  });

  router.get('/userProfile',isLoggedIn, (req, res) => {
    res.render('auth/profile',{user: req.session.currentUser})
  });

  router.get('/user/:userId/myscribbles', async (req, res) => {
    try {
      const userId = req.params.userId;
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(404).send('User not found');
      }
  
      const scribbles = await Scribble.find({ user: userId }).populate('user').populate('comments.user').exec();
      
      res.render('myscribbles', { 
        scribbles,
        currentUserId: req.session.currentUser._id, 
        user: req.session.currentUser 
      });
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal server error');
    }
  });

  router.get('/login',isLoggedOut, (req, res, next) => {
    res.render("auth/login")
  });

  router.post('/login',isLoggedOut, (req, res, next) => {
    const { email, password } = req.body;
    if (email === '' || password === '') {
      res.render('auth/login', {
        errorMessage: 'Please enter both, email and password to login.'
      });
      return;
    }
    User.findOne({ email })
      .then(user => {
        console.log(user,user)
        if (!user) {
          console.log("Email not registered. ");
          res.render('auth/login', { errorMessage: 'User not found and/or incorrect password.' });
          return;
        } else if (bcryptjs.compareSync(password, user.passwordHash)) {
          req.session.currentUser = user;
          res.redirect('/userProfile');
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

  router.get('/userProfile/edit', isLoggedIn, (req, res, next) => {
    res.render('auth/edit-profile', { user: req.session.currentUser });
  });

  router.post('/userProfile/edit', isLoggedIn, fileUploader.single('profilePicture'), (req, res, next) => {
    const { first_Name, last_Name, username, email, password} = req.body;
    const userId = req.session.currentUser._id;
    if (!first_Name || !last_Name || !username || !email ) {
        res.render('auth/edit-profile', { 
            errorMessage: 'All fields are mandatory. Please provide your information.', 
            user: req.session.currentUser 
        });
        return;
    }
    const updateUser = { first_Name, last_Name, username, email };
    const profilePicture = req.file ? req.file.path : req.body.profilePicture;
    updateUser.profilePicture = profilePicture;

    if (password) {
      bcryptjs
          .genSalt(saltRounds)
          .then(salt => bcryptjs.hash(password, salt))
          .then(hashedPassword => {
              updateUser.passwordHash = hashedPassword;
              return User.findByIdAndUpdate(userId, updateUser, { new: true });
          })
          .then(updatedUser => {
              req.session.currentUser = updatedUser; 
              res.render('auth/profile', { user: updatedUser });
          })
          .catch(error => next(error));
  } else {
      User.findByIdAndUpdate(userId, updateUser, { new: true })
          .then(updatedUser => {
              req.session.currentUser = updatedUser; 
              res.render('auth/profile', { user: updatedUser });
          })
          .catch(error => next(error));
  }
});

  module.exports = router;


