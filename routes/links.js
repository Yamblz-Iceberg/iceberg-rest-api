const express = require('express');

const router = express.Router();

const passport = require('passport');

const Link = require('.././dataModels/link').Link;
const mongoose = require('mongoose');

const validation = require('./validation/validator');
const validationParams = require('./validation/params');
const linkParser = require('./../libs/linkParser');
const error = require('rest-api-errors');

const _ = require('lodash');

router.post('/', passport.authenticate('bearer', { session: false }), (req, res, next) => {
  linkParser.getInfo(req.body.link)
    .then((info) => {
      const newLink = new Link({ favicon: info.favicon, name: info.name, photo: info.photo, userAdded: req.user.userId, url: req.body.link });
      return newLink.save()
        .then(link => res.json(link));
    })
    .catch(err => next(err));
});


module.exports = router;
