const cheerio = require('cheerio');
const request = require('request');
const _ = require('lodash');

const getInfo = url => new Promise((resolve, reject) => {
  const options = { method: 'GET', url };

  request(options, (err, response, body) => {
    if (err) {
      reject(err);
    }
    const httpRegEx = /http/;
    const domain = `${response.request.uri.protocol}//${response.request.uri.host}`;
    const $ = cheerio.load(body);
    const images = $('img').map(function (i, e) {
      const srcPhoto = $(this).attr('src');
      return `${(httpRegEx.test(srcPhoto) ? '' : domain)}${srcPhoto}`;
    });
    const photo = _.first(images);
    const name = $('title').text();
    const hrefFavicon = $('link[rel~=icon]').attr('href');
    const favicon = (httpRegEx.test(hrefFavicon) ? '' : domain) + hrefFavicon;
    resolve({ photo, name, favicon });
  });
});

module.exports.getInfo = getInfo;
