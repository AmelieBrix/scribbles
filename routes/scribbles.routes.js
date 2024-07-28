const express = require('express');
const router = express.Router();
const Scribble = require('../models/Scribble.model')
const User = require('../models/User.model')
const Comment = require('../models/Comment.model')

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


module.exports = router;