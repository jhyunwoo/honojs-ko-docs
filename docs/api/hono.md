# Hono 애플리케이션

`Hono`는 핵심 객체입니다.
가장 먼저 import해서 마지막까지 사용하게 됩니다.

```ts twoslash
import { Hono } from 'hono'

const app = new Hono()
//...

export default app // for Cloudflare Workers or Bun
```

## 메서드

`Hono` 인스턴스에는 다음 메서드가 있습니다.

- app.**HTTP_METHOD**(\[path,\]handler|middleware...)
- app.**all**(\[path,\]handler|middleware...)
- app.**on**(method|method[], path|path[], handler|middleware...)
- app.**use**(\[path,\]middleware)
- app.**route**(path, \[app\])
- app.**basePath**(path)
- app.**notFound**(handler)
- app.**onError**(err, handler)
- app.**mount**(path, anotherApp)
- app.**fire**()
- app.**fetch**(request, env, event)
- app.**request**(path, options)

처음 나열한 메서드들은 라우팅에 사용됩니다. 자세한 내용은 [라우팅 섹션](/docs/api/routing)을 참고하세요.

## Not Found

`app.notFound`를 사용하면 Not Found 응답을 사용자 정의할 수 있습니다.

```ts twoslash
import { Hono } from 'hono'
const app = new Hono()
// ---cut---
app.notFound((c) => {
  return c.text('사용자 정의 404 메시지', 404)
})
```

:::warning
`notFound` 메서드는 최상위 앱에서만 호출됩니다. 자세한 내용은 이 [문제](https://github.com/honojs/hono/issues/3465#issuecomment-2381210165)를 참조하세요.
:::

## 오류 처리

`app.onError`를 사용하면 포착되지 않은 오류를 처리하고 사용자 정의 응답을 반환할 수 있습니다.

```ts twoslash
import { Hono } from 'hono'
const app = new Hono()
// ---cut---
app.onError((err, c) => {
  console.error(`${err}`)
  return c.text('사용자 정의 오류 메시지', 500)
})
```

::: info
상위 앱과 해당 경로에 모두 `onError` 핸들러가 있는 경우 경로 수준 핸들러가 우선순위를 갖습니다.
:::

## fire()

::: warning
**`app.fire()`는 더 이상 사용되지 않습니다**. 대신 `hono/service-worker`에서 `fire()`를 사용하세요. 자세한 내용은 [Service Worker 문서](/docs/getting-started/service-worker)를 참조하세요.
:::

`app.fire()`는 전역 `fetch` 이벤트 리스너를 자동으로 추가합니다.

이는 [비ES 모듈 Cloudflare Workers](https://developers.cloudflare.com/workers/reference/migrate-to-module-workers/)와 같이 [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)를 준수하는 환경에 유용할 수 있습니다.

`app.fire()`는 다음을 실행합니다.

```ts
addEventListener('fetch', (event: FetchEventLike): void => {
  event.respondWith(this.dispatch(...))
})
```

## fetch()

`app.fetch`는 애플리케이션의 진입점이 됩니다.

Cloudflare Workers의 경우 다음을 사용할 수 있습니다.

```ts twoslash
import { Hono } from 'hono'
const app = new Hono()
type Env = any
type ExecutionContext = any
// ---cut---
export default {
  fetch(request: Request, env: Env, ctx: ExecutionContext) {
    return app.fetch(request, env, ctx)
  },
}
```

아니면 그냥 하세요:

```ts twoslash
import { Hono } from 'hono'
const app = new Hono()
// ---cut---
export default app
```

Bun:

<!-- prettier-ignore -->
```ts
export default app // [!code --]
export default {  // [!code ++]
  port: 3000, // [!code ++]
  fetch: app.fetch, // [!code ++]
} // [!code ++]
```

## 요구()

`request`는 테스트에 유용한 방법입니다.

URL이나 경로 이름을 전달하여 GET 요청을 보낼 수 있습니다.
`app`는 `Response` 객체를 반환합니다.

```ts twoslash
import { Hono } from 'hono'
const app = new Hono()
declare const test: (name: string, fn: () => void) => void
declare const expect: (value: any) => any
// ---cut---
test('GET /hello is ok', async () => {
  const res = await app.request('/hello')
  expect(res.status).toBe(200)
})
```

`Request` 객체를 전달할 수도 있습니다.

```ts twoslash
import { Hono } from 'hono'
const app = new Hono()
declare const test: (name: string, fn: () => void) => void
declare const expect: (value: any) => any
// ---cut---
test('POST /message is ok', async () => {
  const req = new Request('안녕하세요!', {
    method: 'POST',
  })
  const res = await app.request(req)
  expect(res.status).toBe(201)
})
```

## 산()

`mount()`를 사용하면 다른 프레임워크로 구축된 애플리케이션을 Hono 애플리케이션에 마운트할 수 있습니다.

```ts
import { Router as IttyRouter } from 'itty-router'
import { Hono } from 'hono'

// itty-router 애플리케이션 만들기
const ittyRouter = IttyRouter()

// 핸들 `GET /itty-router/hello`
ittyRouter.get('/hello', () => new Response('Hello from itty-router'))

// Hono 애플리케이션
const app = new Hono()

// 산!
app.mount('/itty-router', ittyRouter.handle)
```

## 엄격 모드

엄격 모드의 기본값은 `true`이며 다음 경로를 구별합니다.

- `/hello`
- `/hello/`

`app.get('/hello')`는 `GET /hello/`와 일치하지 않습니다.

엄격 모드를 `false`로 설정하면 두 경로가 모두 동일하게 처리됩니다.

```ts twoslash
import { Hono } from 'hono'
// ---cut---
const app = new Hono({ strict: false })
```

## 라우터 옵션

`router` 옵션은 사용할 라우터를 지정합니다. 기본 라우터는 `SmartRouter`입니다. `RegExpRouter`를 사용하려면 이를 새 `Hono` 인스턴스에 전달하세요.

```ts twoslash
import { Hono } from 'hono'
// ---cut---
import { RegExpRouter } from 'hono/router/reg-exp-router'

const app = new Hono({ router: new RegExpRouter() })
```

## 제네릭

Generics를 전달하여 `c.set`/`c.get`에 사용되는 Cloudflare Workers 바인딩 및 변수의 유형을 지정할 수 있습니다.

```ts twoslash
import { Hono } from 'hono'
type User = any
declare const user: User
// ---cut---
type Bindings = {
  TOKEN: string
}

type Variables = {
  user: User
}

const app = new Hono<{
  Bindings: Bindings
  Variables: Variables
}>()

app.use('/auth/*', async (c, next) => {
  const token = c.env.TOKEN // token은 `string`입니다.
  // ...
  c.set('user', user) // user는 `User`여야 합니다.
  await next()
})
```
