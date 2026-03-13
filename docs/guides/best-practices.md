# 모범 사례

Hono는 매우 유연합니다. 원하는 대로 앱을 작성할 수 있습니다.
그러나 따라야 할 더 나은 모범 사례가 있습니다.

## 가능하면 "컨트롤러"를 만들지 마십시오.

가능하다면 "Ruby on Rails와 같은 컨트롤러"를 생성하지 마십시오.

```ts
// 🙁
// RoR과 유사한 컨트롤러
const booksList = (c: Context) => {
  return c.json('도서 목록')
}

app.get('/books', booksList)
```

문제는 유형과 관련이 있습니다. 예를 들어, 복잡한 제네릭을 작성하지 않으면 컨트롤러에서 경로 매개변수를 추론할 수 없습니다.

```ts
// 🙁
// RoR과 유사한 컨트롤러
const bookPermalink = (c: Context) => {
  const id = c.req.param('id') // Can't infer the path param
  return c.json(`get ${id}`)
}
```

따라서 RoR과 유사한 컨트롤러를 만들 필요가 없으며 경로 정의 바로 뒤에 핸들러를 작성해야 합니다.

```ts
// 😃
app.get('/books/:id', (c) => {
  const id = c.req.param('id') // Can infer the path param
  return c.json(`get ${id}`)
})
```

## `hono/factory`의 `factory.createHandlers()`

그래도 RoR과 유사한 컨트롤러를 생성하려면 [`hono/factory`](/docs/helpers/factory)에서 `factory.createHandlers()`를 사용하세요. 이것을 사용하면 유형 추론이 올바르게 작동합니다.

```ts
import { createFactory } from 'hono/factory'
import { logger } from 'hono/logger'

// ...

// 😃
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

## 더 큰 애플리케이션 구축

"Ruby on Rails와 같은 컨트롤러"를 만들지 않고도 더 큰 애플리케이션을 구축하려면 `app.route()`를 사용하세요.

애플리케이션에 `/authors` 및 `/books` 엔드포인트가 있고 `index.ts`에서 파일을 분리하려는 경우 `authors.ts` 및 `books.ts`를 만듭니다.

```ts
// 저자.ts
import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => c.json('저자 목록'))
app.post('/', (c) => c.json('작가를 만들어라', 201))
app.get('/:id', (c) => c.json(`get ${c.req.param('id')}`))

export default app
```

```ts
// books.ts
import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => c.json('도서 목록'))
app.post('/', (c) => c.json('책을 만들다', 201))
app.get('/:id', (c) => c.json(`get ${c.req.param('id')}`))

export default app
```

그런 다음 이를 가져와 `app.route()`를 사용하여 `/authors` 및 `/books` 경로에 마운트합니다.

```ts
// index.ts
import { Hono } from 'hono'
import authors from './authors'
import books from './books'

const app = new Hono()

// 😃
app.route('/authors', authors)
app.route('/books', books)

export default app
```

### RPC 기능을 사용하고 싶다면

위의 코드는 일반적인 사용 사례에 적합합니다.
그러나 `RPC` 기능을 사용하려면 다음과 같이 연결하면 올바른 유형을 얻을 수 있습니다.

```ts
// 저자.ts
import { Hono } from 'hono'

const app = new Hono()
  .get('/', (c) => c.json('저자 목록'))
  .post('/', (c) => c.json('작가를 만들어라', 201))
  .get('/:id', (c) => c.json(`get ${c.req.param('id')}`))

export default app
export type AppType = typeof app
```

`app`의 유형을 `hc`에 전달하면 올바른 유형을 얻게 됩니다.

```ts
import type { AppType } from './authors'
import { hc } from 'hono/client'

// 😃
const client = hc<AppType>('http://localhost') // Typed correctly
```

자세한 내용은 [RPC 페이지](/docs/guides/rpc#using-rpc-with-larger-applications)를 참조하세요.
