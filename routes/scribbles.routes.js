const express = require('express');
const router = express.Router();
const Scribble = require('../models/Scribble.model')
const User = require('../models/User.model')
const Comment = require('../models/Comment.model')
const fileUploader = require('../config/cloudinary.config');
const { isLoggedIn, isLoggedOut } = require('../middleware/route-guard.js');

const categories = ["food-corner", "art-fart", "city-vibes", "game-hub"]; // These need to match the urls

categories.forEach(category => {
  router.get(`/scribbles/${category}`, async (req, res, next) => {
    try {
      const posts = await Scribble.find({ category: category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') }) // this is for the router to convert the url names to match with the names in the database
        .populate('user');
      
      res.render(`channels/${category}`, { posts, user: req.session.currentUser });
    } catch (err) {
      next(err);
    }
  });
});

/* scribble creation */

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

/* scribble edit */

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
      scribble: req.body
    });
  }
});

/* getting scribbles */

router.get('/scribbles', async (req, res, next) => {
  try {
    const posts = await Scribble.find()
      .populate('user')
      .populate({
        path: 'comments',
        populate: { path: 'user' }
      });
    res.render("scribbles", { posts, user: req.session.currentUser});
  } catch (err) {
    next(err);
  }
});

/* getting a individual scribble */

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


/* sending a comment */

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

/* deleting a comment */

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

/* deleting a scribble */

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

/* liking a scribble */

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
      scribble.likes.pull(userId);
    } else {
      scribble.likes.push(userId);
    }

    await scribble.save();

    res.json({ success: true, likes: scribble.likes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

/* getting the liked posts */

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