const cheerio = require('cheerio');
const request = require('request');
const _ = require('lodash');
const ImageResolver = require('image-resolver');
const findFavicon = require('find-favicon');

const getInfo = url => new Promise((resolve, reject) => {
  request({ method: 'GET', url }, (err, response, body) => {
    try {
      if (err) {
        reject(err);
      }
      const resolver = new ImageResolver();
      resolver.register(new ImageResolver.FileExtension());
      resolver.register(new ImageResolver.MimeType());
      resolver.register(new ImageResolver.Opengraph());
      resolver.register(new ImageResolver.Webpage());

      const $ = cheerio.load(body);
      resolver.resolve(url, (result) => {
        let photo = null;
        if (result && result.image) {
          photo = result.image;
        }
        const name = $('title').text();
        findFavicon(url, (error, faviconObject) => {
          let favicon;
          if (!err) {
            favicon = faviconObject.url;
          }
          resolve({ photo, name, favicon });
        });
      });
    } catch (error) {
      reject(error);
    }
  });
});

module.exports.getInfo = getInfo;
