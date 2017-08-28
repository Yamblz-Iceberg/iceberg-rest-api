const config = require('../libs/config');
const error = require('rest-api-errors');
const FB = require('fb');
const VK = require('node-vkapi');

const getFriends = (user, fast = false) => new Promise((resolve, reject) => {
  if (!fast) {
    resolve();
  } else if (user.fbToken) {
    const fb = new FB.Facebook({
      appId: config.get('fb_id'),
      appSecret: config.get('fb_secret'),
      accessToken: user.fbToken,
    });
    return fb.api('me/friends', 'get')
      .then(response => resolve(response.data.map(userid => `fb_${userid}`)))
      .catch(err => reject(err));
  } else if (user.vkToken) {
    const vk = new VK({
      app: {
        id: config.get('vk_id'),
        secret: config.get('vk_secret'),
      },
      token: user.vkToken,
    });
    return vk.call('friends.getAppUsers')
      .then(response => resolve(response.map(userid => `vk_${userid}`)))
      .catch(err => reject(err));
  }
  return reject(new error.NotFound('NO_SOCIAL_TOKEN', 'Social token not found in user profile, try to relogin'));
});

module.exports.getFriends = getFriends;
