# 시작하기

Hono를 사용하는 것은 매우 쉽습니다. 프로젝트를 설정하고, 코드를 작성하고, 로컬 서버로 개발하고, 빠르게 배포할 수 있습니다. 진입점만 다르면 동일한 코드가 모든 런타임에서 작동합니다. Hono의 기본 사용법을 살펴보겠습니다.

## 기동기

각 플랫폼마다 스타터 템플릿을 사용할 수 있습니다. 다음 "create-hono" 명령을 사용하십시오.

::: code-group

```sh [npm]
npm create hono@latest my-app
```

```sh [yarn]
yarn create hono my-app
```

```sh [pnpm]
pnpm create hono@latest my-app
```

```sh [bun]
bun create hono@latest my-app
```

```sh [deno]
deno init --npm hono@latest my-app
```

:::

그런 다음 어떤 템플릿을 사용할 것인지 묻는 메시지가 표시됩니다.
이 예에서는 Cloudflare Workers를 선택하겠습니다.

```
? Which template do you want to use?
    aws-lambda
    bun
    cloudflare-pages
❯   cloudflare-workers
    deno
    fastly
    nextjs
    nodejs
    vercel
```

템플릿은 `my-app`로 가져오므로 템플릿으로 이동하여 종속성을 설치합니다.

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

패키지 설치가 완료되면 다음 명령을 실행하여 로컬 서버를 시작합니다.

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

## 안녕하세요 세계

Cloudflare Workers 개발 도구 "Wrangler", Deno, Bun 또는 기타 도구를 사용하여 트랜스파일을 인식하지 않고도 TypeScript에 코드를 작성할 수 있습니다.

`src/index.ts`에 Hono를 사용하여 첫 번째 애플리케이션을 작성하세요. 아래 예는 스타터 Hono 애플리케이션입니다.

`import` 및 최종 `export default` 부분은 런타임마다 다를 수 있습니다.
그러나 모든 애플리케이션 코드는 어디에서나 동일한 코드를 실행합니다.

```ts
import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => {
  return c.text('안녕하세요 Hono!')
})

export default app
```

개발 서버를 시작하고 브라우저로 `http://localhost:8787`에 액세스하세요.

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

## JSON 반환

JSON를 반환하는 것도 쉽습니다. 다음은 `/api/hello`에 대한 GET 요청을 처리하고 `application/json` 응답을 반환하는 예입니다.

```ts
app.get('/api/hello', (c) => {
  return c.json({
    ok: true,
    message: '안녕하세요 Hono!',
  })
})
```

## 요청과 응답

경로 매개변수, URL 쿼리 값을 가져오고 응답 헤더를 추가하는 과정은 다음과 같이 작성됩니다.

```ts
app.get('/posts/:id', (c) => {
  const page = c.req.query('page')
  const id = c.req.param('id')
  c.header('X-Message', '안녕!')
  return c.text(`You want to see ${page} of ${id}`)
})
```

GET뿐만 아니라 POST, PUT, DELETE도 쉽게 처리할 수 있습니다.

```ts
app.post('/posts', (c) => c.text('생성되었습니다!', 201))
app.delete('/posts/:id', (c) =>
  c.text(`${c.req.param('id')} is deleted!`)
)
```

## HTML 반환

[html 도우미](/docs/helpers/html) 또는 [JSX](/docs/guides/jsx) 구문을 사용하여 HTML를 작성할 수 있습니다. JSX를 사용하려면 파일 이름을 `src/index.tsx`로 바꾸고 구성합니다(각 런타임이 다르기 때문에 확인). 아래는 JSX를 사용한 예입니다.

```tsx
const View = () => {
  return (
    <html>
      <body>
        <h1>안녕하세요 Hono!</h1>
      </body>
    </html>
  )
}

app.get('/page', (c) => {
  return c.html(<View />)
})
```

## 원시 응답 반환

원시 [Response](https://developer.mozilla.org/en-US/docs/Web/API/Response)를 반환할 수도 있습니다.

```ts
app.get('/', () => {
  return new Response('좋은 아침이에요!')
})
```

## 미들웨어 사용

미들웨어가 당신을 위해 어려운 일을 해 줄 수 있습니다.
예를 들어 기본 인증을 추가합니다.

```ts
import { basicAuth } from 'hono/basic-auth'

// ...

app.use(
  '/admin/*',
  basicAuth({
    username: 'admin',
    password: 'secret',
  })
)

app.get('/admin', (c) => {
  return c.text('당신은 권한이 있습니다!')
})
```

JWT, CORS 및 ETag를 사용한 인증 및 Bearer를 포함한 유용한 내장 미들웨어가 있습니다.
Hono는 GraphQL Server 및 Firebase Auth와 같은 외부 라이브러리를 사용하여 타사 미들웨어도 제공합니다.
그리고 자신만의 미들웨어를 만들 수도 있습니다.

## 어댑터

정적 파일 처리 또는 WebSocket와 같은 플랫폼 종속 기능을 위한 어댑터가 있습니다.
예를 들어 Cloudflare Workers에서 WebSocket를 처리하려면 `hono/cloudflare-workers`를 가져옵니다.

```ts
import { upgradeWebSocket } from 'hono/cloudflare-workers'

app.get(
  '/ws',
  upgradeWebSocket((c) => {
    // ...
  })
)
```

## 다음 단계

대부분의 코드는 모든 플랫폼에서 작동하지만 각각에 대한 가이드가 있습니다.
예를 들어 프로젝트 설정 방법이나 배포 방법 등이 있습니다.
애플리케이션을 생성하는 데 사용하려는 정확한 플랫폼은 페이지를 참조하세요!
