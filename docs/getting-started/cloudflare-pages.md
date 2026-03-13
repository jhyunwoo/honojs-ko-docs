# Cloudflare Pages

[Cloudflare Pages](https://pages.cloudflare.com)는 풀 스택 웹 애플리케이션을 위한 엣지 플랫폼입니다.
Cloudflare Workers에서 제공하는 정적 파일과 동적 콘텐츠를 제공합니다.

Hono는 Cloudflare Pages를 완벽하게 지원합니다.
즐거운 개발자 경험을 소개합니다. Vite의 개발 서버는 빠르며 Wrangler를 사용한 배포는 매우 빠릅니다.

## 1. 설정

Cloudflare Pages용 스타터를 사용할 수 있습니다.
"create-hono" 명령으로 프로젝트를 시작하세요.
이 예에서는 `cloudflare-pages` 템플릿을 선택합니다.

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

`my-app`로 이동하고 종속성을 설치합니다.

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

아래는 기본적인 디렉토리 구조입니다.

```text
./
├── package.json
├── public
│   └── static // Put your static files.
│       └── style.css // You can refer to it as `/static/style.css`.
├── src
│   ├── index.tsx // The entry point for server-side.
│   └── renderer.tsx
├── tsconfig.json
└── vite.config.ts
```

## 2. 헬로 월드

다음과 같이 `src/index.tsx`를 편집합니다.

```tsx
import { Hono } from 'hono'
import { renderer } from './renderer'

const app = new Hono()

app.get('*', renderer)

app.get('/', (c) => {
  return c.render(<h1>안녕하세요, Cloudflare Pages!</h1>)
})

export default app
```

## 3. 실행

개발 서버를 로컬에서 실행합니다. 그런 다음 웹 브라우저에서 `http://localhost:5173`에 액세스하십시오.

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

```sh [bun]
bun run dev
```

:::

## 4. 배포

Cloudflare 계정이 있는 경우 Cloudflare에 배포할 수 있습니다. `package.json`에서 `$npm_execpath`를 선택한 패키지 관리자로 변경해야 합니다.

::: code-group

```sh [npm]
npm run deploy
```

```sh [yarn]
yarn deploy
```

```sh [pnpm]
pnpm run deploy
```

```sh [bun]
bun run deploy
```

:::

### GitHub를 사용하여 Cloudflare 대시보드를 통해 배포

1. [Cloudflare 대시보드](https://dash.cloudflare.com)에 로그인하고 계정을 선택하세요.
2. 계정 홈에서 작업자 및 페이지 > 애플리케이션 생성 > 페이지 > Git에 연결을 선택합니다.
3. GitHub 계정에 권한을 부여하고 저장소를 선택하세요. 빌드 및 배포 설정에서 다음 정보를 제공합니다.

| 구성 옵션 | 값           |
| -------------------- | --------------- |
| 생산 지점    | `main`          |
| 빌드 명령        | `npm run build` |
| 디렉토리 구축      | `dist`          |

## 바인딩

변수, KV, D1 등과 같은 Cloudflare 바인딩을 사용할 수 있습니다.
이번 섹션에서는 변수와 KV를 사용해 보겠습니다.

### `wrangler.toml` 생성

먼저 로컬 바인딩에 대해 `wrangler.toml`를 만듭니다.

```sh
touch wrangler.toml
```

`wrangler.toml`를 편집하세요. 이름이 `MY_NAME`인 변수를 지정합니다.

```toml
[vars]
MY_NAME = "Hono"
```

### KV 생성

다음으로 KV를 만듭니다. 다음 `wrangler` 명령을 실행합니다.

```sh
wrangler kv namespace create MY_KV --preview
```

다음 출력으로 `preview_id`를 기록해 두십시오.

```
{ binding = "MY_KV", preview_id = "abcdef" }
```

바인딩 이름 `MY_KV`로 `preview_id`를 지정합니다.

```toml
[[kv_namespaces]]
binding = "MY_KV"
id = "abcdef"
```

### `vite.config.ts` 편집

`vite.config.ts`를 편집합니다.

```ts
import devServer from '@hono/vite-dev-server'
import adapter from '@hono/vite-dev-server/cloudflare'
import build from '@hono/vite-cloudflare-pages'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    devServer({
      entry: 'src/index.tsx',
      adapter, // Cloudflare Adapter
    }),
    build(),
  ],
})
```

### 애플리케이션에서 바인딩 사용

애플리케이션에서 변수와 KV를 사용하십시오. 유형을 설정합니다.

```ts
type Bindings = {
  MY_NAME: string
  MY_KV: KVNamespace
}

const app = new Hono<{ Bindings: Bindings }>()
```

사용하세요:

```tsx
app.get('/', async (c) => {
  await c.env.MY_KV.put('name', c.env.MY_NAME)
  const name = await c.env.MY_KV.get('name')
  return c.render(<h1>안녕하세요! {name}</h1>)
})
```

### 생산 중

Cloudflare Pages의 경우 로컬 개발에는 `wrangler.toml`를 사용하지만 프로덕션의 경우 대시보드에서 바인딩을 설정합니다.

## 클라이언트 측

Vite의 기능을 사용하여 클라이언트 측 스크립트를 작성하고 이를 애플리케이션으로 가져올 수 있습니다.
`/src/client.ts`가 클라이언트의 진입점인 경우 스크립트 태그에 작성하면 됩니다.
또한 `import.meta.env.PROD`는 개발 서버에서 실행 중인지 아니면 빌드 단계에서 실행 중인지 감지하는 데 유용합니다.

```tsx
app.get('/', (c) => {
  return c.html(
    <html>
      <head>
        {import.meta.env.PROD ? (
          <script type='module' src='/static/client.js'></script>
        ) : (
          <script type='module' src='/src/client.ts'></script>
        )}
      </head>
      <body>
        <h1>안녕하세요</h1>
      </body>
    </html>
  )
})
```

스크립트를 올바르게 빌드하려면 아래와 같이 예제 구성 파일 `vite.config.ts`를 사용할 수 있습니다.

```ts
import pages from '@hono/vite-cloudflare-pages'
import devServer from '@hono/vite-dev-server'
import { defineConfig } from 'vite'

export default defineConfig(({ mode }) => {
  if (mode === 'client') {
    return {
      build: {
        rollupOptions: {
          input: './src/client.ts',
          output: {
            entryFileNames: 'static/client.js',
          },
        },
      },
    }
  } else {
    return {
      plugins: [
        pages(),
        devServer({
          entry: 'src/index.tsx',
        }),
      ],
    }
  }
})
```

다음 명령을 실행하여 서버 및 클라이언트 스크립트를 빌드할 수 있습니다.

```sh
vite build --mode client && vite build
```

## Cloudflare Pages 미들웨어

Cloudflare Pages는 Hono의 미들웨어와는 다른 자체 [미들웨어](https://developers.cloudflare.com/pages/functions/middleware/) 시스템을 사용합니다. 다음과 같이 `_middleware.ts`라는 파일로 `onRequest`를 내보내 활성화할 수 있습니다.

```ts
// 기능/_middleware.ts
export async function onRequest(pagesContext) {
  console.log(`You are accessing ${pagesContext.request.url}`)
  return await pagesContext.next()
}
```

`handleMiddleware`를 사용하면 Hono의 미들웨어를 Cloudflare Pages 미들웨어로 사용할 수 있습니다.

```ts
// 기능/_middleware.ts
import { handleMiddleware } from 'hono/cloudflare-pages'

export const onRequest = handleMiddleware(async (c, next) => {
  console.log(`You are accessing ${c.req.url}`)
  await next()
})
```

Hono에 내장된 타사 미들웨어를 사용할 수도 있습니다. 예를 들어 기본 인증을 추가하려면 [Hono의 기본 인증 미들웨어](/docs/middleware/builtin/basic-auth)를 사용하면 됩니다.

```ts
// 기능/_middleware.ts
import { handleMiddleware } from 'hono/cloudflare-pages'
import { basicAuth } from 'hono/basic-auth'

export const onRequest = handleMiddleware(
  basicAuth({
    username: 'hono',
    password: 'acoolproject',
  })
)
```

여러 미들웨어를 적용하려면 다음과 같이 작성할 수 있습니다.

```ts
import { handleMiddleware } from 'hono/cloudflare-pages'

// ...

export const onRequest = [
  handleMiddleware(middleware1),
  handleMiddleware(middleware2),
  handleMiddleware(middleware3),
]
```

### `EventContext`에 액세스 중

`handleMiddleware`의 `c.env`를 통해 [`EventContext`](https://developers.cloudflare.com/pages/functions/api-reference/#eventcontext) 개체에 액세스할 수 있습니다.

```ts
// 기능/_middleware.ts
import { handleMiddleware } from 'hono/cloudflare-pages'

export const onRequest = [
  handleMiddleware(async (c, next) => {
    c.env.eventContext.data.user = 'Joe'
    await next()
  }),
]
```

그런 다음 핸들러에서 `c.env.eventContext`를 통해 데이터 값에 액세스할 수 있습니다.

```ts
// 기능/api/[[route]].ts
import type { EventContext } from 'hono/cloudflare-pages'
import { handle } from 'hono/cloudflare-pages'

// ...

type Env = {
  Bindings: {
    eventContext: EventContext
  }
}

const app = new Hono<Env>().basePath('/api')

app.get('/hello', (c) => {
  return c.json({
    message: `Hello, ${c.env.eventContext.data.user}!`, // '조'
  })
})

export const onRequest = handle(app)
```
