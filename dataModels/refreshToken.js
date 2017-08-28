const mongoose = require('mongoose');
// const crypto = require('crypto');

const Schema = mongoose.Schema;

const RefreshToken = new Schema({
  userId: {
    type: String,
    required: true,
  },
  clientId: {
    type: String,
    required: true,
  },
  token: {
    type: String,
    unique: true,
    required: true,
  },
  // hash: {
  //     type: String,
  //     required: true
  // },
  // salt: {
  //     type: String,
  //     required: true
  // },
  created: {
    type: Date,
    default: Date.now,
  },
});


// RefreshToken.methods.encryptToken = function (token) {
//     return crypto.pbkdf2Sync(token, this.salt, 10000, 512).toString('hex');
// };

// RefreshToken.virtual('token')
//     .set(function (token) {
//         this._plainToken = token;
//         this.salt = crypto.randomBytes(128).toString('hex');
//         this.hash = this.encryptToken(token);
//     })
//     .get(function () {
//         return this._plainToken;
//     });


// RefreshToken.methods.checkToken = function (token) {
//     return this.encryptToken(token) === this.hash;
// };

module.exports = mongoose.model('RefreshToken', RefreshToken);
