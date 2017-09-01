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
  addLink: {
    body: {
      link: Joi.string().regex(urlJoi).required(),
      description: Joi.string().max(300),
    },
  },
  description: {
    body: {
      description: Joi.string().max(300),
    },
    params: {
      collectionId: Joi.string().regex(idMongoRegex).required(),
      linkId: Joi.string().regex(idMongoRegex).required(),
    },
  },
  collection: {
    body: {
      name: Joi.string().min(5).max(50).required(),
      description: Joi.string().max(300),
      color: Joi.string().regex(/rgb\((?:([0-9]{1,2}|1[0-9]{1,2}|2[0-4][0-9]|25[0-5]), ?)(?:([0-9]{1,2}|1[0-9]{1,2}|2[0-4][0-9]|25[0-5]), ?)(?:([0-9]{1,2}|1[0-9]{1,2}|2[0-4][0-9]|25[0-5]))\)/).required(),
      tags: Joi.array().min(1).max(10).items(Joi.string().regex(idMongoRegex))
        .required(),
      photo: Joi.string().regex(/(?:(?:https?:\/\/))[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,4}\b(?:[-a-zA-Z0-9@:%_\+.~#?&\/=]*(\.jpg|\.png|\.jpeg))/),
    },
  },
  tag: {
    body: {},
    params: {
      tagName: Joi.string().min(2).max(50).required(), // TODO: valid
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

