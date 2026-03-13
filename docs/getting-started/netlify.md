# Netlify

Netlify는 정적 사이트 호스팅 및 서버리스 백엔드 서비스를 제공합니다. [Edge Functions](https://docs.netlify.com/edge-functions/overview/)를 사용하면 웹페이지를 동적으로 만들 수 있습니다.

Edge Functions는 Deno 및 TypeScript 쓰기를 지원하며 [Netlify CLI](https://docs.netlify.com/cli/get-started/)를 통해 배포가 쉬워집니다. Hono를 사용하면 Netlify Edge Functions용 ​​애플리케이션을 만들 수 있습니다.

## 1. 설정

Netlify용 스타터를 사용할 수 있습니다.
"create-hono" 명령으로 프로젝트를 시작하세요.
이 예에서는 `netlify` 템플릿을 선택합니다.

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

`my-app`로 이동합니다.

## 2. 헬로 월드

`netlify/edge-functions/index.ts` 편집:

```ts
import { Hono } from 'jsr:@hono/hono'
import { handle } from 'jsr:@hono/hono/netlify'

const app = new Hono()

app.get('/', (c) => {
  return c.text('안녕하세요 Hono!')
})

export default handle(app)
```

## 3. 실행

Netlify CLI를 사용하여 개발 서버를 실행합니다. 그런 다음 웹 브라우저에서 `http://localhost:8888`에 액세스하십시오.

```sh
netlify dev
```

## 4. 배포

`netlify deploy` 명령을 사용하여 배포할 수 있습니다.

```sh
netlify deploy --prod
```

## `Context`

`c.env`를 통해 Netlify의 `Context`에 액세스할 수 있습니다.

```ts
import { Hono } from 'jsr:@hono/hono'
import { handle } from 'jsr:@hono/hono/netlify'

// 유형 정의 가져오기
import type { Context } from 'https://edge.netlify.com/'

export type Env = {
  Bindings: {
    context: Context
  }
}

const app = new Hono<Env>()

app.get('/country', (c) =>
  c.json({
    '당신은': c.env.context.geo.country?.name,
  })
)

export default handle(app)
```
