# 문맥

`Context` 개체는 각 요청에 대해 인스턴스화되고 응답이 반환될 때까지 유지됩니다. 여기에 값을 입력하고, 반환하려는 헤더와 상태 코드를 설정하고, HonoRequest 및 응답 개체에 액세스할 수 있습니다.

## 요구

`req`는 HonoRequest의 인스턴스입니다. 자세한 내용은 [HonoRequest](/docs/api/request)를 참조하세요.

```ts twoslash
import { Hono } from 'hono'
const app = new Hono()
// ---cut---
app.get('/hello', (c) => {
  const userAgent = c.req.header('User-Agent')
  // ...
  // ---cut-start---
  return c.text(`Hello, ${userAgent}`)
  // ---cut-end---
})
```

## 상태()

`c.status()`를 사용하여 HTTP 상태 코드를 설정할 수 있습니다. 기본값은 `200`입니다. 코드가 `200`인 경우에는 `c.status()`를 사용할 필요가 없습니다.

```ts twoslash
import { Hono } from 'hono'
const app = new Hono()
// ---cut---
app.post('/posts', (c) => {
  // HTTP 상태 코드 설정
  c.status(201)
  return c.text('게시물이 생성되었습니다!')
})
```

## 헤더()

응답에 대한 HTTP 헤더를 설정할 수 있습니다.

```ts twoslash
import { Hono } from 'hono'
const app = new Hono()
// ---cut---
app.get('/', (c) => {
  // 헤더 설정
  c.header('X-Message', '내 맞춤 메시지')
  return c.text('안녕하세요!')
})
```

## 몸()

HTTP 응답을 반환합니다.

::: info
**참고**: 텍스트 또는 HTML를 반환할 때는 `c.text()` 또는 `c.html()`를 사용하는 것이 좋습니다.
:::

```ts twoslash
import { Hono } from 'hono'
const app = new Hono()
// ---cut---
app.get('/welcome', (c) => {
  c.header('Content-Type', 'text/plain')
  // 응답 본문을 반환합니다.
  return c.body('와줘서 고마워요')
})
```

다음과 같이 작성할 수도 있습니다.

```ts twoslash
import { Hono } from 'hono'
const app = new Hono()
// ---cut---
app.get('/welcome', (c) => {
  return c.body('와줘서 고마워요', 201, {
    'X-Message': '안녕하세요!',
    'Content-Type': 'text/plain',
  })
})
```

응답은 아래와 동일한 `Response` 개체입니다.

```ts twoslash
new Response('와줘서 고마워요', {
  status: 201,
  headers: {
    'X-Message': '안녕하세요!',
    'Content-Type': 'text/plain',
  },
})
```

## 텍스트()

텍스트를 `Content-Type:text/plain`로 렌더링합니다.

```ts twoslash
import { Hono } from 'hono'
const app = new Hono()
// ---cut---
app.get('/say', (c) => {
  return c.text('안녕하세요!')
})
```

## JSON()

JSON를 `Content-Type:application/json`로 렌더링합니다.

```ts twoslash
import { Hono } from 'hono'
const app = new Hono()
// ---cut---
app.get('/api', (c) => {
  return c.json({ message: '안녕하세요!' })
})
```

## HTML()

HTML를 `Content-Type:text/html`로 렌더링합니다.

```ts twoslash
import { Hono } from 'hono'
const app = new Hono()
// ---cut---
app.get('/', (c) => {
  return c.html('<h1>안녕하세요! Hono!</h1>')
})
```

## 찾을 수 없음()

`Not Found` 응답을 반환합니다. [`app.notFound()`](/docs/api/hono#not-found)로 맞춤 설정할 수 있습니다.

```ts twoslash
import { Hono } from 'hono'
const app = new Hono()
// ---cut---
app.get('/notfound', (c) => {
  return c.notFound()
})
```

## 리디렉션()

리디렉션, 기본 상태 코드는 `302`입니다.

```ts twoslash
import { Hono } from 'hono'
const app = new Hono()
// ---cut---
app.get('/redirect', (c) => {
  return c.redirect('/')
})
app.get('/redirect-permanently', (c) => {
  return c.redirect('/', 301)
})
```

## 입술

반환될 [Response] 객체에 접근할 수 있습니다.

```ts twoslash
import { Hono } from 'hono'
const app = new Hono()
// ---cut---
// 응답 객체
app.use('/', async (c, next) => {
  await next()
  c.res.headers.append('X-Debug', '디버그 메시지')
})
```

[응답]: https://developer.mozilla.org/en-US/docs/Web/API/Response

## 세트() / get()

현재 요청의 수명과 함께 임의의 키-값 쌍을 가져오고 설정합니다. 이를 통해 미들웨어 간 또는 미들웨어에서 경로 처리기로 특정 값을 전달할 수 있습니다.

```ts twoslash
import { Hono } from 'hono'
const app = new Hono<{ Variables: { message: string } }>()
// ---cut---
app.use(async (c, next) => {
  c.set('message', 'Hono 멋지네요!!')
  await next()
})

app.get('/', (c) => {
  const message = c.get('message')
  return c.text(`The message is "${message}"`)
})
```

`Variables`를 `Hono`의 생성자에 Generics로 전달하여 형식을 안전하게 만듭니다.

```ts twoslash
import { Hono } from 'hono'
// ---cut---
type Variables = {
  message: string
}

const app = new Hono<{ Variables: Variables }>()
```

`c.set` / `c.get` 값은 동일한 요청 내에서만 유지됩니다. 여러 요청에서 공유하거나 유지할 수 없습니다.

## var

`c.var`를 사용하여 변수 값에 액세스할 수도 있습니다.

```ts twoslash
import type { Context } from 'hono'
declare const c: Context
// ---cut---
const result = c.var.client.oneMethod()
```

사용자 정의 메소드를 제공하는 미들웨어를 생성하려면,
다음과 같이 작성하세요:

```ts twoslash
import { Hono } from 'hono'
import { createMiddleware } from 'hono/factory'
// ---cut---
type Env = {
  Variables: {
    echo: (str: string) => string
  }
}

const app = new Hono()

const echoMiddleware = createMiddleware<Env>(async (c, next) => {
  c.set('echo', (str) => str)
  await next()
})

app.get('/echo', echoMiddleware, (c) => {
  return c.text(c.var.echo('안녕하세요!'))
})
```

여러 핸들러에서 미들웨어를 사용하려면 `app.use()`를 사용하면 됩니다.
그런 다음 `Env`를 `Hono` 생성자에 Generics로 전달하여 형식을 안전하게 만들어야 합니다.

```ts twoslash
import { Hono } from 'hono'
import type { MiddlewareHandler } from 'hono/types'
declare const echoMiddleware: MiddlewareHandler
type Env = {
  Variables: {
    echo: (str: string) => string
  }
}
// ---cut---
const app = new Hono<Env>()

app.use(echoMiddleware)

app.get('/echo', (c) => {
  return c.text(c.var.echo('안녕하세요!'))
})
```

## 렌더() / setRenderer()

사용자 정의 미들웨어 내에서 `c.setRenderer()`를 사용하여 레이아웃을 설정할 수 있습니다.

```tsx twoslash
/** @jsx jsx*/
/** @jsxImportSource hono/jsx */
import { Hono } from 'hono'
const app = new Hono()
// ---cut---
app.use(async (c, next) => {
  c.setRenderer((content) => {
    return c.html(
      <html>
        <body>
          <p>{content}</p>
        </body>
      </html>
    )
  })
  await next()
})
```

그런 다음 `c.render()`를 활용하여 이 레이아웃 내에서 응답을 생성할 수 있습니다.

```ts twoslash
import { Hono } from 'hono'
const app = new Hono()
// ---cut---
app.get('/', (c) => {
  return c.render('안녕하세요!')
})
```

그 결과는 다음과 같습니다:

```html
<html>
  <body>
    <p>안녕하세요!</p>
  </body>
</html>
```

또한 이 기능은 인수를 사용자 정의할 수 있는 유연성을 제공합니다.
유형 안전성을 보장하기 위해 유형을 다음과 같이 정의할 수 있습니다.

```ts
declare module 'hono' {
  interface ContextRenderer {
    (
      content: string | Promise<string>,
      head: { title: string }
    ): Response | Promise<Response>
  }
}
```

이를 사용하는 방법의 예는 다음과 같습니다.

```ts
app.use('/pages/*', async (c, next) => {
  c.setRenderer((content, head) => {
    return c.html(
      <html>
        <head>
          <title>{head.title}</title>
        </head>
        <body>
          <header>{head.title}</header>
          <p>{content}</p>
        </body>
      </html>
    )
  })
  await next()
})

app.get('/pages/my-favorite', (c) => {
  return c.render(<p>Ramen 및 Sushi</p>, {
    title: '내가 가장 좋아하는 것',
  })
})

app.get('/pages/my-hobbies', (c) => {
  return c.render(<p>야구 시청</p>, {
    title: '나의 취미',
  })
})
```

## 실행Ctx

Cloudflare Workers' 특정 [ExecutionContext](https://developers.cloudflare.com/workers/runtime-apis/context/)에 액세스할 수 있습니다.

```ts twoslash
import { Hono } from 'hono'
const app = new Hono<{
  Bindings: {
    KV: any
  }
}>()
declare const key: string
declare const data: string
// ---cut---
// ExecutionContext 객체
app.get('/foo', async (c) => {
  c.executionCtx.waitUntil(c.env.KV.put(key, data))
  // ...
})
```

`ExecutionContext`에는 [`exports`](https://developers.cloudflare.com/workers/runtime-apis/context/#exports) 필드도 있습니다. Wrangler가 생성한 유형으로 자동 완성을 얻으려면 모듈 기능 보강을 사용할 수 있습니다.

```ts
import 'hono'

declare module 'hono' {
  interface ExecutionContext {
    readonly exports: Cloudflare.Exports
  }
}
```

## 이벤트

Cloudflare Workers'의 특정 `FetchEvent`에 접근할 수 있습니다. 이는 "Service Worker" 구문에서 사용되었습니다. 하지만 지금은 권장하지 않습니다.

```ts twoslash
import { Hono } from 'hono'
declare const key: string
declare const data: string
type KVNamespace = any
// ---cut---
// 유형 추론을 위한 유형 정의
type Bindings = {
  MY_KV: KVNamespace
}

const app = new Hono<{ Bindings: Bindings }>()

// FetchEvent 객체(Service Worker 구문을 사용하는 경우에만 설정됨)
app.get('/foo', async (c) => {
  c.event.waitUntil(c.env.MY_KV.put(key, data))
  // ...
})
```

## 환경

Cloudflare Workers 환경 변수에서 작업자에 바인딩된 비밀, KV 네임스페이스, D1 데이터베이스, R2 버킷 등을 바인딩이라고 합니다.
유형에 관계없이 바인딩은 항상 전역 변수로 사용 가능하며 `c.env.BINDING_KEY` 컨텍스트를 통해 액세스할 수 있습니다.

```ts twoslash
import { Hono } from 'hono'
type KVNamespace = any
// ---cut---
// 유형 추론을 위한 유형 정의
type Bindings = {
  MY_KV: KVNamespace
}

const app = new Hono<{ Bindings: Bindings }>()

// Cloudflare Workers에 대한 환경 객체
app.get('/', async (c) => {
  c.env.MY_KV.get('my-key')
  // ...
})
```

## 오류

핸들러에서 오류가 발생하면 오류 개체는 `c.error`에 배치됩니다.
미들웨어에서 액세스할 수 있습니다.

```ts twoslash
import { Hono } from 'hono'
const app = new Hono()
// ---cut---
app.use(async (c, next) => {
  await next()
  if (c.error) {
    // 뭔가 해봐...
  }
})
```

## 컨텍스트변수맵

예를 들어 특정 미들웨어를 사용할 때 변수에 유형 정의를 추가하려면 `ContextVariableMap`를 확장하면 됩니다. 예를 들어:

```ts
declare module 'hono' {
  interface ContextVariableMap {
    result: string
  }
}
```

그런 다음 미들웨어에서 이를 활용할 수 있습니다.

```ts twoslash
import { createMiddleware } from 'hono/factory'
// ---cut---
const mw = createMiddleware(async (c, next) => {
  c.set('result', '일부 값') // result is a string
  await next()
})
```

핸들러에서 변수는 적절한 유형으로 추론됩니다.

```ts twoslash
import { Hono } from 'hono'
const app = new Hono<{ Variables: { result: string } }>()
// ---cut---
app.get('/', (c) => {
  const val = c.get('result') // val is a string
  // ...
  return c.json({ result: val })
})
```
