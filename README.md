# Приложение для создания и редактирования информации о встречах сотрудников

Написано для Node.js 8 и использует библиотеки:
* express
* sequelize
* graphql

## Задание
Код содержит ошибки разной степени критичности. Некоторых из них стилистические, а некоторые даже не позволят вам запустить приложение. Вам необходимо найти и исправить их.

Пункты для самопроверки:
1. Приложение должно успешно запускаться
2. Должно открываться GraphQL IDE - http://localhost:3000/graphql/
3. Все запросы на получение или изменения данных через graphql должны работать корректно. Все возможные запросы можно посмотреть в вкладке Docs в GraphQL IDE или в схеме (typeDefs.js)
4. Не должно быть лишнего кода
5. Все должно быть в едином codestyle

## Запуск
```
npm i
npm run dev
```

Для сброса данных в базе:
```
npm run reset-db
```

## Решение

В качестве среды разработки здесь и далее пользуемся Visual Studio Code. Открываем в ней наш проект и начнём изучение приложения с позиции пользователя. Для начала запустим приложение через терминал Visual Studio Code, следуя инструкции по запуску: выполняем команды `npm i`, а затем `npm run dev`. В результате выполнения сталкиваемся с первой проблемой, о которой свидетельствует сообщение об ошибке в терминале, а именно:

```
Error: Dialect needs to be explicitly supplied as of v4.0.0
```

Помимо самого сообщение об ошибке в терминал так же выводится информация о том, в каком контексте возникла ошибка, в частности путь к файлу и строка с кодом, где возникла ошибка:

```
/Users/deilan/Dev/entrance-task-1/node_modules/sequelize/lib/sequelize.js:175
      throw new Error('Dialect needs to be explicitly supplied as of v4.0.0');
      ^
```

а так же stack trace:

```
    at new Sequelize (/Users/deilan/Dev/entrance-task-1/node_modules/sequelize/lib/sequelize.js:175:13)
    at Object.<anonymous> (/Users/deilan/Dev/entrance-task-1/models/index.js:7:19)
    at Module._compile (module.js:635:30)
    at Object.Module._extensions..js (module.js:646:10)
    at Module.load (module.js:554:32)
    at tryModuleLoad (module.js:497:12)
    at Function.Module._load (module.js:489:3)
    at Module.require (module.js:579:17)
    at require (internal/module.js:11:18)
    at Object.<anonymous> (/Users/deilan/Dev/entrance-task-1/graphql/resolvers/query.js:1:82)
    at Module._compile (module.js:635:30)
    at Object.Module._extensions..js (module.js:646:10)
    at Module.load (module.js:554:32)
    at tryModuleLoad (module.js:497:12)
    at Function.Module._load (module.js:489:3)
    at Module.require (module.js:579:17)
    at require (internal/module.js:11:18)
    at Object.<anonymous> (/Users/deilan/Dev/entrance-task-1/graphql/resolvers/index.js:3:15)
    at Module._compile (module.js:635:30)
    at Object.Module._extensions..js (module.js:646:10)
    at Module.load (module.js:554:32)
    at tryModuleLoad (module.js:497:12)
```

Завершается всё сообщением об аварийном завершении работы приложения:

```
[nodemon] app crashed - waiting for file changes before starting...
```

В первую очередь, вчитаемся в само сообщение об ошибке. Его примерный перевод на русский язык выглядит следующим образом:
> Ошибка: Диалект должен быть явно указан по состоянию на v4.0.0

Можно чуть обратить дополнительное внимание на то, в каком непосредственно месте возникла ошибка. Об этом свидетельствует 1-я строка stack trace:

```
at new Sequelize (/Users/deilan/Dev/entrance-task-1/node_modules/sequelize/lib/sequelize.js:175:13)
```

Если к настощему моменту имеется некоторый опыт и понимание работы Node.js и npm модулей, можно сделать вывод, что ошибка возникает в модуле sequelize:

```
/Users/deilan/Dev/entrance-task-1/node_modules/sequelize/
```

Если есть достаточное понимание работы Sequelize и того, что такое dialect,
можно уже на данном этапе сделать вывод о том, что в нашем коде/конфигурации явно не указан диалект.

Просматривая stack trace сверху вниз можно найти последнее место в нашем коде, откуда управление передаётся в код третьей стороны. Это вторая строка:
```
at Object.<anonymous> (/Users/deilan/Dev/entrance-task-1/models/index.js:7:19)
```

Осуществив переход в указанное место в коде, попадаем на инстанцирование объекта Sequelize. Здесь видим, что в качестве первых аргументов в конструктор Sequelize передаются `null`, а в качестве третьего аргумента передаётся объект настроек, в котором помимо прочего мы видим присвоение свойства `dialect: 'sqlite'`.

Становится понятно, что проблема не в том, что не указан dialect, а скорее всего в том, что объект с настройками не попадает в нужное место.

Поставим точку прерывание в месте инстанцирования объекта Sequelize и запустим наше приложение снова. По достижении точки прерывания нажмём Step Into и попадём в код конструктора Sequelize, вызываемого из нашего кода:

```
/Users/deilan/Dev/entrance-task-1/node_modules/sequelize/lib/sequelize.js
```

Это файл с кодом, соответствующий первой строке из stack trace (за вычетом строки и столбца кода, в которых возникла ошибка). Проинспектируем сигнатуру конструктора. Имеем 4 параметра. Мы помним, что передали 3 параметра, причём объект настроек передан в качестве третьего параметра под именем password, что семантически не соответствует объекту настроек. Если обратить внимание на документацию конструктора:

```
   * @param {String}   [database] The name of the database
   * @param {String}   [username=null] The username which is used to authenticate against the database.
   * @param {String}   [password=null] The password which is used to authenticate against the database. Supports SQLCipher encryption for SQLite.
   * @param {Object}   [options={}] An object with options.
```

так же нетрудно видеть, что объект настроек ожидается в качестве 4-го параметра.

Дополнительно убедиться в ошибочности позиционирования переданного нами аргумента можно продолжив выполнение в отладчике и обратив внимание на то, что после этапа вспомогательной инициализации аргументов в условных конструкуциях, объект настроек остаётся пустым объектом.

Далее по коду видим, что во внутреннее свойство options передаётся смёрженный объект из настроек по умолчанию и пользовательских (наших) настроек, при этом в настойках по умолчанию явно указано отсутствие значения свойства dialect: `dialect: null`. В результате слияния настроек по умолчанию и пустого объекта с пользовательскими настройками значение dialect не переопределяется, и далее по коду в охранном условии `if (!this.options.dialect)` и возникает ранее полученная нами ошибка.

Для её устранения в месте инстанцирования объекта Sequelize передаём в качестве 3-го аргумента (параметр password) значение `null`, а в качестве 4-го аргумента (параметр options) передаём наш объект с настройками.

Снова перезапускаем приложение и убеждаемся в том, что ошибка перестаёт воспроизводиться. В терминале дополнительно видим сообщение о том, что приложение запущено и работает:
`Express app listening on localhost:3000`

Продолжим наши изыскания в роли пользователя, открыв указанный адрес `localhost:3000` в своём любимом браузере.

Видим Hello. Посмотрим в консоль.

```
it works!
:3000/favicon.ico Failed to load resource: the server responded with a status of 404 (Not Found)
```

Ошибка с отсутствующей favicon имеет низкий приоритет, т. к. не нарушает основных сценариев использования приложения,
поэтому её отложим на потом.

В соответствии с п. 2 чек-листа:
`Должно открываться GraphQL IDE - http://localhost:3000/graphql/`

Открываем в браузере URL `http://localhost:3000/graphql/`

и видим сообщение
`Cannot GET /graphql/`

и в консоли:
`localhost/ Failed to load resource: the server responded with a status of 404 (Not Found)`

Переключаемся в "режим разработчика".

Смотрим в `package.json`, скрипт `dev`.
Видим `nodemon index.js`. Это значит, что входной точкой приложения является файл `index.js`. Открываем его.

Видим инициализацию нашего приложения, в частности настройку роутов: `/` и интересующего нас в данный момент `/graphql`, который импортируется из модуля `'./graphql/routes'`.

Первичный статический анализ кода данного модуля проблем не выявляет.

Возвращаемся обратно и ещё раз смотрим на роут. Видим, что роут `graphgl` указан с опечаткой в 6-м символе: `g` вместо `q`. Исправляем на положенное `graphql`. Переключаемся в режим пользователя и снова открываем `http://localhost:3000/graphql/`.

Проверяем querys;
users - работает
user(id: 1)
user(id: "2")
user(id: 3)
user(id: 4)
user(id: null)
user(id: undefined)
user(id: "0")

events - не работает. Получаем ошибку:

```js
{
  "errors": [
    {
      "message": "argumets is not defined",
      "locations": [
        {
          "line": 29,
          "column": 3
        }
      ],
      "path": [
        "events"
      ]
    }
  ],
  "data": {
    "events": null
  }
}
```

по документации параметры не нужны.

Доходим до `graphql/resolvers/query.js`

Смотрим на:

```js
events (root, args, context) {
  return models.Event.findAll(argumets, context);
},
```

Смотрим на сигнатуру `findAll`, там ожидается объект `sequelize`. Один параметр, а не два.
И объект с настройками, а не массив аргументов функции. Убираем `arguments` и `context`.

Запускаем. Теперь работает.

Посмотрим так же на конфигурации других запросов.
event - OK.
events - OK.
user - OK.
users - не ок.

Аналогично, убираем аргументы `findAll`, дабы не вызывать потенциальных проблем в будущем.

room - OK.
rooms - не ок.

в объекте опций поиска offset, который отфильтровывает из результирующего набора самую первую запись. Удаляем оба аргумента. Получаем в результате:

```js
event (root, { id }) {
  return models.Event.findById(id);
},
events (root, args, context) {
  return models.Event.findAll();
},
user (root, { id }) {
  return models.User.findById(id);
},
users (root, args, context) {
  return models.User.findAll();
},
room (root, { id }) {
  return models.Room.findById(id);
},
rooms (root, args, context) {
  return models.Room.findAll();
}
```

Проверяем ещё раз все запросы. Вот теперь ок.

Пробуем добавить недостающие аргументы к запросам.

```js
{
  events {
    id,
    title,
    dateStart,
    dateEnd,
    room {
      id
    }
  }
}
```

Не работает. Заглянем в `graphql/resolvers/index.js`.

Ставим точки прерывания в `event.getRoom()`. Доходим до прерывания. Инспектируем event. `getRoom()` отсутствует.
Однако данная функция есть в прототипе. Попробуем вызывать метод в консоли отладчика. Видим, что метод возвращает объект Promise. В вызывающем коде Promise не используется, что, скорее всего, свидетельствует о его ошибочном использовании. Добавляем `return` к результату вызова:

```js
event.getRoom();
```

Проверяем в браузере. Вот теперь работает.

Аналогично поступаем с функцией:

```js
users (event) {
  return event.getUsers();
},
```

Отлично, теперь все заявленные query с rooms работают корректно.

Переходим к Mutations:

```js
mutation {
  createUser(input: {
    login: "medved"
  }) {
    id
  }
}
```

Обращаем внимание на то, что нельзя указать атрибут `avatarUrl`. Исправляем это досадное упущение в файле typeDefs.js:

```js
input UserInput {
    login: String!
    homeFloor: Int
    avatarUrl: String
}
```

И убеждаемся, что теперь можно передать в качестве аргумента и `avatarUrl`.
Аналогично, проверяем `updateUser` и `removeUser`. Всё работает ожидаемым образом.

Далее сходим образом проверяем мутации, связанные с сущностью `Room`: `createRoom`, `updateRoom` и `removeRoom`. Всё ок.

Переходим к `Event`. Смотрим на `createEvent`. Принимает input, у которого даты в странном формате.
`roomId` сделаем необязательным в `typeDef`, т. к. мероприятие может быть анонсировано, но место проведения не определено.

без `usersIds` запись создаётся, но получаем в интерфейсе ValidationError:

```json
{
  "errors": [
    {
      "message": "Validation error",
      "locations": [
        {
          "line": 29,
          "column": 3
        }
      ],
      "path": [
        "createEvent"
      ]
    }
  ],
  "data": {
    "createEvent": null
  }
}
```

Открываем `mutation.js`:

```js
  createEvent (root, { input, usersIds, roomId }, context) {
    return models.Event.create(input)
            .then(event => {
              event.setRoom(roomId);

              return event.setUsers(usersIds)
                    .then(() => event);
            });
  },
```

В случае если `usersIds` в запросе не указан, делаем fallback на пустой массив:

```js
return event.setUsers(usersIds || []).then(() => event);
```

Теперь наш запрос работает:

```js
mutation {
  createEvent(input: { title: "qwe", dateStart: "2018-01-01T00:00:00.000Z", dateEnd:"2018-01-02T00:00:00.000Z"}) {
    id
  }
}
```

Попробуем в запрос добавить `roomId: 1`. Работает.
`roomId: 100`. Запись добавляется, но `roomId: null`.

Видим в Debug Console:

```
Unhandled rejection SequelizeForeignKeyConstraintError: SQLITE_CONSTRAINT: FOREIGN KEY constraint failed
debuggability.js:868
    at Query.formatError (/Users/deilan/Dev/entrance-task-1/node_modules/sequelize/lib/dialects/sqlite/query.js:374:18)
    at Statement.afterExecute (/Users/deilan/Dev/entrance-task-1/node_modules/sequelize/lib/dialects/sqlite/query.js:119:32)
    at Statement.replacement (/Users/deilan/Dev/entrance-task-1/node_modules/sqlite3/lib/trace.js:19:31)
```

Смотрим на mutation.js:

```js
  // Event
  createEvent (root, { input, usersIds, roomId }, context) {
    return models.Event.create(input)
            .then(event => {
              event.setRoom(roomId);

              return event.setUsers(usersIds || [])
                    .then(() => event);
            });
  },
```

Чтобы ошибка при связывании с переговоркой не проглатывалась, добавим ей недостающий `return`,
а связывание пользователей вынесем на уровень вверх, чтобы оно выполнялось при успешном выполнении предыдущих операций.

```js
  createEvent (root, { input, usersIds, roomId }, context) {
    return models.Event.create(input)
            .then(event => {
              return event.setRoom(roomId)
                .then(() => event);
            })
            .then(event => {
              return event.setUsers(usersIds || [])
                    .then(() => event);
            });
  },
```

Теперь при попытке выставить несуществующий `roomId`, как и положено, получаем ошибку.
Аналогично, если пытаемся выставить несуществующие `usersIds`, тоже получаем ошибку.

```json
{
  "errors": [
    {
      "message": "SQLITE_CONSTRAINT: FOREIGN KEY constraint failed",
      "locations": [
        {
          "line": 29,
          "column": 3
        }
      ],
      "path": [
        "changeEventRoom"
      ]
    }
  ],
  "data": {
    "changeEventRoom": null
  }
}
```

Для выпуска приложения в `production` так же следовало бы для безопасности
скрыть внутренние технические подробности возникновения ошибки (`SQLITE_CONSTRAINT` и т. п.), а вместо них
для удобства пользователя показывать простое и понятное пояснение о возникшей проблеме.

С `changeEventRoom` история аналогичная:

```js
changeEventRoom (root, { id, roomId }, context) {
  return models.Event.findById(id)
          .then(event => {
            event.setRoom(id);
          });
}
```

Добавляем недостающий return:

```js
changeEventRoom (root, { id, roomId }, context) {
  return models.Event.findById(id)
          .then(event => {
            return event.setRoom(id);
          });
}
```

У вызова `event.setRoom(id)` неправильно указан аргумент. Исправим на `event.setRoom(roomId)`.

```js
changeEventRoom (root, { id, roomId }, context) {
  return models.Event.findById(id)
          .then(event => {
            return event.setRoom(roomId)
          });
},
```

Смотрим на `removeUserFromEvent`:
```js
  removeUserFromEvent (root, { id, userId }, context) {
    return models.Event.findById(id)
            .then(event => {
              event.removeUser(userId);
              return event;
            });
  },
```

Похожая история: если `promise` в `removeUser` завершился неуспешно, ошибка окажется не обработана. Исправляем это,
а заодно возвращаем после `removeUser` объект `event` вместо результата `removeUser()`.

```js
  removeUserFromEvent (root, { id, userId }, context) {
    return models.Event.findById(id)
            .then(event => {
              return event.removeUser(userId)
                .then(() => event);
            });
  },
```

Теперь все мутации работают ожидаемым образом, и задание в целом можно считать выполненным.

### Улучшения

#### Связь от Room к Events

Добавим graphql-связи от `Room` к `Event` и от `User` к `Event`, чтобы иметь возможность получать данные о событиях, назначенных на переговорку, и о пользователях, участвующих в событии. Для этого добавим в `models/scheme.js`:

```js
Room.hasMany(Event);
```

А в `graphql/typeDefs.js` типы `User` и `Room` будут выглядеть так:

```
type User {
    id: ID!
    login: String!
    homeFloor: Int
    avatarUrl: String!
    events: [Event]
}

type Room {
    id: ID!
    title: String!
    capacity: Int!
    floor: Int!
    events: [Event]
}
```

В возвращаемый из `graphql/resolvers/index.js` объект добавим соответствующие свойства:

```js
Room: {
  events (room) {
    return room.getEvents();
  }
},
User: {
  events (user) {
    return user.getEvents();
  }
}
```

#### Добавление setUsersOfEvent

Добавим для `Event` мутацию `setUsersOfEvent`, которая позволит нам по массиву идентификатор пользователей
назначить для события соответствующих пользователей.

В схему `graphql/typeDefs.js` добавим соответствующую запись:

```
setUsersOfEvent(id: ID!, usersIds: [ID]): Event
```

В объект из `graphql/resolvers/mutation.js` добавим:

```js
setUsersOfEvent(root, { id, usersIds }, content) {
  return models.Event.findById(id)
          .then(event => {
            return event.setUsers(usersIds || [])
              .then(() => event);
          });
}
```

#### Рефакторинг

В `graphql/typeDefs.js` удаляем type `UserRoom`, т. к. он не используется и не нужен.

Удаляем `pages/**` и `public/**` и соответствующие конфигурации, исходя из предположения,
что наше API следует принципу единственной ответственности и предназначено для управления данными:

`rm -rf pages public`

Удаляем:

```js
const pagesRoutes = require('./pages/routes');

app.use('/', pagesRoutes)
app.use(express.static(path.join(__dirname, 'public')));
```

Так же убираем `bodyParser` и конфигурацию для него, т. к. он не нужен,
ибо подсистема `graphql` обрабатывает тела входящих запросов самостоятельно:

```js
const bodyParser = require('body-parser');
app.use(bodyParser.json());
```

и удаляем зависимость:
`npm uninstall -S body-parser`

Не нужна нам и подсистема работы с путями:

```js
const path = require('path');
```

Поскольку мы не пользуемся [алиасами](http://docs.sequelizejs.com/manual/tutorial/querying.html#operators-security),
в `models/index.js` убираем:

```js
const Op = Sequelize.Op;
```

и меняем:

```js
operatorsAliases: { $and: Op.and },
```

на

```js
operatorsAliases: false,
```

Убираем лишнее в `create-mock-data.js`:

```js
    .then(() => Promise.all([
      models.User.findAll(),
      models.Room.findAll(),
      models.Event.findAll()
    ]))
```

Меняем:

```js
let promises = [];
      promises.push(events[0].setRoom(rooms[0]));
      promises.push(events[1].setRoom(rooms[1]));
      promises.push(events[2].setRoom(rooms[2]));

      promises.push(events[0].setUsers([users[0], users[1]]));
      promises.push(events[1].setUsers([users[1], users[2]]));
      promises.push(events[2].setUsers([users[0], users[2]]));

      return Promise.all(promises);
```

на:

```js
Promise.all([usersPromise, roomsPromise, eventsPromise])
  .then(function ([users, rooms, events]) {
    return Promise.all([
      events[0].setRoom(rooms[0]),
      events[1].setRoom(rooms[1]),
      events[2].setRoom(rooms[2]),
      events[0].setUsers([users[0], users[1]]),
      events[1].setUsers([users[1], users[2]]),
      events[2].setUsers([users[0], users[2]])
    ]);
  });
```

Переупорядочим type Mutation:

```
createEvent(input: EventInput!, usersIds: [ID], roomId: ID!): Event
updateEvent(id: ID!, input: EventInput!): Event
removeEvent(id: ID!): Event
addUserToEvent(id: ID!, userId: ID!): Event
changeEventRoom(id: ID!, roomId: ID!): Event
removeUserFromEvent(id: ID!, userId: ID!): Event
```

Меняем:

```js
app.listen(3000, () => console.log('Express app listening on localhost:3000'));
```

на

```js
app.set('port', 3000);
app.listen(app.get('port'), () => console.log(`Express app listening on localhost: ${app.get('port')}`));
```

Вынесем из `index.js` часть, отвечающую за конфигурирование внутренней работы приложения в `app.js`:

```js
const express = require('express');

const graphqlRoutes = require('./graphql/routes');

const app = express();
app.use('/graphql', graphqlRoutes);

module.exports = app;
```

Тогда `index.js` примет следующий вид:

```js
const app = require('./app');

app.set('port', 3000);
app.listen(app.get('port'), () => console.log(`Express app listening on localhost: ${app.get('port')}`));
```

Так же при желании можно вынести настройки порта в отдельный конфигурационный json-файл и даже настроить считывание
настроек из переменных окружения при помощи такого инструмента как [nconf](https://github.com/indexzero/nconf).

В частности, если потребуется задавать переменные окружения при запуске того или иного режима работы приложения,
то для поддержки кроссплатформенности можно использовать [cross-env](https://github.com/kentcdodds/cross-env/).

#### CORS

Подключим CORS чтобы иметь возможность отправлять AJAX/XHR-запросы к нашему HTTP API из приложений, размещённых на сторонних хостах.
Впоследствии нам это пригодится при выполнении 3-го задания. `app.js`:

```js
const cors = require('cors');
const express = require('express');

const graphqlRoutes = require('./graphql/routes');

const app = express();
app.use(cors());
app.use('/graphql', graphqlRoutes);

module.exports = app;
```

#### Lint

Как видно по `package.json`, в качестве линтера использован `semistandard`.
Будем считать, что использование этого инструмента принято в нашем проекте и/или команде,
а в качестве набора правил приняты правила по умолчанию.
Запустим линтера, чтобы проверить соответствие кода правилам:

`npm run lint`

Результат:
```
semistandard: Semicolons For All! (https://github.com/Flet/semistandard)
semistandard: Run `semistandard --fix` to automatically fix some problems.
  /Users/deilan/Dev/entrance-task-1/create-mock-data.js:6:20: Missing space before function parentheses.
  /Users/deilan/Dev/entrance-task-1/create-mock-data.js:8:7: Expected indentation of 4 spaces but found 6.
  /Users/deilan/Dev/entrance-task-1/create-mock-data.js:9:7: Expected indentation of 4 spaces but found 6.
  /Users/deilan/Dev/entrance-task-1/create-mock-data.js:10:7: Expected indentation of 4 spaces but found 6.
  /Users/deilan/Dev/entrance-task-1/create-mock-data.js:11:5: Expected indentation of 2 spaces but found 4.
  /Users/deilan/Dev/entrance-task-1/create-mock-data.js:12:5: Expected indentation of 2 spaces but found 4.
  /Users/deilan/Dev/entrance-task-1/create-mock-data.js:13:7: Expected indentation of 4 spaces but found 6.
  /Users/deilan/Dev/entrance-task-1/create-mock-data.js:14:7: Expected indentation of 4 spaces but found 6.
  /Users/deilan/Dev/entrance-task-1/create-mock-data.js:15:7: Expected indentation of 4 spaces but found 6.
  /Users/deilan/Dev/entrance-task-1/create-mock-data.js:16:5: Expected indentation of 2 spaces but found 4.
  /Users/deilan/Dev/entrance-task-1/create-mock-data.js:17:5: Expected indentation of 2 spaces but found 4.
  /Users/deilan/Dev/entrance-task-1/create-mock-data.js:18:7: Expected indentation of 4 spaces but found 6.
  /Users/deilan/Dev/entrance-task-1/create-mock-data.js:19:7: Expected indentation of 4 spaces but found 6.
  /Users/deilan/Dev/entrance-task-1/create-mock-data.js:20:7: Expected indentation of 4 spaces but found 6.
  /Users/deilan/Dev/entrance-task-1/create-mock-data.js:21:5: Expected indentation of 2 spaces but found 4.
  /Users/deilan/Dev/entrance-task-1/create-mock-data.js:25:7: Expected indentation of 4 spaces but found 6.
  /Users/deilan/Dev/entrance-task-1/create-mock-data.js:26:7: Expected indentation of 4 spaces but found 6.
  /Users/deilan/Dev/entrance-task-1/create-mock-data.js:27:7: Expected indentation of 4 spaces but found 6.
  /Users/deilan/Dev/entrance-task-1/create-mock-data.js:28:5: Expected indentation of 2 spaces but found 4.
  /Users/deilan/Dev/entrance-task-1/create-mock-data.js:29:5: Expected indentation of 2 spaces but found 4.
  /Users/deilan/Dev/entrance-task-1/create-mock-data.js:30:7: Expected indentation of 4 spaces but found 6.
  /Users/deilan/Dev/entrance-task-1/create-mock-data.js:31:7: Expected indentation of 4 spaces but found 6.
  /Users/deilan/Dev/entrance-task-1/create-mock-data.js:32:7: Expected indentation of 4 spaces but found 6.
  /Users/deilan/Dev/entrance-task-1/create-mock-data.js:33:5: Expected indentation of 2 spaces but found 4.
  /Users/deilan/Dev/entrance-task-1/create-mock-data.js:34:5: Expected indentation of 2 spaces but found 4.
  /Users/deilan/Dev/entrance-task-1/create-mock-data.js:35:7: Expected indentation of 4 spaces but found 6.
  /Users/deilan/Dev/entrance-task-1/create-mock-data.js:36:7: Expected indentation of 4 spaces but found 6.
  /Users/deilan/Dev/entrance-task-1/create-mock-data.js:37:7: Expected indentation of 4 spaces but found 6.
  /Users/deilan/Dev/entrance-task-1/create-mock-data.js:38:5: Expected indentation of 2 spaces but found 4.
  /Users/deilan/Dev/entrance-task-1/create-mock-data.js:39:5: Expected indentation of 2 spaces but found 4.
  /Users/deilan/Dev/entrance-task-1/create-mock-data.js:40:7: Expected indentation of 4 spaces but found 6.
  /Users/deilan/Dev/entrance-task-1/create-mock-data.js:41:7: Expected indentation of 4 spaces but found 6.
  /Users/deilan/Dev/entrance-task-1/create-mock-data.js:42:7: Expected indentation of 4 spaces but found 6.
  /Users/deilan/Dev/entrance-task-1/create-mock-data.js:43:5: Expected indentation of 2 spaces but found 4.
  /Users/deilan/Dev/entrance-task-1/create-mock-data.js:44:5: Expected indentation of 2 spaces but found 4.
  /Users/deilan/Dev/entrance-task-1/create-mock-data.js:45:7: Expected indentation of 4 spaces but found 6.
  /Users/deilan/Dev/entrance-task-1/create-mock-data.js:46:7: Expected indentation of 4 spaces but found 6.
  /Users/deilan/Dev/entrance-task-1/create-mock-data.js:47:7: Expected indentation of 4 spaces but found 6.
  /Users/deilan/Dev/entrance-task-1/create-mock-data.js:48:5: Expected indentation of 2 spaces but found 4.
  /Users/deilan/Dev/entrance-task-1/create-mock-data.js:58:7: Expected indentation of 4 spaces but found 6.
  /Users/deilan/Dev/entrance-task-1/create-mock-data.js:59:7: Expected indentation of 4 spaces but found 6.
  /Users/deilan/Dev/entrance-task-1/create-mock-data.js:60:7: Expected indentation of 4 spaces but found 6.
  /Users/deilan/Dev/entrance-task-1/create-mock-data.js:61:5: Expected indentation of 2 spaces but found 4.
  /Users/deilan/Dev/entrance-task-1/create-mock-data.js:62:5: Expected indentation of 2 spaces but found 4.
  /Users/deilan/Dev/entrance-task-1/create-mock-data.js:63:7: Expected indentation of 4 spaces but found 6.
  /Users/deilan/Dev/entrance-task-1/create-mock-data.js:64:7: Expected indentation of 4 spaces but found 6.
  /Users/deilan/Dev/entrance-task-1/create-mock-data.js:65:7: Expected indentation of 4 spaces but found 6.
  /Users/deilan/Dev/entrance-task-1/create-mock-data.js:66:5: Expected indentation of 2 spaces but found 4.
  /Users/deilan/Dev/entrance-task-1/create-mock-data.js:67:5: Expected indentation of 2 spaces but found 4.
  /Users/deilan/Dev/entrance-task-1/create-mock-data.js:68:7: Expected indentation of 4 spaces but found 6.
  /Users/deilan/Dev/entrance-task-1/create-mock-data.js:69:7: Expected indentation of 4 spaces but found 6.
  /Users/deilan/Dev/entrance-task-1/create-mock-data.js:70:7: Expected indentation of 4 spaces but found 6.
  /Users/deilan/Dev/entrance-task-1/create-mock-data.js:71:5: Expected indentation of 2 spaces but found 4.
  /Users/deilan/Dev/entrance-task-1/create-mock-data.js:82:49: Unexpected trailing comma.
  /Users/deilan/Dev/entrance-task-1/create-mock-data.js:88:21: Newline required at end of file but not found.
  /Users/deilan/Dev/entrance-task-1/graphql/routes.js:18:17: Unexpected trailing comma.
```

Запустим линтер с автоматическим исправлением:

```
npm run lint -- --fix
```

И проверим ещё раз:

```
npm run lint
```

Теперь всё ок.

#### semistandard + VS Code

Подключим соответствующее расширение для интеграции нашего линтера с VS Code: `ext install standardjs`.

Следуя документации расширения, сконфигурируем VS Code, добавив в файл `.vscode/settings.json` настройку для `semistandard`:
```json
{
    "standard.semistandard": true
}
```

И перезапустим VS Code.

#### CI

Подключим Travis CI, чтобы соответствие стайлгайду проверялось автоматически при коммите.

Зайдём на [сайт Travis](travis-ci.org) и подключим наш репозиторий.

Добавим файл `.travis.yml` и заполним его в соответствии с указаниями в документации Travis CI для Node.js.

В требованиях и `package.json` у нас `"node": ">=8.4.0"`, поэтому укажем в `.travis.yml`:

```yaml
language: node_js
node_js:
  - "8"
```

Добавим в `package.json` npm-скрипт `ci:travis`:

```json
"scripts": {
  "ci:travis": "npm run lint"
},
```

Коммитим и убеждаемся, что билд проходит.

#### Автоматическая проверка перед коммитом

Добавим `husky` для проверки линтинга перед коммитом, чтобы в репозиторий не попадали коммиты, не соответствующие стайлгайду.

`npm install --save-dev husky`

Добавляем в `package.json` скрипт:
```json
  "scripts": {
    "precommit": "npm run lint"
  }
```

Теперь если код не соответствует правилам перед коммитом и пушем будем получать сообщение об ошибке.

#### Автоматическое исправление линтера перед коммитом

Добавим lint-staged, чтобы код, не соответствующий правилам, по возможности исправлялся автоматически:

`npm install --save-dev lint-staged`

добавим в `package.json`:

```json
  "lint-staged": {
    "*.js": ["semistandard --fix", "git add"]
  }
```

и поменяем `precommit`:

```json
  "scripts": {
    "precommit": "lint-staged && npm run lint"
  }
```

Теперь стиль кода будет автоматически исправляться при коммите.
Так же в будущем не помешает добавить и прогон тестов, чтобы убедиться,
что при очередном коммите не произошло регрессии приложения.

#### favicon

Установим и подключим `express-blank-favicon`, чтобы избавиться от ошибки 404 при запросе favicon
при посещении страницы `graphiql`

`npm install --save express-blank-favicon`

Добавим в `app.js`:

```js
app.use(require('express-blank-favicon'));
```

### Автоматические тесты

Добавим `jest` для тестирования:

`npm install --save-dev jest`

и соответствующий npm-скрипт в `package.json` + запуск тестов в travis:

```json
{
  "scripts": {
    "test": "jest",
    "ci:travis": "npm run lint && npm test"
  }
}
```

Добавим `supertest` для тестирования нашего API с использованием запросов

`npm install --save-dev supertest`

Добавляем `app.test.js` и первый тест в него:

```js
/* eslint-env jest */
const request = require('supertest');
const app = require('./app');

describe('GET /graphql', () => {
  describe('Users', () => {
    describe('?query={users{id}}', () => {
      it('responds with 200', (done) => {
        request(app)
          .get('/graphql?query={users{id}}')
          .expect(200, done);
      });
    });
  });
});
```

Запускаем `npm test`. Всё отлично.

Добавляем тесты для остальных query и mutations. Итоговый результат можно посмотреть в `app.test.js`.

Сейчас для простоты при тестировании будем использовать существующий файл `db.sqlite3`, однако следует имет в виду,
что в более реалистичном сценарии следует использовать отдельную базу для тестирования.
Оптимально было бы генерировать её перед запуском тестом и удалять после их завершения,
либо использовать режим работы `:memory:` для размещения БД прямо в памяти.