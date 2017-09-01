const cheerio = require('cheerio');
const request = require('request');
const _ = require('lodash');

const getInfo = url => new Promise((resolve, reject) => {
  request({ method: 'GET', url }, (err, response, body) => {
    if (err) {
      reject(err);
    }
    try {
      const httpRegEx = /http/;
      const excludeRegex = /logo/;
      const excludeClasses = [];
      const domain = `${response.request.uri.protocol}//${response.request.uri.host}`;
      const $ = cheerio.load(body);
      const images = $('#content img, article img, main img').map(function (i, e) {
        const srcPhoto = $(this).attr('src');
        if (excludeRegex.test(srcPhoto) || $(this).hasClass('avatar')) {
          return null;
        }
        return srcPhoto ? `${(httpRegEx.test(srcPhoto) ? '' : domain)}${srcPhoto}` : null;
      }).get();
      const name = $('title').text();
      const photo = _.first(images);
      const hrefFavicon = $('link[rel~=icon]').attr('href');
      const favicon = (httpRegEx.test(hrefFavicon) ? '' : domain) + hrefFavicon;
      resolve({ photo, name, favicon });
    } catch (error) {
      reject(error);
    }
  });
});

module.exports.getInfo = getInfo;
