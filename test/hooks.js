const before = require('hooks').before;
const after = require('hooks').after;

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app');

chai.use(chaiHttp);
chai.should();

const responseStash = {};

before('Профиль пользователя > Операции над профилем пользователя > Удалить профиль', (transaction) => {
  transaction.skip = true;
});

before('Профиль пользователя > Социальные возможности > Получить список друзей из социальных сетей', (transaction) => {
  transaction.skip = true;
});

after('Ссылки > Операции над ссылками > Добавить ссылку в базу данных', (transaction) => {
  responseStash.addedLink = JSON.parse(transaction.real.body).result;
});

before('Ссылки > Операции над ссылками > Удалить добавленную ссылку', (transaction) => {
  transaction.fullPath = transaction.fullPath.replace(/[^/]*$/, responseStash.addedLink._id);
});

after('Коллекции > Операции над коллекциями > Добавить коллекцию в базу данных', (transaction) => {
  responseStash.collection = JSON.parse(transaction.request.body);
  responseStash.addedCollection = JSON.parse(transaction.real.body).collection;
});

before('Коллекции > Операции над коллекциями > Получить коллекцию и содержащиеся в ней ссылки', (transaction) => {
  transaction.fullPath = transaction.fullPath.replace(/[^/]*$/, responseStash.addedCollection._id);
});

before('Коллекции > Операции над коллекциями > Удалить созданную коллекцию', (transaction) => {
  transaction.fullPath = transaction.fullPath.replace(/[^/]*$/, responseStash.addedCollection._id);
});
before('Коллекции > Операции над коллекциями > Добавить ссылку в коллекцию', (transaction, done) => {
  chai.request(`${transaction.host}:${transaction.port}`)
    .post('/links')
    .send({
      link: 'http://www.stackoverflow.com/questions/33267597/blur-content-behind-a-div-using-css3',
    })
    .set('authorization', 'Bearer token')
    .end((error, response) => {
      transaction.fullPath = transaction.fullPath.replace(/addLink\/.*/, `addLink/${responseStash.addedCollection._id}/${response.body.result._id}`);
      response.should.have.status(200);
      done();
    });
});

after('Регистрация > Полный аккаунт > Зарегистрироваться', (transaction, done) => {
  responseStash.token = JSON.parse(transaction.real.body).access_token;

  chai.request(`${transaction.host}:${transaction.port}`)
    .post('/links')
    .send({
      link: 'http://chaijs.com/plugins/chai-http/',
      description: 'chai-http is great!',
    })
    .set('authorization', `Bearer ${responseStash.token}`)
    .end((error, response) => {
      responseStash.addedLink = response.body.result;
      response.should.have.status(200);
      done();
    });
});

before('Закладки пользователя > Сохраненные ссылки > Добавить ссылку в сохраненные', (transaction) => {
  transaction.fullPath = transaction.fullPath.replace(/[^/]*$/, responseStash.addedLink._id);
});

before('Закладки пользователя > Сохраненные ссылки > Удалить ссылку из сохраненных', (transaction) => {
  transaction.fullPath = transaction.fullPath.replace(/[^/]*$/, responseStash.addedLink._id);
});

before('Закладки пользователя > Сохраненные коллекции > Добавить коллекцию в сохраненные', (transaction, done) => {
  chai.request(`${transaction.host}:${transaction.port}`)
    .post('/collections')
    .send(responseStash.collection)
    .set('authorization', `Bearer ${responseStash.token}`)
    .end((error, response) => {
      response.should.have.status(200);
      responseStash.addedCollection = response.body.collection;
      transaction.fullPath = transaction.fullPath.replace(/[^/]*$/, responseStash.addedCollection._id);
      console.log(transaction.fullPath);
      done();
    });
});

before('Закладки пользователя > Сохраненные коллекции > Удалить коллекцию из сохраненных', (transaction) => {
  transaction.fullPath = transaction.fullPath.replace(/[^/]*$/, responseStash.addedCollection._id);
});

before('Метрики > Метрики ссылок > Поставить лайк', (transaction) => {
  transaction.fullPath = transaction.fullPath.replace(/[^/]*$/, responseStash.addedLink._id);
});
