# API проекта **ICEBERG** [![Build Status](https://travis-ci.org/Yamblz-Iceberg/iceberg-api.svg?branch=dev)](https://travis-ci.org/Yamblz-Iceberg/iceberg-api) [![Heroku](http://heroku-badge.herokuapp.com/?app=iceberg-project&style=flat&svg=1)](https://iceberg-project.herokuapp.com)

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

## Документация **Apiary**

[<img src="https://static.apiary.io/assets/v6Zkz37_.png" alt="APIARY" width="175px">](http://docs.icebergproject.apiary.io)

[docs.icebergproject.apiary.io](http://docs.icebergproject.apiary.io)
