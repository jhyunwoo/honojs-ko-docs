# 미들웨어

미들웨어는 엔드포인트 `Handler` 이전/이후에 작동합니다. 파견 전에 `Request`를 얻을 수도 있고 파견 후에 `Response`를 조작할 수도 있습니다.

## 미들웨어의 정의

- 핸들러 - `Response` 객체를 반환해야 합니다. 하나의 핸들러만 호출됩니다.
- 미들웨어 - 다음 미들웨어를 호출하려면 `await next()`를 입력하고 아무것도 반환하지 않아야 합니다. **또는** 조기 종료를 위해 `Response`를 반환해야 합니다.

사용자는 `app.use` 또는 `app.HTTP_METHOD`를 사용하여 미들웨어와 핸들러를 등록할 수 있습니다. 이 기능의 경우 경로와 방법을 쉽게 지정할 수 있습니다.

```ts
// 모든 방법, 모든 경로와 일치
app.use(logger())

// 경로 지정
app.use('/posts/*', cors())

// 메소드와 경로 지정
app.post('/posts/*', basicAuth())
```

핸들러가 `Response`를 반환하면 최종 사용자에게 사용되며 처리가 중지됩니다.

```ts
app.post('/posts', (c) => c.text('생성되었습니다!', 201))
```

이 경우 디스패치 전에 다음과 같이 4개의 미들웨어가 처리됩니다.

```ts
logger() -> cors() -> basicAuth() -> *handler*
```

## 실행 순서

미들웨어가 실행되는 순서는 등록된 순서에 따라 결정됩니다.
처음 등록된 미들웨어의 `next` 이전의 프로세스가 먼저 실행되며,
`next` 이후의 프로세스가 마지막으로 실행됩니다.
아래를 참조하세요.

```ts
app.use(async (_, next) => {
  console.log('미들웨어 1 시작')
  await next()
  console.log('미들웨어 1 끝')
})
app.use(async (_, next) => {
  console.log('미들웨어 2 시작')
  await next()
  console.log('미들웨어 2 끝')
})
app.use(async (_, next) => {
  console.log('미들웨어 3 시작')
  await next()
  console.log('미들웨어 3 끝')
})

app.get('/', (c) => {
  console.log('handler')
  return c.text('안녕하세요!')
})
```

결과는 다음과 같습니다.

```
middleware 1 start
  middleware 2 start
    middleware 3 start
      handler
    middleware 3 end
  middleware 2 end
middleware 1 end
```

핸들러나 미들웨어가 오류를 발생시키면 hono는 이를 잡아서 [app.onError() 콜백](/docs/api/hono#error-handling)에 전달하거나 자동으로 500 응답으로 변환한 후 미들웨어 체인 위로 반환합니다. 즉, next()는 절대로 throw되지 않으므로 try/catch/finally로 래핑할 필요가 없습니다.

## 내장 미들웨어

Hono에는 미들웨어가 내장되어 있습니다.

```ts
import { Hono } from 'hono'
import { poweredBy } from 'hono/powered-by'
import { logger } from 'hono/logger'
import { basicAuth } from 'hono/basic-auth'

const app = new Hono()

app.use(poweredBy())
app.use(logger())

app.use(
  '/auth/*',
  basicAuth({
    username: 'hono',
    password: 'acoolproject',
  })
)
```

::: warning
Deno에서는 Hono 버전과 다른 버전의 미들웨어를 사용하는 것이 가능하지만 이로 인해 버그가 발생할 수 있습니다.
예를 들어 이 코드는 버전이 다르기 때문에 작동하지 않습니다.

```ts
import { Hono } from 'jsr:@hono/hono@4.4.0'
import { upgradeWebSocket } from 'jsr:@hono/hono@4.4.5/deno'

const app = new Hono()

app.get(
  '/ws',
  upgradeWebSocket(() => ({
    // ...
  }))
)
```

:::

## 맞춤형 미들웨어

`app.use()` 내부에서 직접 미들웨어를 작성할 수 있습니다.

```ts
// 맞춤형 로거
app.use(async (c, next) => {
  console.log(`[${c.req.method}] ${c.req.url}`)
  await next()
})

// 맞춤 헤더 추가
app.use('/message/*', async (c, next) => {
  await next()
  c.header('x-message', '미들웨어입니다!')
})

app.get('/message/hello', (c) => c.text('Hello 미들웨어!'))
```

그러나 `app.use()` 내에 미들웨어를 직접 포함하면 재사용성이 제한될 수 있습니다. 그러므로 우리는 우리를 분리할 수 있습니다.
미들웨어를 다른 파일로 변환합니다.

미들웨어를 분리할 때 `context` 및 `next`에 대한 유형 정의가 손실되지 않도록 하려면 다음을 사용할 수 있습니다.
Hono 공장의 [`createMiddleware()`](/docs/helpers/factory#createmiddleware). 또한 이를 통해 다운스트림 핸들러에서 유형 안전하게 [`Context`에 있는 `set` 데이터에 액세스](https://hono.dev/docs/api/context#set-get)할 수 있습니다.

```ts
import { createMiddleware } from 'hono/factory'

const logger = createMiddleware(async (c, next) => {
  console.log(`[${c.req.method}] ${c.req.url}`)
  await next()
})
```

:::info
유형 제네릭은 `createMiddleware`와 함께 사용할 수 있습니다.

```ts
createMiddleware<{Bindings: Bindings}>(async (c, next) =>
```

:::

### 다음 이후 응답 수정

또한 필요한 경우 응답을 수정하도록 미들웨어를 설계할 수 있습니다.

```ts
const stripRes = createMiddleware(async (c, next) => {
  await next()
  c.res = undefined
  c.res = new Response('새로운 응답')
})
```

## 미들웨어 인수 내부의 컨텍스트 액세스

미들웨어 인수 내부의 컨텍스트에 액세스하려면 `app.use`에서 제공하는 컨텍스트 매개변수를 직접 사용하세요. 자세한 내용은 아래 예를 참조하세요.

```ts
import { cors } from 'hono/cors'

app.use('*', async (c, next) => {
  const middleware = cors({
    origin: c.env.CORS_ORIGIN,
  })
  return middleware(c, next)
})
```

### 미들웨어에서 컨텍스트 확장

미들웨어 내부의 컨텍스트를 확장하려면 `c.set`를 사용하세요. `{ Variables: { yourVariable: YourVariableType } }` 일반 인수를 `createMiddleware` 함수에 전달하여 이 유형을 안전하게 만들 수 있습니다.

```ts
import { createMiddleware } from 'hono/factory'

const echoMiddleware = createMiddleware<{
  Variables: {
    echo: (str: string) => string
  }
}>(async (c, next) => {
  c.set('echo', (str) => str)
  await next()
})

app.get('/echo', echoMiddleware, (c) => {
  return c.text(c.var.echo('안녕하세요!'))
})
```

## 타사 미들웨어

내장 미들웨어는 외부 모듈에 의존하지 않지만, 타사 미들웨어는 타사 라이브러리에 의존할 수 있습니다.
따라서 이를 사용하여 더 복잡한 응용 프로그램을 만들 수 있습니다.

다양한 [타사 미들웨어](https://hono.dev/docs/middleware/third-party)를 탐색할 수 있습니다.
예를 들어 GraphQL 서버 미들웨어, Sentry 미들웨어, Firebase 인증 미들웨어 등이 있습니다.
