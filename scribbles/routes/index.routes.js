const express = require('express');
const router = express.Router();

/* GET home page */
router.get("/", (req, res, next) => {
  res.render("index");
});

router.get("/scribbles", (req, res, next) => {
  res.render("scribbles");
});

module.exports = router;
