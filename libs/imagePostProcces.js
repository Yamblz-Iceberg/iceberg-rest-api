const ColorThief = require('color-thief');
const Jimp = require('jimp');
const error = require('rest-api-errors');

const getImageBuffer = (image, imageMime) => new Promise((resolve, reject) => {
  image.getBuffer(imageMime, (err, buffer) => {
    if (err) {
      reject(err);
    }
    return resolve(buffer);
  });
});

const resizeImage = (imageSrc, size = 1000) => new Promise((resolve, reject) => {
  if (!imageSrc) {
    reject(new error.BadRequest('NO_FILE_ERR', 'File not found'));
  }
  Jimp.read(imageSrc.buffer)
    .then(image => image
      .resize(Jimp.AUTO, size > image.bitmap.height ? image.bitmap.height : size))
    .then(image => getImageBuffer(image, imageSrc.mimetype))
    .then(buffer => resolve({ buffer, mimetype: imageSrc.mimetype }))
    .catch(err => reject(err));
});

const getAverageColor = image => new Promise((resolve, reject) => {
  const colorThief = new ColorThief();

  return Jimp.read(image.buffer)
    .then(imageFromBuffer => imageFromBuffer
      .crop(imageFromBuffer.bitmap.width / 2,
        imageFromBuffer.bitmap.height - Math.round(imageFromBuffer.bitmap.height / 20),
        imageFromBuffer.bitmap.width,
        Math.round(imageFromBuffer.bitmap.height / 10)))
    .then(imageCropped => getImageBuffer(imageCropped, image.mimetype))
    .then(buffer => resolve(`rgb(${colorThief.getColor(buffer).join(', ')})`))
    .catch(err => reject(new error.InternalServerError('FILE_POST_PROCCES_ERR', err.message)));
});

module.exports.resize = resizeImage;
module.exports.average = getAverageColor;
