const Joi = require('joi');
const badUsernames = require('./badUsernames');

const nicknameJoi = Joi.string().alphanum().min(3).max(12)
  .invalid(badUsernames);
const urlJoi = /^((?:https\:\/\/)|(?:http\:\/\/)|(?:www\.))?([a-zа-яA-ZА-Я0-9\-\.]+\.[a-zа-яА-ЯA-Z]{2,3}(?:\??)[a-zа-яA-ZА-Я0-9\-\._\?\,\'\/\\\+&%\$#\=~]+)$/;
const idMongoRegex = /^[0-9a-fA-F]{24}$/;
const textShortJoi = Joi.string().min(2).max(20).invalid(badUsernames);

module.exports = {
  register: {
    body: {
      userId: Joi.string().min(3).max(64)
        .invalid(badUsernames)
        .required(),
      firstName: textShortJoi,
      lastName: textShortJoi,
      photo: Joi.string().regex(urlJoi),
      password: Joi.string().regex(/[a-zA-Z0-9]{3,30}/).required(),
    },
  },
  addLink: {
    body: {
      link: Joi.string().regex(urlJoi).required(),
      description: Joi.string().allow('').max(300),
    },
  },
  readLink: {
    params: {
      linkId: Joi.string().regex(idMongoRegex).required(),
    },
  },
  readCollection: {
    params: {
      collectionId: Joi.string().regex(idMongoRegex).required(),
    },
  },
  description: {
    body: {
      description: Joi.string().allow('').max(300),
    },
    params: {
      collectionId: Joi.string().regex(idMongoRegex).required(),
      linkId: Joi.string().regex(idMongoRegex).required(),
    },
  },
  collection: {
    body: {
      name: Joi.string().min(5).max(50).required(),
      closed: Joi.boolean(),
      description: Joi.string().allow('').max(300),
      color: Joi.string().regex(/rgb\((?:([0-9]{1,2}|1[0-9]{1,2}|2[0-4][0-9]|25[0-5]), ?)(?:([0-9]{1,2}|1[0-9]{1,2}|2[0-4][0-9]|25[0-5]), ?)(?:([0-9]{1,2}|1[0-9]{1,2}|2[0-4][0-9]|25[0-5]))\)/).required(),
      tags: Joi.array().min(1).max(10).items(Joi.string().regex(idMongoRegex))
        .required(),
      photo: Joi.string().regex(/(?:(?:https?:\/\/))[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,4}\b(?:[-a-zA-Z0-9@:%_\+.~#?&\/=]*(\.jpg|\.png|\.jpeg))/),
    },
  },
  feed: {
    query: {
      search: Joi.string(),
      sort: Joi.string().valid(['time', 'rating']),
      only: Joi.string().valid(['tags', 'collections']),
      count: Joi.number().min(0),
    },
  },
  tag: {
    body: {},
    params: {
      tagName: Joi.string().min(2).max(50).required(),
    },
  },
  personalTags: {
    body: {
      tags: Joi.array().max(20).items(Joi.string().regex(idMongoRegex))
        .required(),
    },
    params: {
      firstLogin: Joi.boolean(),
    },
  },
  social: {
    params: {
      social: Joi.string().valid(['vk', 'ya', 'fb']).required(),
    },
    query: {
      uniqueId: Joi.string().guid().required(),
      clientId: Joi.string().required(),
      clientSecret: Joi.string().required(),
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
  bookmarks: {
    params: {
      type: Joi.string().valid(['savedCollections', 'savedLinks', 'createdCollections', 'addedLinks']).required(),
      id: Joi.string().regex(idMongoRegex),
    },
    query: {
      filter: Joi.string().valid(['new', 'opened']),
      userId: Joi.string(),
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

