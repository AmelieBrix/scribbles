const express = require('express');
const router = express.Router();
    

/* GET home page */
router.get("/scribbles/food-corner", (req, res, next) => {
  res.render("channels/food-corner");
});

router.get("/scribbles/art-fart", (req, res, next) => {
  res.render("channels/art-fart")
})

router.get("/scribbles/city-vibes", (req, res, next) => {
  res.render("channels/city-vibes")
})

router.get("/scribbles/game-hub", (req, res, next) => {
  res.render("channels/game-hub")
})

module.exports = router;