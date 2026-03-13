# 라우팅

Hono의 라우팅은 유연하고 직관적입니다.
살펴 보겠습니다.

## 기초적인

```ts twoslash
import { Hono } from 'hono'
const app = new Hono()
// ---cut---
// HTTP 메소드
app.get('/', (c) => c.text('GET /'))
app.post('/', (c) => c.text('POST /'))
app.put('/', (c) => c.text('PUT /'))
app.delete('/', (c) => c.text('DELETE /'))

// 와일드카드
app.get('/wild/*/카드', (c) => {
  return c.text('GET /wild/*/card')
})

// 모든 HTTP 메소드
app.all('/hello', (c) => c.text('모든 방법 /hello'))

// 사용자 정의 HTTP 방법
app.on('PURGE', '/cache', (c) => c.text('PURGE 방법 /캐시'))

// 다중 방법
app.on(['PUT', 'DELETE'], '/post', (c) =>
  c.text('PUT or DELETE /post')
)

// 다중 경로
app.on('GET', ['/hello', '/ja/hello', '/en/hello'], (c) =>
  c.text('안녕하세요')
)
```

## 경로 매개변수

```ts twoslash
import { Hono } from 'hono'
const app = new Hono()
// ---cut---
app.get('/user/:name', async (c) => {
  const name = c.req.param('name')
  //       ^?
  // ...
})
```

또는 모든 매개변수를 한 번에:

```ts twoslash
import { Hono } from 'hono'
const app = new Hono()
// ---cut---
app.get('/posts/:id/comment/:comment_id', async (c) => {
  const { id, comment_id } = c.req.param()
  //       ^?
  // ...
})
```

## 선택적 매개변수

```ts twoslash
import { Hono } from 'hono'
const app = new Hono()
// ---cut---
// `/api/animal` 및 `/api/animal/:type`와 일치합니다.
app.get('/api/animal/:type?', (c) => c.text('동물!'))
```

## 정규표현식

```ts twoslash
import { Hono } from 'hono'
const app = new Hono()
// ---cut---
app.get('/post/:date{[0-9]+}/:title{[a-z]+}', async (c) => {
  const { date, title } = c.req.param()
  //       ^?
  // ...
})
```

## 슬래시 포함

```ts twoslash
import { Hono } from 'hono'
const app = new Hono()
// ---cut---
app.get('/posts/:filename{.+\\.png}', async (c) => {
  //...
})
```

## 연결된 경로

```ts twoslash
import { Hono } from 'hono'
const app = new Hono()
// ---cut---
app
  .get('/endpoint', (c) => {
    return c.text('GET /endpoint')
  })
  .post((c) => {
    return c.text('POST /endpoint')
  })
  .delete((c) => {
    return c.text('DELETE /endpoint')
  })
```

## 그룹화

Hono 인스턴스로 경로를 그룹화하고 경로 메서드를 사용하여 기본 앱에 추가할 수 있습니다.

```ts twoslash
import { Hono } from 'hono'
// ---cut---
const book = new Hono()

book.get('/', (c) => c.text('도서 목록')) // GET /book
book.get('/:id', (c) => {
  // GET /book/:id
  const id = c.req.param('id')
  return c.text('Get Book: ' + id)
})
book.post('/', (c) => c.text('책 만들기')) // POST /book

const app = new Hono()
app.route('/book', book)
```

## 베이스를 변경하지 않고 그룹화

기본을 유지하면서 여러 인스턴스를 그룹화할 수도 있습니다.

```ts twoslash
import { Hono } from 'hono'
// ---cut---
const book = new Hono()
book.get('/book', (c) => c.text('도서 목록')) // GET /book
book.post('/book', (c) => c.text('책 만들기')) // POST /book

const user = new Hono().basePath('/user')
user.get('/', (c) => c.text('사용자 나열')) // GET /user
user.post('/', (c) => c.text('사용자 생성')) // POST /user

const app = new Hono()
app.route('/', book) // Handle /book
app.route('/', user) // Handle /user
```

## 기본 경로

기본 경로를 지정할 수 있습니다.

```ts twoslash
import { Hono } from 'hono'
// ---cut---
const api = new Hono().basePath('/api')
api.get('/book', (c) => c.text('도서 목록')) // GET /api/book
```

## 호스트 이름으로 라우팅

호스트 이름이 포함되어 있으면 제대로 작동합니다.

```ts twoslash
import { Hono } from 'hono'
// ---cut---
const app = new Hono({
  getPath: (req) => req.url.replace(/^https?:\/([^?]+).*$/, '$1'),
})

app.get('/www1.example.com/hello', (c) => c.text('안녕하세요 www1'))
app.get('/www2.example.com/hello', (c) => c.text('안녕하세요 www2'))
```

## `host` 헤더 값을 사용한 라우팅

Hono 생성자에서 `getPath()` 함수를 설정하면 Hono는 `host` 헤더 값을 처리할 수 있습니다.

```ts twoslash
import { Hono } from 'hono'
// ---cut---
const app = new Hono({
  getPath: (req) =>
    '/' +
    req.headers.get('host') +
    req.url.replace(/^https?:\/\/[^/]+(\/[^?]*).*/, '$1'),
})

app.get('/www1.example.com/hello', (c) => c.text('안녕하세요 www1'))

// 다음 요청은 경로와 일치합니다.
// 새로운 요청('http://www1.example.com/hello', {
//  헤더: { host: 'www1.example.com' },
// })
```

이를 적용하면 예를 들어 `User-Agent` 헤더별로 라우팅을 변경할 수 있습니다.

## 라우팅 우선순위

핸들러 또는 미들웨어는 등록 순서대로 실행됩니다.

```ts twoslash
import { Hono } from 'hono'
const app = new Hono()
// ---cut---
app.get('/book/a', (c) => c.text('a')) // a
app.get('/book/:slug', (c) => c.text('common')) // common
```

```
GET /book/a ---> `a`
GET /book/b ---> `common`
```

핸들러가 실행되면 프로세스가 중지됩니다.

```ts twoslash
import { Hono } from 'hono'
const app = new Hono()
// ---cut---
app.get('*', (c) => c.text('common')) // common
app.get('/foo', (c) => c.text('foo')) // foo
```

```
GET /foo ---> `common` // foo will not be dispatched
```

실행하고 싶은 미들웨어가 있다면 핸들러 위에 코드를 작성하세요.

```ts twoslash
import { Hono } from 'hono'
import { logger } from 'hono/logger'
const app = new Hono()
// ---cut---
app.use(logger())
app.get('/foo', (c) => c.text('foo'))
```

"_fallback_" 핸들러를 갖고 싶다면 다른 핸들러 아래에 코드를 작성하세요.

```ts twoslash
import { Hono } from 'hono'
const app = new Hono()
// ---cut---
app.get('/bar', (c) => c.text('bar')) // bar
app.get('*', (c) => c.text('fallback')) // fallback
```

```
GET /bar ---> `bar`
GET /foo ---> `fallback`
```

## 그룹화 순서

라우팅 그룹화의 실수는 알아차리기 어렵습니다.
`route()` 함수는 두 번째 인수(예: `three` 또는 `two`)에서 저장된 라우팅을 가져와 자체(`two` 또는 `app`) 라우팅에 추가합니다.

```ts
three.get('/hi', (c) => c.text('hi'))
two.route('/three', three)
app.route('/two', two)

export default app
```

200개의 응답을 반환합니다.

```
GET /two/three/hi ---> `hi`
```

그러나 순서가 잘못된 경우 404가 반환됩니다.

```ts twoslash
import { Hono } from 'hono'
const app = new Hono()
const two = new Hono()
const three = new Hono()
// ---cut---
three.get('/hi', (c) => c.text('hi'))
app.route('/two', two) // `two` does not have routes
two.route('/three', three)

export default app
```

```
GET /two/three/hi ---> 404 Not Found
```
