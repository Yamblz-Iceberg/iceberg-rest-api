const express = require('express');

const router = express.Router();
const passport = require('passport');


router.get('/test_user_password', (req, res) => {
  res.render('callback', { response: 'l' });
});


module.exports = router;

