# WebSocket 도우미

WebSocket 도우미는 Hono 애플리케이션의 서버측 WebSocket를 위한 도우미입니다.
현재 Cloudflare Workers/Pages, Deno 및 Bun 어댑터를 사용할 수 있습니다.

## 가져오기

::: code-group

```ts [Cloudflare Workers]
import { Hono } from 'hono'
import { upgradeWebSocket } from 'hono/cloudflare-workers'
```

```ts [Deno]
import { Hono } from 'hono'
import { upgradeWebSocket } from 'hono/deno'
```

```ts [Bun]
import { Hono } from 'hono'
import { upgradeWebSocket, websocket } from 'hono/bun'

// ...

export default {
  fetch: app.fetch,
  websocket,
}
```

:::

Node.js를 사용하는 경우 [@hono/node-ws](https://github.com/honojs/middleware/tree/main/packages/node-ws)를 사용할 수 있습니다.

## `upgradeWebSocket()`

`upgradeWebSocket()`는 WebSocket 처리를 위한 핸들러를 반환합니다.

```ts
const app = new Hono()

app.get(
  '/ws',
  upgradeWebSocket((c) => {
    return {
      onMessage(event, ws) {
        console.log(`Message from client: ${event.data}`)
        ws.send('Hello from server!')
      },
      onClose: () => {
        console.log('연결이 종료되었습니다.')
      },
    }
  })
)
```

사용 가능한 이벤트:

- `onOpen` - 현재 Cloudflare Workers는 지원하지 않습니다.
- `onMessage`
- `onClose`
- `onError`

::: warning

WebSocket Helper를 사용하는 경로에서 헤더를 수정하는 미들웨어(예: CORS 적용)를 사용하는 경우 변경할 수 없는 헤더를 수정할 수 없다는 오류가 발생할 수 있습니다. `upgradeWebSocket()`도 내부적으로 헤더를 변경하기 때문입니다.

따라서 WebSocket 헬퍼와 미들웨어를 동시에 사용하시는 경우 주의하시기 바랍니다.

:::

## RPC 모드

WebSocket 도우미로 정의된 처리기는 RPC 모드를 지원합니다.

```ts
// server.ts
const wsApp = app.get(
  '/ws',
  upgradeWebSocket((c) => {
    //...
  })
)

export type WebSocketApp = typeof wsApp

// client.ts
const client = hc<WebSocketApp>('http://localhost:8787')
const socket = client.ws.$ws() // A WebSocket object for a client
```

## 예

WebSocket 도우미를 사용한 예를 참조하세요.

### 서버와 클라이언트

```ts
// server.ts
import { Hono } from 'hono'
import { upgradeWebSocket } from 'hono/cloudflare-workers'

const app = new Hono().get(
  '/ws',
  upgradeWebSocket(() => {
    return {
      onMessage: (event) => {
        console.log(event.data)
      },
    }
  })
)

export default app
```

```ts
// client.ts
import { hc } from 'hono/client'
import type app from './server'

const client = hc<typeof app>('http://localhost:8787')
const ws = client.ws.$ws(0)

ws.addEventListener('open', () => {
  setInterval(() => {
    ws.send(new Date().toString())
  }, 1000)
})
```

### Bun 및 JSX

```tsx
import { Hono } from 'hono'
import { upgradeWebSocket, websocket } from 'hono/bun'
import { html } from 'hono/html'

const app = new Hono()

app.get('/', (c) => {
  return c.html(
    <html>
      <head>
        <meta charset='UTF-8' />
      </head>
      <body>
        <div id='now-time'></div>
        {html`
          <script>
            const ws = new WebSocket('ws://localhost:3000/ws')
            const $nowTime = document.getElementById('now-time')
            ws.onmessage = (event) => {
              $nowTime.textContent = event.data
            }
          </script>
        `}
      </body>
    </html>
  )
})

const ws = app.get(
  '/ws',
  upgradeWebSocket((c) => {
    let intervalId
    return {
      onOpen(_event, ws) {
        intervalId = setInterval(() => {
          ws.send(new Date().toString())
        }, 200)
      },
      onClose() {
        clearInterval(intervalId)
      },
    }
  })
)

export default {
  fetch: app.fetch,
  websocket,
}
```
