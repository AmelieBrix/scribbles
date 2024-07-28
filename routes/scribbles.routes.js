const express = require('express');
const router = express.Router();
const Scribble = require('../models/Scribble.model')
const User = require('../models/User.model')
const Comment = require('../models/Comment.model')

router.get("/scribbles/food-corner", async (req, res, next) => {
  try {
    const posts = await Scribble.find({ category: "Food Corner" })
    .populate('user')
    
    res.render("channels/food-corner", { posts });
  } catch (err) {
    next(err);
  }
});

router.get("/scribbles/art-fart", async (req, res, next) => {
  try {
    const posts = await Scribble.find({ category: "Art Fart" })
    .populate('user')
    res.render("channels/art-fart", { posts });
  } catch (err) {
    next(err);
  }
})

router.get("/scribbles/city-vibes", async (req, res, next) => {
  try {
    const posts = await Scribble.find({ category: "City Vibes" })
    .populate('user')
    res.render("channels/city-vibes", { posts });
  } catch (err) {
    next(err);
  }
});

router.get("/scribbles/game-hub", async (req, res, next) => {
  try {
    const posts = await Scribble.find({ category: "Game Hub" })
    .populate('user')
    res.render("channels/game-hub", { posts });
  } catch (err) {
    next(err);
  }
})

module.exports = router;