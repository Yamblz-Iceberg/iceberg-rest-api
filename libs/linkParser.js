const cheerio = require('cheerio');
const request = require('request');
const _ = require('lodash');
const ImageResolver = require('image-resolver');

const getInfo = url => new Promise((resolve, reject) => {
  try {
    request({ method: 'GET', url }, (err, response, body) => {
      if (err) {
        reject(err);
      }
      const resolver = new ImageResolver();
      resolver.register(new ImageResolver.FileExtension());
      resolver.register(new ImageResolver.MimeType());
      resolver.register(new ImageResolver.Opengraph());
      resolver.register(new ImageResolver.Webpage());

      const httpRegEx = /^http/;
      const domain = `${response.request.uri.protocol}//${response.request.uri.host}`;
      const $ = cheerio.load(body);
      resolver.resolve(url, (result) => {
        let photo = null;
        if (result && result.image) {
          photo = result.image;
        }
        const name = $('title').text();
        const hrefFavicon = $('link[rel~=icon]').attr('href');
        let favicon = null;
        if (hrefFavicon) {
          favicon = (httpRegEx.test(hrefFavicon) ? '' : domain) + hrefFavicon;
        }
        resolve({ photo, name, favicon });
      });
    });
  } catch (error) {
    reject(error);
  }
});

module.exports.getInfo = getInfo;
