const express = require('express');
const router = express.Router();

/* GET home page */
router.get("/", (req, res, next) => {
  res.render("index",{ isLoggedIn: req.session.currentUser ? true : false });
});

router.get("/scribbles", (req, res, next) => {
  res.render("scribbles",{ isLoggedIn: req.session.currentUser ? true : false })
})



module.exports = router;
