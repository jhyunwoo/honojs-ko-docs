# 공장 도우미

Factory Helper는 미들웨어와 같은 Hono의 구성 요소를 생성하는 데 유용한 기능을 제공합니다. 적절한 TypeScript 유형을 설정하는 것이 어려울 때도 있지만 이 도우미가 이를 쉽게 해줍니다.

## 가져오기

```ts
import { Hono } from 'hono'
import { createFactory, createMiddleware } from 'hono/factory'
```

## `createFactory()`

`createFactory()`는 Factory 클래스의 인스턴스를 생성합니다.

```ts
import { createFactory } from 'hono/factory'

const factory = createFactory()
```

Env 유형을 Generics로 전달할 수 있습니다.

```ts
type Env = {
  Variables: {
    foo: string
  }
}

const factory = createFactory<Env>()
```

### 옵션

### <Badge type="info" text="optional" /> defaultAppOptions: `HonoOptions`

`createApp()`로 생성된 Hono 애플리케이션에 전달하는 기본 옵션입니다.

```ts
const factory = createFactory({
  defaultAppOptions: { strict: false },
})

const app = factory.createApp() // `strict: false` is applied
```

## `createMiddleware()`

`createMiddleware()`는 `factory.createMiddleware()`의 단축키입니다.
이 함수는 사용자 정의 미들웨어를 생성합니다.

```ts
const messageMiddleware = createMiddleware(async (c, next) => {
  await next()
  c.res.headers.set('X-Message', '좋은 아침이에요!')
})
```

팁: `message`와 같은 인수를 얻으려면 다음과 같은 함수로 생성할 수 있습니다.

```ts
const messageMiddleware = (message: string) => {
  return createMiddleware(async (c, next) => {
    await next()
    c.res.headers.set('X-Message', message)
  })
}

app.use(messageMiddleware('좋은 저녁이에요!'))
```

## `factory.createHandlers()`

`createHandlers()`는 `app.get('/')`와 다른 위치에서 핸들러를 정의하는 데 도움이 됩니다.

```ts
import { createFactory } from 'hono/factory'
import { logger } from 'hono/logger'

// ...

const factory = createFactory()

const middleware = factory.createMiddleware(async (c, next) => {
  c.set('foo', 'bar')
  await next()
})

const handlers = factory.createHandlers(logger(), middleware, (c) => {
  return c.json(c.var.foo)
})

app.get('/api', ...handlers)
```

## `factory.createApp()`

`createApp()`는 적절한 유형으로 Hono 인스턴스를 생성하는 데 도움이 됩니다. `createFactory()`와 함께 이 방법을 사용하면 `Env` 유형 정의의 중복을 피할 수 있습니다.

애플리케이션이 이와 같은 경우 `Env`를 두 위치에 설정해야 합니다.

```ts
import { createMiddleware } from 'hono/factory'

type Env = {
  Variables: {
    myVar: string
  }
}

// 1. `Env`를 `new Hono()`로 설정합니다.
const app = new Hono<Env>()

// 2. `Env`를 `createMiddleware()`로 설정합니다.
const mw = createMiddleware<Env>(async (c, next) => {
  await next()
})

app.use(mw)
```

`createFactory()` 및 `createApp()`를 사용하면 `Env`를 한 곳에만 설정할 수 있습니다.

```ts
import { createFactory } from 'hono/factory'

// ...

// `Env`를 `createFactory()`로 설정합니다.
const factory = createFactory<Env>()

const app = factory.createApp()

// 공장에는 `createMiddleware()`도 있습니다.
const mw = factory.createMiddleware(async (c, next) => {
  await next()
})
```

`createFactory()`는 `initApp` 옵션을 받아 `createApp()`가 생성한 `app`를 초기화할 수 있습니다. 다음은 옵션을 사용한 예입니다.

```ts
// 공장 -db.ts
type Env = {
  Bindings: {
    MY_DB: D1Database
  }
  Variables: {
    db: DrizzleD1Database
  }
}

export default createFactory<Env>({
  initApp: (app) => {
    app.use(async (c, next) => {
      const db = drizzle(c.env.MY_DB)
      c.set('db', db)
      await next()
    })
  },
})
```

```ts
// crud.ts
import factoryWithDB from './factory-with-db'

const app = factoryWithDB.createApp()

app.post('/posts', (c) => {
  c.var.db.insert()
  // ...
})
```
