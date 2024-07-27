const express = require('express');
const router = express.Router();

/* GET home page */
router.get("/", (req, res, next) => {
  res.render("index",{ user: req.session.currentUser });
});

router.get("/scribbles", (req, res, next) => {
  res.render("scribbles",{ user: req.session.currentUser })
})



module.exports = router;
