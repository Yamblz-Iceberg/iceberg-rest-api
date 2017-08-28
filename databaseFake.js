const mongoose = require('./libs/db/mongoose');
const async = require('async');
const faker = require('faker');

const config = require('./libs/config');
const log = require('./libs/log/log')(module);
const _ = require('lodash');

require('./dataModels/user');
require('./dataModels/collection');
require('./dataModels/link');
require('./dataModels/tag');
require('./dataModels/client');
require('./dataModels/accessToken');

mongoose.Promise = global.Promise;

const users = [];
const tags = [];
const links = [];


async.series([
  open,
  dropDatabase,
  requireModels,
  createUsers,
  createToken,
  createClients,
  createTags,
  createLinks,
  createCollections,
], (err) => {
  if (err) {
    log.info(err);
  }
  mongoose.models.User.count({})
    .then((count0) => {
      log.info('Users created:', count0);
      return mongoose.models.Tag.count({})
        .then((count1) => {
          log.info('Tags created:', count1);
          return mongoose.models.Link.count({})
            .then((count2) => {
              log.info('Links created:', count2);
              return mongoose.models.Collection.count({})
                .then((count3) => {
                  log.info('Collections created:', count3);
                  log.info('DB recreated successfully!');
                  process.exit(0);
                });
            });
        });
    })
    .catch(error => log.error(error));
});

const numberOfUsers = 10;
const tagsCount = 10;
const collectionsCount = 20;

function open(callback) {
  mongoose.connection.on('connected', callback);
}

function dropDatabase(callback) {
  const db = mongoose.connection.db;
  db.dropDatabase(callback);
}

function requireModels(callback) {
  async.each(Object.keys(mongoose.models), (modelName, _callback) => {
    mongoose.models[modelName].ensureIndexes(_callback);
  }, callback);
}


const generateUser = () => ({
  main: {
    userId: faker.random.uuid(),
    nickName: faker.internet.userName(),
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    photo: faker.image.avatar(),
    description: faker.name.jobTitle(),
  },
  password: faker.internet.password(),
});

function createUsers(callback) {
  for (let i = 0; i < numberOfUsers; i += 1) {
    users[i] = generateUser();
  }

  users.push({
    main: {
      userId: config.get('default:user:username'),
      nickName: 'myapi',
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      photo: faker.image.avatar(),
      description: faker.name.jobTitle(),
    },
    password: config.get('default:user:password'),
  });

  async.each(users, (userData, _callback) => {
    const user = new mongoose.models.User(userData.main);
    mongoose.models.User.register(user, userData.password, _callback);
  }, callback);
}

function createToken(callback) {
  const token = [{
    userId: config.get('default:user:username'),
    clientId: config.get('default:client:clientId'),
    token: config.get('default:user:token'),
  }];

  async.each(token, (userData, _callback) => {
    const tokenNew = new mongoose.models.AccessToken(userData);
    tokenNew.save(_callback);
  }, callback);
}

function createClients(callback) {
  const clients = [];

  clients.push({
    name: config.get('default:client:name'),
    clientId: config.get('default:client:clientId'),
    clientSecret: config.get('default:client:clientSecret'),
  });

  async.each(clients, (clientData, _callback) => {
    const client = new mongoose.models.Client(clientData);
    client.save(_callback);
  }, callback);
}

const generateTags = () => {
  for (let i = 0; i < tagsCount; i += 1) {
    tags.push({
      name: faker.lorem.words(2).replace(' ', ''),
      color: faker.internet.color(),
      textColor: faker.internet.color(),
    });
  }
  return tags;
};


function createTags(callback) {
  const curTags = generateTags();
  async.each(curTags, (curTagData, _callback) => {
    const curTag = new mongoose.models.Tag(curTagData);
    curTag.save(_callback);
  }, callback);
}

const generateLinks = () => {
  for (let i = 0; i < tagsCount; i += 1) {
    links.push({
      name: faker.lorem.sentence(),
      userAdded: _.sample(users).main.userId,
      favicon: faker.internet.avatar(),
      photo: faker.image.image(),
      url: faker.internet.url(),
    });
  }
  return links;
};


function createLinks(callback) {
  const curTags = generateLinks();
  async.each(curTags, (curLinkData, _callback) => {
    const curLink = new mongoose.models.Link(curLinkData);
    curLink.save(_callback);
  }, callback);
}

const generateCollections = () => new Promise((resolve, reject) => {
  const collections = [];
  return Promise.all([...Array(collectionsCount)].map(() => mongoose.models.Tag.distinct('_id')
    .then(idsTags => mongoose.models.Link.distinct('_id')
      .then((idsLinks) => {
        collections.push({
          name: faker.lorem.sentence(),
          authorId: _.sample(users).main.userId,
          photo: faker.image.image(),
          tags: _.sampleSize(idsTags, _.random(2, 3)),
          links: _.sampleSize(idsLinks, _.random(3, 10)),
          color: faker.internet.color(),
          textColor: faker.internet.color(),
        });
      }))
    .catch(err => reject(err))))
    .then(() => resolve(collections))
    .catch(err => log.error(err));
});

function createCollections(callback) {
  generateCollections()
    .then(curCollections => async.each(curCollections, (curCollectionData, _callback) => {
      const curCollection = new mongoose.models.Collection(curCollectionData);
      curCollection.save(_callback);
    }, callback));
}

