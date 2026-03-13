# CORS 미들웨어

Cloudflare Workers를 웹 API로 사용하고 외부 프런트 엔드 애플리케이션에서 호출하는 사용 사례가 많이 있습니다.
이를 위해 우리는 CORS를 구현해야 합니다. 미들웨어에서도 이를 구현해 보겠습니다.

## 가져오기

```ts
import { Hono } from 'hono'
import { cors } from 'hono/cors'
```

## 사용법

```ts
const app = new Hono()

// 경로 전에 CORS를 호출해야 합니다.
app.use('/api/*', cors())
app.use(
  '/api2/*',
  cors({
    origin: 'http://example.com',
    allowHeaders: ['X-Custom-Header', 'Upgrade-Insecure-Requests'],
    allowMethods: ['POST', 'GET', 'OPTIONS'],
    ExposureHeaders: ['Content-Length', 'X-Kuma-Revision'],
    maxAge: 600,
    credentials: true,
  })
)

app.all('/api/abc', (c) => {
  return c.json({ success: true })
})
app.all('/api2/abc', (c) => {
  return c.json({ success: true })
})
```

여러 출처:

```ts
app.use(
  '/api3/*',
  cors({
    origin: ['https://example.com', 'https://example.org'],
  })
)

// 또는 "함수"를 사용할 수도 있습니다.
app.use(
  '/api4/*',
  cors({
    // `c`는 `Context` 객체입니다.
    원점: (원산지, c) => {
      return Origin.endsWith('.example.com')
        ? origin
        : 'http://example.com'
    },
  })
)
```

출처에 따른 동적 허용 방법:

```ts
app.use(
  '/api5/*',
  cors({
    origin: (원산지) =>
      origin === 'https://example.com' ? origin : '*',
    // `c`는 `Context` 객체입니다.
    allowMethods: (원산지, c) =>
      origin === 'https://example.com'
        ? ['GET', 'HEAD', 'POST', 'PATCH', 'DELETE']
        : ['GET', 'HEAD'],
  })
)
```

## 옵션

### <Badge type="info" text="optional" /> origin: `string` | `string[]` | `(origin:string, c:Context) => string`

"_Access-Control-Allow-Origin_" CORS 헤더의 값입니다. `origin: (origin) => (origin.endsWith('.example.com') ? origin : 'http://example.com')`와 같은 콜백 함수를 전달할 수도 있습니다. 기본값은 `*`입니다.

### <Badge type="info" text="optional" /> 허용 방법: `string[]` | `(origin:string, c:Context) => string[]`

"_Access-Control-Allow-Methods_" CORS 헤더의 값입니다. 콜백 함수를 전달하여 원본을 기반으로 허용되는 메서드를 동적으로 결정할 수도 있습니다. 기본값은 `['GET', 'HEAD', 'PUT', 'POST', 'DELETE', 'PATCH']`입니다.

### <Badge type="info" text="optional" /> 허용헤더: `string[]`

"_Access-Control-Allow-Headers_" CORS 헤더의 값입니다. 기본값은 `[]`입니다.

### <Badge type="info" text="optional" /> maxAge: `number`

"_Access-Control-Max-Age_" CORS 헤더의 값입니다.

### <Badge type="info" text="optional" /> credentials: `boolean`

"_Access-Control-Allow-Credentials_" CORS 헤더의 값입니다.

### <Badge type="info" text="optional" /> 노출헤더: `string[]`

"_Access-Control-Expose-Headers_" CORS 헤더의 값입니다. 기본값은 `[]`입니다.

## 환경에 따른 CORS 구성

개발이나 프로덕션 등의 실행 환경에 따라 CORS 구성을 조정하려는 경우 환경 변수에서 값을 주입하면 애플리케이션이 자체 실행 환경을 인식할 필요가 없으므로 편리합니다. 자세한 내용은 아래 예를 참조하세요.

```ts
app.use('*', async (c, next) => {
  const corsMiddlewareHandler = cors({
    origin: c.env.CORS_ORIGIN,
  })
  return corsMiddlewareHandler(c, next)
})
```

## Vite와 함께 사용

Vite에서 Hono를 사용하는 경우 `vite.config.ts`에서 `server.cors`를 `false`로 설정하여 Vite의 내장 CORS 기능을 비활성화해야 합니다. 이는 Hono의 CORS 미들웨어와의 충돌을 방지합니다.

```ts
// vite.config.ts
import { cloudflare } from '@cloudflare/vite-plugin'
import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    cors: false, // disable Vite's built-in CORS setting
  },
  plugins: [cloudflare()],
})
```
