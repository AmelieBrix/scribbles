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
        res.redirect('/userProfile');   //replaced redirect with render
      })
      .catch(error => next(error));
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
        scribbles, // Pass the array of scribbles
        currentUserId: req.session.currentUser._id, // Pass the current logged-in user's ID
        user: req.session.currentUser // Pass the current logged-in user
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

  router.get('/scribbles/create', isLoggedIn, (req, res) => {
    res.render('auth/create-post',{user: req.session.currentUser})
  })

  router.post('/scribbles/create',fileUploader.single('ImageUrl'), async (req, res) => {
    try {
        const { title, category, description, location, comments } = req.body
        const userId = req.session.currentUser._id;
        const user = await User.findById(userId);
        const ImageUrl = req.file ? req.file.path : '/images/default_post.png';
          if (!user) {
            return res.status(404).send('User not found');
          }
          const newScribble = new Scribble({
            title,
            category,
            description,
            location,
            user: userId,
            ImageUrl : ImageUrl
          });
          const categoryId = newScribble.category
          await newScribble.save();
        res.redirect(`/scribbles/${categoryId.replace(/\s+/g, '-').toLowerCase()}`)
    } catch (error) {
      res.render('scribbles', { errorMessage: 'Error creating scribble. Please try again.' });
        console.log(error)
    }
  })

  router.get('/scribbles/edit/:id', async (req, res) => {
    try {
      const scribbleId = req.params.id;
      const scribble = await Scribble.findById(scribbleId);
      if (!scribble) {
        return res.status(404).send('Scribble not found');
      }
  
      res.render('auth/edit-scribble', { scribble }); // Adjust view name as necessary
    } catch (error) {
      console.error(error);
      res.status(500).send('Error retrieving scribble for editing');
    }
  });

  router.post('/scribbles/edit/:id', fileUploader.single('ImageUrl'), async (req, res) => {
    try {
      const scribbleId = req.params.id;
      const { title, category, description, location } = req.body;
  
      const updatedImageUrl = req.file ? req.file.path : req.body.ImageUrl;
  
      const updatedScribble = await Scribble.findByIdAndUpdate(
        scribbleId,
        {
          title,
          category,
          description,
          location,
          ImageUrl: updatedImageUrl,
        },
        { new: true } 
      );
  
      if (!updatedScribble) {
        return res.status(404).send('Scribble not found');
      }
  
      res.redirect(`/scribbles/${updatedScribble.category.replace(/\s+/g, '-').toLowerCase()}`);
    } catch (error) {
      console.error('Error updating scribble:', error);
      res.render('edit-scribble', {
        errorMessage: 'Error updating scribble. Please try again.',
        scribble: req.body,
      });
    }
  });

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

  router.get('/scribbles/:id', isLoggedIn, async (req, res, next) => {
    try {
      const scribbleId = req.params.id;
      const userId = req.session.currentUser._id;
      const scribble = await Scribble.findById(scribbleId)
      .populate('user')
      .populate({
        path: 'comments',
        populate: { path: 'user' }
      });
      const userHasLiked = scribble.likes.includes(userId);
      const isOwner = scribble.user._id.toString() === userId.toString();
      res.render("channels/scribble", { 
        scribble, isOwner: isOwner, 
        currentUserId: userId, 
        user: req.session.currentUser,
        userHasLiked
      });
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
        user: userId,
        scribble: scribbleId
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

  router.get('/comments/delete/:id', isLoggedIn, async (req, res, next) => {
    try {
      const commentId = req.params.id;
      const userId = req.session.currentUser._id;
      const comment = await Comment.findById(commentId).populate('user');
      const scribbleId = comment.scribble
  
      if (!comment) {
        return res.status(404).send('Comment not found');
      }
  
      if (comment.user._id.toString() !== userId.toString()) {
        return res.status(403).send('Unauthorized to delete this comment');
      }
  
      await Comment.findByIdAndDelete(commentId);
      res.redirect(`/scribbles/${scribbleId}`);
    } catch (err) {
      next(err);
    }
  });

  router.get('/scribbles/delete/:id', isLoggedIn, async (req, res, next) => {
    try {
      const scribbleId = req.params.id;
      const userId = req.session.currentUser._id;
      const scribble = await Scribble.findById(scribbleId);
      const categoryId = scribble.category
      if (!scribble) {
        return res.status(404).send('Scribble not found');
      }
  
      if (scribble.user.toString() !== userId.toString()) {
        return res.status(403).send('Unauthorized to delete this scribble');
      }
  
      await Scribble.findByIdAndDelete(scribbleId);
      res.redirect(`/scribbles/${categoryId.replace(/\s+/g, '-').toLowerCase()}`); // replaces the link we use to query the database back to what we have in our url
    } catch (err) {
      next(err);
    }
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

router.get('/scribbles/:id/like', isLoggedIn, (req, res, next) => {
  const scribbleId = req.params.id;
  res.redirect(`/scribbles/${scribbleId}`);
});

router.post('/scribbles/:id/like',isLoggedIn, async (req, res) => {
  try {
    const scribbleId = req.params.id;
    const userId = req.session.currentUser._id;

    const scribble = await Scribble.findById(scribbleId);

    if (!scribble) {
      return res.status(404).json({ success: false, message: 'Scribble not found' });
    }

    if (scribble.likes.includes(userId)) {
      // If already liked, remove the like
      scribble.likes.pull(userId);
    } else {
      // Otherwise, add the like
      scribble.likes.push(userId);
    }

    await scribble.save();

    res.json({ success: true, likes: scribble.likes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.get('/user/likes', isLoggedIn, async (req, res) => {
  try {
    const userId = req.session.currentUser._id;
    const likedScribbles = await Scribble.find({ likes: userId });

    res.render('auth/liked-posts', { likedScribbles, user: req.session.currentUser });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { message: 'Internal server error' });
  }
});




  module.exports = router;


