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
   console.log(req.body)
   if (!first_Name || !last_Name || !username || !email || !password) {
    res.render('auth/signup', { errorMessage: 'All fields are mandatory. Please provide your information.' });
    return;
    }
    bcryptjs
      .genSalt(saltRounds)
      .then(salt => bcryptjs.hash(password, salt))
      .then(hashedPassword => {
        return User.create({
          first_Name,
          last_Name,
          username,
          email,
          passwordHash: hashedPassword,
          profilePicture: req.file.path
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

  router.get('/scribbles/create', isLoggedIn, (req, res) => {
    res.render('auth/create-post')
  })

  router.post('/scribbles/create',fileUploader.single('ImageUrl'), async (req, res) => {
    try {
        const { title, category, description, location, comments } = req.body
        const userId = req.session.currentUser._id;
        const user = await User.findById(userId);
          if (!user) {
            return res.status(404).send('User not found');
          }
          const newScribble = new Scribble({
            title,
            category,
            description,
            location,
            user: user._id,
            ImageUrl : req.file.path
          });
          await newScribble.save();
        res.redirect('/scribbles')
        console.log("new scribble created", newScribble)
    } catch (error) {
      res.render('scribbles', { errorMessage: 'Error creating scribble. Please try again.' });
        console.log(error)
    }
  })

  router.get('/scribbles', isLoggedIn, async (req, res, next) => {
    try {
      const posts = await Scribble.find()
        .populate('user')
        .populate({
          path: 'comments',
          populate: { path: 'user' }
        });
      res.render("scribbles", { posts });
    } catch (err) {
      next(err);
    }
  });

  router.post('/scribbles/:id/comments', isLoggedIn, async (req, res) => {
    try {
      const { content } = req.body;
      const scribbleId = req.params.id;
      const userId = req.session.currentUser._id;
  
      const newComment = new Comment({
        content,
        user: userId
      });
  
      await newComment.save();
  
      const scribble = await Scribble.findById(scribbleId);
      if (!scribble) {
        return res.status(404).send('Scribble not found');
      }
  
      scribble.comments.push(newComment._id);
      await scribble.save();
  
      res.redirect(`/scribbles/${scribbleId}`);
    } catch (error) {
      res.render('scribbles', { errorMessage: 'Error adding comment. Please try again.' });
      console.log(error);
    }
  });

  router.get('/userProfile/edit', isLoggedIn, (req, res, next) => {
    res.render('auth/edit-profile', { user: req.session.currentUser });
  });

  router.post('/userProfile/edit', isLoggedIn, (req, res, next) => {
    const { first_Name, last_Name, username, email, password } = req.body;
    const userId = req.session.currentUser._id;
    console.log(req.body, "lala")
    if (!first_Name || !last_Name || !username || !email) {
        res.render('auth/edit-profile', { 
            errorMessage: 'All fields are mandatory. Please provide your information.', 
            user: req.session.currentUser 
        });
        return;
    }
    const updateUser = { first_Name, last_Name, username, email };

    if (password) {
      bcryptjs
          .genSalt(saltRounds)
          .then(salt => bcryptjs.hash(password, salt))
          .then(hashedPassword => {
              updateUser.passwordHash = hashedPassword;
              return User.findByIdAndUpdate(userId, updateUser, { new: true });
          })
          .then(updatedUser => {
              console.log(req.session.currentUser,"here")
              req.session.currentUser = updatedUser; // Update session with new user info
              res.render('auth/profile', { user: updatedUser });
          })
          .catch(error => next(error));
  } else {
      User.findByIdAndUpdate(userId, updateUser, { new: true })
          .then(updatedUser => {
            console.log(req.session.currentUser,"here")
              req.session.currentUser = updatedUser; // Update session with new user info
              res.render('auth/profile', { user: updatedUser });
          })
          .catch(error => next(error));
  }
});


  module.exports = router;