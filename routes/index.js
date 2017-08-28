const express = require('express');

const router = express.Router();
const passport = require('passport');


router.get('/test_user_password', passport.authenticate(['basic', 'local'], { session: false }), (req, res) => {
  res.locals.user = req.user;
  res.json(res.locals.user);
});


module.exports = router;

