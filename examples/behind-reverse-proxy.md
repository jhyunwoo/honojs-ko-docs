# 역방향 프록시 바인딩

역방향 프록시 뒤에서 Hono 애플리케이션을 실행한다고 가정해 보겠습니다. 이 경우 `x-forwarded-proto` 헤더의 값을 반영해야 할 수도 있습니다. 예를 들어 `c.req.url`에서 `x-forwarded-proto`로 지정된 URL의 프로토콜을 가져올 수 있어야 합니다.

이를 처리하는 가장 좋은 방법은 Hono의 `app.fetch` 앞에 새 `Request` 객체를 생성하고 이를 `app.fetch`에 전달하는 것입니다.

## Cloudflare Workers / Deno / Bun

```ts
import { Hono } from 'hono'

const app = new Hono()

//...

export default {
  fetch: (req: Request) => {
    const url = new URL(req.url)
    url.protocol =
      req.headers.get('x-forwarded-proto') ?? url.protocol
    return app.fetch(new Request(url, req))
  },
}
```

## Node.js

```ts
import { Hono } from 'hono'
import { serve } from '@hono/node-server'

const app = new Hono()

serve({
  fetch: (req) => {
    const url = new URL(req.url)
    url.protocol =
      req.headers.get('x-forwarded-proto') ?? url.protocol
    return app.fetch(new Request(url, req))
  },
})
```
