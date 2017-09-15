# API проекта ICEBERG [![Build Status](https://travis-ci.org/Yamblz-Iceberg/iceberg-api.svg?branch=dev)](https://travis-ci.org/Yamblz-Iceberg/iceberg-api) [![Heroku](http://heroku-badge.herokuapp.com/?app=iceberg-project&style=flat&svg=1)](https://iceberg-project.herokuapp.com)

- Вам необходимо установить **Node.js** и **MongoDB**
- Секретные настройки в `config_secret.json` и `google-credentials.json` - без них или без переменных среды локально сервер **не запустится**!
- Чтобы использовать файлы `config_secret_enc.json` и `google-credentials_enc.json` (зашифрованные данные), установите `CONFIG_ENCRYPTION_KEY=КЛЮЧ_ШИФРОВАНИЯ`

```bash
npm install
node databaseFake.js
npm start
```

- Для livereload через `pm2` используй команду

```bash
npm run dev
npm run stop
```

- Тесты

```bash
npm test
```

- Если все сделано правильно, сервер будет доступен по адресу `http://localhost:1337`

## Типы запросов к серверу

- После исполнения `databaseFake.js` будет досутпен пользователь `myapi` с токеном `token`, другие стандартные настройки в файле `config.json` (_прикрепить ссылку на workspace insomnia_)
- Для тестирования запросов используй [httpie](https://github.com/jkbr/httpie), а лучше [insomnia](https://insomnia.rest/download)
- Все запросы, для получения данных пользователей в должны сопровождаться **Bearer** токеном, пример для **httpie**: `http GET http://localhost:1337/rate/1/10 Authorization:'Bearer PUT_YOUR_TOKEN_HERE'`

### Register route

Все запросы авторизируются заголовком `'Basic clientId:clientSecret'`

- **POST** `/register/demo` - регистрация по uniqueId(генерируем на устройстве) и password со статусом demo (по дефолту при старте приложения)
- **POST** `/register/basic` - регистрация по userId и password со статусом user (для тестирования)
- **GET** `/register/:social json={"uniqueId": "43e022dfd972b50a37af0a1ad090f2c996431"}` - авторизация через facebook и запись в демо аккаунт(теперь он будет полным)
- **PUT** `/register/logout json={"refreshToken": "43ydsfdd972b50a37wl7af0a1ad090f2c996431", "accesToken": "43ydsfdd972b50a37wl7af0a1ad090f2c996431"}` - удаление доступа
- **PUT** `/register/logoutall` -  деавторизация на всех устройствах

После получения статуса `user`, `userId` будет вида `fb_14000233422`

Получаем ответ в `/register/:social/callback`
с содержанием:

```json
{
  "access_token": "c27224b2f60281b4bf70de87eda4d00806a83b7ea680ecef0ab5d89c9c6fc3f1",
  "expires_in": 3600,
  "refresh_token": "6f46607bb629e83707cd6eb4ff9518d7f74422e0063d62a70c8ef3a3455a733a",
  "token_type": "Bearer"
}
```

### Outh route

- **POST** `/oauth/token
 grant_type=password client_id=android client_secret=SomeRandomCharsAndNumbers userId=myapi password=abc1234`- получение токена по логину и паролю
- **POST** `/oauth/token
 grant_type=refresh_token client_id=android client_secret=SomeRandomCharsAndNumbers refresh_token=[TOKEN]`- получение токена по рефреш токену id клиента и секретному ключу

### Feed route

- **GET** `/feed?sort=time&search=Colle&only=tags&count=10`- получение ленты, по умолчанию сортировка по рейтингу, non-case-sensetive поиск, только теги (tags, collections), количество в выдаче

### Links route

- **POST** `/links/ json = {"link": "http://telegra.ph/Iceberg-Sample-08-31", "description": "Описание ссылки"}`- добавление ссылки
- **PUT** `/links/open/:linkId` - отметить ссылку открытой
- **PUT** `/links/like/:linkId` - лайкнуть ссылку

### Tags route

- **POST** `/tags/котики`- если тег существует то вернем id, если нет создадим и вернем id
- **PUT** `/tags/personal json = {"tags": ["59a57bfcc7291c53b91c94ca", "59a57bfcc7291c53b91c94ca"]}`- добавление персональных тегов

### Collections route

- **GET** `/collections/:collectionId`- получение коллекция
- **POST** `/collections json = {"description": "Очень хочу котика", "name": "Как завести кота", "photo": "https://pp.userapi.com/c543100/v543100915/2fbfb/IoVG_UEW-yw.jpg", "tags": ["59a57bfcc7291c53b91c94ca",  "59a57bfcc7291c53b91c94ca"]}`- добавление коллекции
- **PUT** `/collections/addLink/:collectionId/:linkId`- добавление ссылки в коллекцию
- **PUT** `/collections/open/:collectionId` - отметить коллекцию открытой

### Users route

- **GET** `/users/:userId?`- получение информации о пользователе
- **PUT** `/users json={object}` - изменение своего профиля
- **DELETE** `/users` - удалить пользователя
- **PUT** `/users/bookmarks/:type/:id` - добавить в закладки (:type = savedCollections, savedLinks)
- **DELETE** `/users/bookmarks/:type/:id` - удалить из закладкок (:type = savedCollections, savedLinks, addedLinks, createdCollections)
- **GET** `/users/bookmarks/:type/` - получить закладки (:type = savedCollections, savedLinks, addedLinks, createdCollections)

### Upload route

- **POST** `/upload`- загрузка файла и получение среднего цвета нижней части картинки

```html
<form ref='uploadForm' action='/upload' method='post' encType="multipart/form-data">
  <input type="file" name="photo" accept="image/*" capture="camera" />
  <input type='submit' value='Upload!'/>
</form>
```

- **RESPONCE** после загрузки

```json
{
  "fileName": "/images/d21fbec2-4ebc-425b-afdb-b5614921f2f5.jpeg",
  "mainColor": "rgb(4, 107, 235)"
}
```
## Ошибки возвращаемые API

|Типы ошибок|Описание|
|---|---|
|API_ERROR|общие ошибки api, коды приведены ниже|
|FB_API_ERROR|ошибка методов facebook api|
|MONGO_ERROR|ошибка MongoDB|
|REGISTRATION_ERROR|ошибка при регистрации|
|VALIDATION_ERROR|ошибка при валидации параметров запроса|
|VK_API_ERROR|ошибка методов vk api|
|VK_AUTH_ERROR|ошибка аунтификации vk|

Статусы HTTP:

- BadRequest
- BandwidthLimitExceeded
- Forbidden
- InternalServerError
- MethodNotAllowed
- NotFound
- Unauthorized

|Коды ошибок API|Расшифровка|
|---|---|
|AUTH_ERR| ошибка аунтификации|
|BOOKMARK_ADD_ERR|ошибка при добавлении закладки|
|BOOKMARKS_ERR| общая ошибка закладок|
|CONTENT_DELETE_ERR| ошибка при удалении|
|ERROR_PARSE_ERR|ошибка парсинга|
|FILE_POST_PROCCES_ERR|ошибка обработки изображения на сервере|
|GC_UPLOAD_ERR|ошибка загрузки на firebase|
|INVALID_STATE_LENGTH_ERR|неправильная длина state параметров|
|INVALID_USER_DATA_ERR|неправильные данные пользователя|
|LINK_LIKE_ERR|ошибка при добавлении/удалении лайка|
|METRICS_OPEN_ERR|ошибка при отметке контента открытым|
|NO_BOOKMARKS_ERR|закладка не найдена|
|NO_COLLECTIONS_ERR|коллекция не найдена|
|NO_FILE_ERR|нет файла при обработке|
|NO_LINK_ERR|ссылка не найдена|
|NO_ROUTE_ERR|роут не существует|
|NO_TAGS_ERR|тег не найден|
|NO_USER_ERR |пользователь не найден|
|NOT_ALLOWED_ERR|метод не разрешен|
