const express = require('express');

const router = express.Router();
const passport = require('passport');


router.get('/test_user_password', (req, res) => {
  const response = {
    access_token: 'c27224b2f60281b4bf70de87eda4d00806a83b7ea680ecef0ab5d89c9c6fc3f1',
    expires_in: 3600,
    refresh_token: '6f46607bb629e83707cd6eb4ff9518d7f74422e0063d62a70c8ef3a3455a733a',
    token_type: 'Bearer',
  };
  res.render('callback', { response: JSON.stringify(response) });
});


module.exports = router;

