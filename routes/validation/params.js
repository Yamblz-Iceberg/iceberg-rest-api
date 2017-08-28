const Joi = require('joi');
const badUsernames = require('./badUsernames');

// TODO: length of params
// TODO: нормальную вадлидацию для id из бд

const coordinatesJoi = Joi.array().length(2).items(Joi.number().min(-180).max(180)).required();
const nicknameJoi = Joi.string().alphanum().min(3).max(12)
  .invalid(badUsernames);
const messageJoi = Joi.string().max(4096);
const urlJoi = /^((?:https\:\/\/)|(?:http\:\/\/)|(?:www\.))?([a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,3}(?:\??)[a-zA-Z0-9\-\._\?\,\'\/\\\+&%\$#\=~]+)$/;
const idMongoRegex = /^[0-9a-fA-F]{24}$/;
const textShortJoi = Joi.string().min(2).max(20).invalid(badUsernames);

module.exports = {
  register: {
    body: {
      userId: Joi.string().min(3).max(64)
        .invalid(badUsernames)
        .required(),
      nickName: nicknameJoi,
      password: Joi.string().regex(/[a-zA-Z0-9]{3,30}/).required(),
    },
  },
  coordinates: {
    body: {
      coordinates: coordinatesJoi,
    },
  },
  request: {
    body: {
      position: Joi.object({
        coordinates: coordinatesJoi,
      }),
      message: messageJoi,
      place: Joi.string().max(50),
      timeToStayAlive: Joi.number().min(60).max(36000).required(),
    },
    params: {
      userId: Joi.string().invalid(Joi.ref('$user.userId')),
    },
  },
  rating: {
    body: {},
    params: {
      rating: Joi.number().min(0).max(10).required(),
      reqId: Joi.string().min(23).max(32).required(),
      userId: Joi.string().min(3).max(64).required(),
    },
  },
  social: {
    body: {
      uniqueId: Joi.string().guid({
        version: [
          'uuidv4',
        ],
      }).required(),
    },
  },
  editUser: {
    body: {
      nickName: nicknameJoi,
      firstName: textShortJoi,
      lastName: textShortJoi,
      sex: textShortJoi,
      socialLink: Joi.string().regex(urlJoi),
      photo: Joi.string().regex(urlJoi),
    },
  },
  message: {
    body: {
      message: messageJoi,
      attachments: Joi.array().min(1).max(10).items(Joi.object({
        type: Joi.string().valid(['photo', 'video', 'audio']),
        src: Joi.string().regex(urlJoi),
      })),
    },
  },
  messagesDelete: {
    body: {
      ids: Joi.array().min(1).max(10).items(Joi.string().regex(idMongoRegex))
        .required(),
    },
  },
  logout: {
    body: {
      accessToken: Joi.string().token().length(64),
      refreshToken: Joi.string().token().length(64),
    },
  },
  radius: {
    params: {
      lng: Joi.number().min(-180).max(180),
      lat: Joi.number().min(-90).max(90),
      radius: Joi.number(),
    },
    body: {
      friends: Joi.boolean(),
    },
  },
};

