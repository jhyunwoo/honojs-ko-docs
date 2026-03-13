# Node.js

[Node.js](https://nodejs.org/)는 오픈 소스, 크로스 플랫폼 JavaScript 런타임 환경입니다.

Hono는 처음에는 Node.js용으로 설계되지 않았습니다. 그러나 [Node.js 어댑터](https://github.com/honojs/node-server)를 사용하면 Node.js에서도 실행할 수 있습니다.

::: info
18.x보다 큰 Node.js 버전에서 작동합니다. 구체적인 필수 Node.js 버전은 다음과 같습니다.

- 18.x => 18.14.1+
- 19.x => 19.7.0+
- 20.x => 20.0.0+

기본적으로 각 주요 릴리스의 최신 버전을 간단히 사용할 수 있습니다.
:::

## 1. 설정

Node.js용 스타터를 사용할 수 있습니다.
"create-hono" 명령으로 프로젝트를 시작하세요.
이 예에서는 `nodejs` 템플릿을 선택합니다.

::: code-group

```sh [npm]
npm create hono@latest my-app
```

```sh [yarn]
yarn create hono my-app
```

```sh [pnpm]
pnpm create hono my-app
```

```sh [bun]
bun create hono@latest my-app
```

```sh [deno]
deno init --npm hono my-app
```

:::
`my-app`로 이동하여 종속성을 설치합니다.

::: code-group

```sh [npm]
cd my-app
npm i
```

```sh [yarn]
cd my-app
yarn
```

```sh [pnpm]
cd my-app
pnpm i
```

```sh [bun]
cd my-app
bun i
```

:::

## 2. 헬로 월드

`src/index.ts` 편집:

```ts
import { serve } from '@hono/node-server'
import { Hono } from 'hono'

const app = new Hono()
app.get('/', (c) => c.text('안녕하세요 Node.js!'))

serve(app)
```

서버를 정상적으로 종료하려면 다음과 같이 작성하세요.

```ts
const server = serve(app)

// 우아한 종료
process.on('SIGINT', () => {
  server.close()
  process.exit(0)
})
process.on('SIGTERM', () => {
  server.close((err) => {
    if (err) {
      console.error(err)
      process.exit(1)
    }
    process.exit(0)
  })
})
```

## 3. 실행

개발 서버를 로컬에서 실행합니다. 그런 다음 웹 브라우저에서 `http://localhost:3000`에 액세스하십시오.

::: code-group

```sh [npm]
npm run dev
```

```sh [yarn]
yarn dev
```

```sh [pnpm]
pnpm dev
```

:::

## 포트 번호 변경

`port` 옵션을 사용하여 포트 번호를 지정할 수 있습니다.

```ts
serve({
  fetch: app.fetch,
  port: 8787,
})
```

## 원시 Node.js API에 액세스합니다.

`c.env.incoming` 및 `c.env.outgoing`에서 Node.js API에 액세스할 수 있습니다.

```ts
import { Hono } from 'hono'
import { serve, type HttpBindings } from '@hono/node-server'
// 또는 HTTP2를 사용하는 경우 `Http2Bindings`

type Bindings = HttpBindings & {
  /* ... */
}

const app = new Hono<{ Bindings: Bindings }>()

app.get('/', (c) => {
  return c.json({
    remoteAddress: c.env.incoming.socket.remoteAddress,
  })
})

serve(app)
```

## 정적 파일 제공

`serveStatic`를 사용하여 로컬 파일 시스템에서 정적 파일을 제공할 수 있습니다. 예를 들어 디렉터리 구조가 다음과 같다고 가정합니다.

```sh
./
├── favicon.ico
├── index.ts
└── static
    ├── hello.txt
    └── image.png
```

`/static/*` 경로에 대한 요청이 들어오고 `./static` 아래의 파일을 반환하려는 경우 다음과 같이 작성할 수 있습니다.

```ts
import { serveStatic } from '@hono/node-server/serve-static'

app.use('/static/*', ServeStatic({ root: './' }))
```

디렉터리 루트에서 `favicon.ico`를 제공하려면 `path` 옵션을 사용합니다.

```ts
app.use('/favicon.ico', serveStatic({ path: './favicon.ico' }))
```

`/hello.txt` 또는 `/image.png` 경로에 대한 요청이 들어오고 `./static/hello.txt` 또는 `./static/image.png`라는 파일을 반환하려는 경우 다음을 사용할 수 있습니다.

```ts
app.use('*', serveStatic({ root: './static' }))
```

### `rewriteRequestPath`

`http://localhost:3000/static/*`를 `./statics`에 매핑하려면 `rewriteRequestPath` 옵션을 사용할 수 있습니다.

```ts
app.get(
  '/static/*',
  serveStatic({
    root: './',
    rewriteRequestPath: (경로) =>
      path.replace(/^\/static/, '/statics'),
  })
)
```

## http2

[Node.js http2 서버](https://nodejs.org/api/http2.html)에서 hono를 실행할 수 있습니다.

### 암호화되지 않은 http2

```ts
import { createServer } from 'node:http2'

const server = serve({
  fetch: app.fetch,
  createServer,
})
```

### 암호화된 http2

```ts
import { createSecureServer } from 'node:http2'
import { readFileSync } from 'node:fs'

const server = serve({
  fetch: app.fetch,
  createServer: createSecureServer,
  serverOptions: {
    key: readFileSync('localhost-privkey.pem'),
    cert: readFileSync('localhost-cert.pem'),
  },
})
```

## 구축 및 배포

::: code-group

```sh [npm]
npm run build
```

```sh [yarn]
yarn run build
```

```sh [pnpm]
pnpm run build
```

```sh [bun]
bun run build
```

::: info
프런트 엔드 프레임워크가 있는 앱은 [Hono의 Vite 플러그인](https://github.com/honojs/vite-plugins)을 사용해야 할 수도 있습니다.
:::

### 도커파일

다음은 nodejs Dockerfile의 예입니다.

```Dockerfile
FROM node:22-alpine AS base

FROM base AS builder

RUN apk add --no-cache gcompat
WORKDIR /app

COPY package*json tsconfig.json src ./

RUN npm ci && \
    npm run build && \
    npm prune --production

FROM base AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 hono

COPY --from=builder --chown=hono:nodejs /app/node_modules /app/node_modules
COPY --from=builder --chown=hono:nodejs /app/dist /app/dist
COPY --from=builder --chown=hono:nodejs /app/package.json /app/package.json

USER hono
EXPOSE 3000

CMD ["node", "/app/dist/index.js"]
```
