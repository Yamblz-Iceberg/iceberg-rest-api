const cheerio = require('cheerio');
const request = require('request');
const _ = require('lodash');

const getInfo = url => new Promise((resolve, reject) => {
  const options = {
    method: 'GET',
    url,
  };

  request(options, (err, response, body) => {
    if (err) {
      reject(err);
    }
    const domain = `${response.request.uri.protocol}//${response.request.uri.host}`;
    const $ = cheerio.load(body);
    const images = $('img').map(function (i, el) {
      const srcPhoto = $(this).attr('src');
      return `${(srcPhoto.match(/http/).length ? '' : domain)}${srcPhoto}`;
    });
    const photo = _.first(images);
    const name = $('title').text();
    const hrefFavicon = $('link[rel~=icon]').attr('href');
    const favicon = (hrefFavicon.match(/http/).length ? '' : domain) + hrefFavicon;
    resolve({ photo, name, favicon });
  });
});


module.exports.getInfo = getInfo;
