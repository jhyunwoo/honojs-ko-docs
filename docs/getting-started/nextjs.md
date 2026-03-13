# Next.js

Next.js는 빠른 웹 애플리케이션을 만들 수 있는 빌딩 블록을 제공하는 유연한 React 프레임워크입니다.

Node.js 런타임을 사용할 때 Next.js에서 Hono를 실행할 수 있습니다.\
Vercel에서 Vercel 함수를 사용하면 Next.js로 Hono를 쉽게 배포할 수 있습니다.

## 1. 설정

Next.js의 스타터를 사용할 수 있습니다.
"create-hono" 명령으로 프로젝트를 시작하세요.
이 예에서는 `nextjs` 템플릿을 선택합니다.

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

## 2. 헬로 월드

앱 라우터를 사용하는 경우 `app/api/[[...route]]/route.ts`를 편집하세요. 자세한 옵션은 [지원되는 HTTP 방법](https://nextjs.org/docs/app/building-your-application/routing/route-handlers#supported-http-methods) 섹션을 참조하세요.

```ts
import { Hono } from 'hono'
import { handle } from 'hono/vercel'

const app = new Hono().basePath('/api')

app.get('/hello', (c) => {
  return c.json({
    message: '안녕하세요 Next.js입니다!',
  })
})

export const GET = handle(app)
export const POST = handle(app)
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

```sh [bun]
bun run dev
```

:::

이제 `/api/hello`는 JSON를 반환하지만 React UI를 빌드하면 Hono를 사용하여 전체 스택 애플리케이션을 만들 수 있습니다.

## 4. 배포

Vercel 계정이 있는 경우 Git 리포지토리를 연결하여 배포할 수 있습니다.

## 페이지 라우터

Pages Router를 사용하는 경우 먼저 Node.js 어댑터를 설치해야 합니다.

::: code-group

```sh [npm]
npm i @hono/node-server
```

```sh [yarn]
yarn add @hono/node-server
```

```sh [pnpm]
pnpm add @hono/node-server
```

```sh [bun]
bun add @hono/node-server
```

:::

그런 다음 `pages/api/[[...route]].ts`의 `@hono/node-server/vercel`에서 가져온 `handle` 기능을 활용할 수 있습니다.

```ts
import { Hono } from 'hono'
import { handle } from '@hono/node-server/vercel'
import type { PageConfig } from 'next'

export const config: PageConfig = {
  api: {
    bodyParser: false,
  },
}

const app = new Hono().basePath('/api')

app.get('/hello', (c) => {
  return c.json({
    message: '안녕하세요 Next.js입니다!',
  })
})

export default handle(app)
```

이것이 페이지 라우터와 함께 작동하려면 프로젝트 대시보드 또는 `.env` 파일에서 환경 변수를 설정하여 Vercel Node.js 도우미를 비활성화하는 것이 중요합니다.

```text
NODEJS_HELPERS=0
```
