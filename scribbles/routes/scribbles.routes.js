const express = require('express');
const router = express.Router();

/* GET home page */
router.get("/scribbles/food-corner", (req, res, next) => {
  res.render("channel/food-corner");
});

router.get("/scribbles", (req, res, next) => {
  res.render("scribbles")
})

module.exports = router;