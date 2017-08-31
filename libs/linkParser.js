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
    console.log();
    const $ = cheerio.load(body);
    const images = $('img').map(function (i, el) {
      return `${domain}${$(this).attr('src')}`;
    });
    let photo = _.first(images);
    if (!photo) photo = 'https://storage.googleapis.com/iceberg-cfa80.appspot.com/images/a02b5fc8-0f2c-4bfe-b56c-fd9fb0dae0b7.png';
    const name = $('title').text();
    const favicon = domain + $('link[rel=icon]').attr('href');
    resolve({ photo, name, favicon });
  });
});


module.exports.getInfo = getInfo;
