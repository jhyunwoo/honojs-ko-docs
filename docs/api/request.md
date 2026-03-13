# HonoRequest

`HonoRequest`는 [요청](https://developer.mozilla.org/en-US/docs/Web/API/Request) 개체를 래핑하는 `c.req`에서 가져올 수 있는 개체입니다.

## 매개변수()

경로 매개변수의 값을 가져옵니다.

```ts twoslash
import { Hono } from 'hono'
const app = new Hono()
// ---cut---
// 캡처된 매개변수
app.get('/entry/:id', async (c) => {
  const id = c.req.param('id')
  //    ^?
  // ...
})

// 모든 매개변수를 한 번에 가져오기
app.get('/entry/:id/comment/:commentId', async (c) => {
  const { id, commentId } = c.req.param()
  //      ^?
})
```

## 질문()

쿼리 문자열 매개변수를 가져옵니다.

```ts twoslash
import { Hono } from 'hono'
const app = new Hono()
// ---cut---
// 쿼리 매개변수
app.get('/search', async (c) => {
  const query = c.req.query('q')
  //     ^?
})

// 모든 매개변수를 한 번에 가져오기
app.get('/search', async (c) => {
  const { q, limit, offset } = c.req.query()
  //      ^?
})
```

## 쿼리()

여러 쿼리 문자열 매개변수 값을 가져옵니다. 예: `/search?tags=A&tags=B`

```ts twoslash
import { Hono } from 'hono'
const app = new Hono()
// ---cut---
app.get('/search', async (c) => {
  // 태그는 문자열[]입니다.
  const tags = c.req.queries('tags')
  //     ^?
  // ...
})
```

## 헤더()

요청 헤더 값을 가져옵니다.

```ts twoslash
import { Hono } from 'hono'
const app = new Hono()
// ---cut---
app.get('/', (c) => {
  const userAgent = c.req.header('User-Agent')
  //      ^?
  return c.text(`Your user agent is ${userAgent}`)
})
```

::: warning
인수 없이 `c.req.header()`가 호출되면 반환된 레코드의 모든 키는 **소문자**입니다.

대문자 이름을 가진 헤더의 값을 얻으려면,
`c.req.header(“X-Foo”)`를 사용하세요.

```ts
// ❌ 작동하지 않습니다
const headerRecord = c.req.header()
const foo = headerRecord['X-Foo']

// ✅ 작동합니다
const foo = c.req.header('X-Foo')
```

:::

## 파싱바디()

`multipart/form-data` 또는 `application/x-www-form-urlencoded` 유형의 요청 본문 구문 분석

```ts twoslash
import { Hono } from 'hono'
const app = new Hono()
// ---cut---
app.post('/entry', async (c) => {
  const body = await c.req.parseBody()
  // ...
})
```

`parseBody()`는 다음 동작을 지원합니다.

**단일 파일**

```ts twoslash
import { Context } from 'hono'
declare const c: Context
// ---cut---
const body = await c.req.parseBody()
const data = body['foo']
//    ^?
```

`body['foo']`는 `(string | File)`입니다.

여러 파일을 업로드하는 경우 마지막 파일이 사용됩니다.

### 여러 파일

```ts twoslash
import { Context } from 'hono'
declare const c: Context
// ---cut---
const body = await c.req.parseBody()
body['foo[]']
```

`body['foo[]']`는 항상 `(string | File)[]`입니다.

`[]` 접미사가 필요합니다.

### 이름이 같은 여러 파일 또는 필드

여러 `<input type="file" multiple />` 또는 동일한 이름 `<input type="checkbox" name="favorites" value="Hono"/>`를 가진 여러 확인란을 허용하는 입력 필드가 있는 경우.

```ts twoslash
import { Context } from 'hono'
declare const c: Context
// ---cut---
const body = await c.req.parseBody({ all: true })
body['foo']
```

`all` 옵션은 기본적으로 비활성화되어 있습니다.

- `body['foo']`가 여러 파일인 경우 `(string | File)[]`로 구문 분석됩니다.
- `body['foo']`가 단일 파일인 경우 `(string | File)`로 구문 분석됩니다.

### 도트 표기

`dot` 옵션 `true`를 설정하면 반환 값은 점 표기법을 기반으로 구성됩니다.

다음 데이터를 수신한다고 상상해 보십시오.

```ts twoslash
const data = new FormData()
data.append('obj.key1', 'value1')
data.append('obj.key2', 'value2')
```

`dot` 옵션 `true`를 설정하여 구조화된 값을 얻을 수 있습니다.

```ts twoslash
import { Context } from 'hono'
declare const c: Context
// ---cut---
const body = await c.req.parseBody({ dot: true })
// 본체는 `{ obj: { key1: 'value1', key2: 'value2' } }`
```

## JSON()

`application/json` 유형의 요청 본문을 구문 분석합니다.

```ts twoslash
import { Hono } from 'hono'
const app = new Hono()
// ---cut---
app.post('/entry', async (c) => {
  const body = await c.req.json()
  // ...
})
```

## 텍스트()

`text/plain` 유형의 요청 본문을 구문 분석합니다.

```ts twoslash
import { Hono } from 'hono'
const app = new Hono()
// ---cut---
app.post('/entry', async (c) => {
  const body = await c.req.text()
  // ...
})
```

## 배열버퍼()

요청 본문을 `ArrayBuffer`로 구문 분석합니다.

```ts twoslash
import { Hono } from 'hono'
const app = new Hono()
// ---cut---
app.post('/entry', async (c) => {
  const body = await c.req.arrayBuffer()
  // ...
})
```

## 얼룩()

요청 본문을 `Blob`로 구문 분석합니다.

```ts twoslash
import { Hono } from 'hono'
const app = new Hono()
// ---cut---
app.post('/entry', async (c) => {
  const body = await c.req.blob()
  // ...
})
```

## 양식데이터()

요청 본문을 `FormData`로 구문 분석합니다.

```ts twoslash
import { Hono } from 'hono'
const app = new Hono()
// ---cut---
app.post('/entry', async (c) => {
  const body = await c.req.formData()
  // ...
})
```

## 유효한()

검증된 데이터를 얻으세요.

```ts
app.post('/posts', async (c) => {
  const { title, body } = c.req.valid('form')
  // ...
})
```

사용 가능한 대상은 아래와 같습니다.

- `form`
- `json`
- `query`
- `header`
- `cookie`
- `param`

사용 예는 [검증 섹션](/docs/guides/validation)을 참조하세요.

## 경로경로

::: warning
**v4.8.0에서 더 이상 사용되지 않음**: 이 속성은 더 이상 사용되지 않습니다. 대신 [Route Helper](/docs/helpers/route)의 `routePath()`를 사용하세요.
:::

다음과 같이 핸들러 내에서 등록된 경로를 검색할 수 있습니다.

```ts twoslash
import { Hono } from 'hono'
const app = new Hono()
// ---cut---
app.get('/posts/:id', (c) => {
  return c.json({ path: c.req.routePath })
})
```

`/posts/123`에 액세스하면 `/posts/:id`가 반환됩니다.

```json
{ "path": "/posts/:id" }
```

## 일치된 경로

::: warning
**v4.8.0에서 더 이상 사용되지 않음**: 이 속성은 더 이상 사용되지 않습니다. 대신 [Route Helper](/docs/helpers/route)의 `matchedRoutes()`를 사용하세요.
:::

이는 핸들러 내에서 일치하는 경로를 반환하므로 디버깅에 유용합니다.

```ts twoslash
import { Hono } from 'hono'
const app = new Hono()
// ---cut---
app.use(async function logger(c, next) {
  await next()
  c.req.matchedRoutes.forEach(({ handler, method, path }, i) => {
    const name =
      handler.name ||
      (handler.length < 2 ? '[handler]' : '[middleware]')
    console.log(
      method,
      ' ',
      path,
      ' '.repeat(Math.max(10 - path.length, 0)),
      name,
      i === c.req.routeIndex ? '<- respond from here' : ''
    )
  })
})
```

## 길

요청 경로 이름입니다.

```ts twoslash
import { Hono } from 'hono'
const app = new Hono()
// ---cut---
app.get('/about/me', async (c) => {
  const pathname = c.req.path // `/about/me`
  // ...
})
```

## URL

요청 URL 문자열입니다.

```ts twoslash
import { Hono } from 'hono'
const app = new Hono()
// ---cut---
app.get('/about/me', async (c) => {
  const url = c.req.url // `http://localhost:8787/about/me`
  // ...
})
```

## 방법

요청의 메서드 이름입니다.

```ts twoslash
import { Hono } from 'hono'
const app = new Hono()
// ---cut---
app.get('/about/me', async (c) => {
  const method = c.req.method // `GET`
  // ...
})
```

## 날것의

원시 [`Request`](https://developer.mozilla.org/en-US/docs/Web/API/Request) 개체입니다.

```ts
// Cloudflare Workers의 경우
app.post('/', async (c) => {
  const metadata = c.req.raw.cf?.hostMetadata?
  // ...
})
```

## 클론Raw요청()

HonoRequest에서 원시 요청 객체를 복제합니다. 유효성 검사기 또는 HonoRequest 메서드에서 요청 본문을 사용한 후에도 작동합니다.

```ts twoslash
import { Hono } from 'hono'
const app = new Hono()

import { cloneRawRequest } from 'hono/request'
import { validator } from 'hono/validator'

app.post(
  '/forward',
  validator('json', (data) => data),
  async (c) => {
    // 검증 후 복제
    const clonedReq = await cloneRawRequest(c.req)
    // 오류가 발생하지 않습니다.
    await clonedReq.json()
    // ...
  }
)
```
