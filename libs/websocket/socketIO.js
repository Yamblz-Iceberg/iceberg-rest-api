const app = require('express');

const router = app.Router();
const log = require('../log/log')(module);

const AccessToken = require('../../dataModels/accessToken').AccessToken;

const event = require('../event');

module.exports = (io) => {
  io.on('connection', (socket) => {
    AccessToken.findOne({
      token: socket.handshake.query.token,
    }, (err, token) => {
      if (err) {
        log.info(err);
      }
      if (token) {
        log.info(`A user connected with id: ${token.userId}`);

        event.on(`newMessage_${token.userId}`, (a) => {
          socket.emit('newMessage', a);
        });

        socket.on('disconnect', () => {
          log.warn('A user disconnected');
        });

        socket.on('message', (msg) => {
          log.info(`A user send a message: ${msg}`);
        });

        socket.on('error', () => {
          log.error('An error occurred');
        });
      } else {
        log.info('Auth using token failed!');
      }
    });
  });

  return router;
};
