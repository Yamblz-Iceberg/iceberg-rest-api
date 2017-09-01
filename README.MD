# REST API проекта ICEBERG

- Вам необходимо установить **Node.js** и **MongoDB**
- Все настройки находятся в файле `config.json`
- Секретные настройки в `config_secret.json` - без них сервер локально, без переменных среды **не запустится**!

```bash
npm install
node databaseFake.js
npm run start
```

- Для livereload используй команду

```bash
npm run dev
npm run stop //убить процесс
```

- Если все сделано правильно, сервер будет доступен по адресу `http://localhost:1337`

## Типы запросов к серверу

- После исполнения `databaseFake.js` будет досутпен пользователь `myapi` с токеном `token`
- Для тестирования запросов используй [httpie](https://github.com/jkbr/httpie), а лучше [insomnia](https://insomnia.rest/download)
- Запросы **HTTP** или **HTTPS**
- Все запросы, для получения данных пользователей в должны сопровождаться **Bearer** токеном, пример для **httpie**: `http GET http://localhost:1337/rate/1/10 Authorization:'Bearer PUT_YOUR_TOKEN_HERE'`

### Register route

Все запросы авторизируются `'Basic clientId clientSecret'`

- **POST** `/register/demo` - регистрация по uniqueId(генерируем на устройстве) и password со статусом demo (по дефолту при старте приложения)
- **POST** `/register/basic` - регистрация по userId и password со статусом user (для тестирования)
- **POST** `/register/fb json={"uniqueId": "43e022dfd972b50a37af0a1ad090f2c996431"}` - авторизация через facebook и запись в демо аккаунт(теперь он будет полным)
- **POST** `/register/vk json={"uniqueId": "43ydsfdd972b50a37wl7af0a1ad090f2c996431"}` - авторизация через vkontakte и запись в демо аккаунт(теперь он будет полным)
- **PUT** `/register/logout json={"refreshToken": "43ydsfdd972b50a37wl7af0a1ad090f2c996431", "accesToken": "43ydsfdd972b50a37wl7af0a1ad090f2c996431"}` - удаление доступа
- **PUT** `/register/logoutall` -  деавторизация на всех устройствах

После получения статуса `user`, `userId` будет вида `fb_14000233422`

Получаем ответ в `/register/vk/callback` или `/register/fb/callback`
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

Для обновления токена `password = fbToken || vkToken`, либо же можно использовать случайный пароль `demo` аккаунта, но он хранится только на устройстве и будет утерян

- **POST** `/oauth/token
 grant_type=password client_id=android client_secret=SomeRandomCharsAndNumbers userId=myapi password=abc1234`- получение токена по логину и паролю
- **POST** `/oauth/token
 grant_type=refresh_token client_id=android client_secret=SomeRandomCharsAndNumbers refresh_token=[TOKEN]`- получение токена по рефреш токену id клиента и секретному ключу

### Feed route

- **GET** `/feed?sort=time&search=Colle`- получение ленты, по умолчанию сортировка по рейтингу, non-case-sensetive поиск

### Links route

- **POST** `/links/ json = {"link": "http://telegra.ph/Iceberg-Sample-08-31", "description": "Описание ссылки"}`- добавление ссылки

### Tags route

- **POST** `/tags/котики`- если тег существует то вернем id, если нет создадим и вернем id

### Collections route

- **GET** `/collections/:collectionId`- получение карточки
- **POST** `/collections json = {"description": "Очень хочу котика", "name": "Как завести кота", "photo": "https://pp.userapi.com/c543100/v543100915/2fbfb/IoVG_UEW-yw.jpg", "tags": ["59a57bfcc7291c53b91c94ca",  "59a57bfcc7291c53b91c94ca"]}`- добавление карточки
- **POST** `/collections/addLink/:collectionId/:linkId`- добавление ссылки в карточку

### Users route

- **GET** `/users/:userId?`- получение информации о пользователе
- **PUT** `/users json={object}` - изменение своего профиля
- **DELETE** `/users` - удалить пользователя

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