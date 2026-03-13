# Cloudflare Workers

[Cloudflare Workers](https://workers.cloudflare.com)는 Cloudflare CDN의 JavaScript 에지 런타임입니다.

[Wrangler](https://developers.cloudflare.com/workers/wrangler/)를 사용하여 몇 가지 명령으로 애플리케이션을 로컬에서 개발하고 게시할 수 있습니다.
Wrangler에는 트랜스 컴파일러가 포함되어 있으므로 TypeScript로 코드를 작성할 수 있습니다.

Hono를 사용하여 Cloudflare Workers에 대한 첫 번째 애플리케이션을 만들어 보겠습니다.

## 1. 설정

Cloudflare Workers용 스타터를 사용할 수 있습니다.
"create-hono" 명령으로 프로젝트를 시작하세요.
이 예에서는 `cloudflare-workers` 템플릿을 선택합니다.

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

아래와 같이 `src/index.ts`를 편집합니다.

```ts
import { Hono } from 'hono'
const app = new Hono()

app.get('/', (c) => c.text('안녕하세요 Cloudflare Workers!'))

export default app
```

## 3. 실행

개발 서버를 로컬에서 실행합니다. 그런 다음 웹 브라우저에서 `http://localhost:8787`에 액세스하십시오.

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

### 포트 번호 변경

포트 번호를 변경해야 하는 경우 여기 지침에 따라 `wrangler.toml` / `wrangler.json` / `wrangler.jsonc` 파일을 업데이트할 수 있습니다.
[Wrangler 구성](https://developers.cloudflare.com/workers/wrangler/configuration/#local-development-settings)

또는 여기 지침에 따라 CLI 옵션을 설정할 수 있습니다.
[Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/commands/#dev)

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

그게 다야!

## 다른 이벤트 핸들러와 함께 Hono 사용

_모듈 작업자 모드_에서 Hono를 다른 이벤트 핸들러(예: `scheduled`)와 통합할 수 있습니다.

이렇게 하려면 `app.fetch`를 모듈의 `fetch` 처리기로 내보낸 다음 필요에 따라 다른 처리기를 구현합니다.

```ts
const app = new Hono()

export default {
  fetch: app.fetch,
  scheduled: async (batch, env) => {},
}
```

## 정적 파일 제공

정적 파일을 제공하려면 Cloudflare Workers의 [정적 자산 기능](https://developers.cloudflare.com/workers/static-assets/)을 사용하면 됩니다. `wrangler.toml`에 파일 디렉터리를 지정합니다.

```toml
assets = { directory = "public" }
```

그런 다음 `public` 디렉터리를 만들고 여기에 파일을 배치합니다. 예를 들어 `./public/static/hello.txt`는 `/static/hello.txt`로 제공됩니다.

```
.
├── package.json
├── public
│   ├── favicon.ico
│   └── static
│       └── hello.txt
├── src
│   └── index.ts
└── wrangler.toml
```

## 유형

작업자 유형을 가지려면 `@cloudflare/workers-types`를 설치해야 합니다.

::: code-group

```sh [npm]
npm i --save-dev @cloudflare/workers-types
```

```sh [yarn]
yarn add -D @cloudflare/workers-types
```

```sh [pnpm]
pnpm add -D @cloudflare/workers-types
```

```sh [bun]
bun add --dev @cloudflare/workers-types
```

:::

## 테스트

테스트를 위해서는 `@cloudflare/vitest-pool-workers`를 사용하는 것이 좋습니다.
설정 방법은 [예제](https://github.com/honojs/examples)를 참고하세요.

아래 신청서가 있는 경우.

```ts
import { Hono } from 'hono'

const app = new Hono()
app.get('/', (c) => c.text('나를 테스트해주세요!'))
```

이 코드를 사용하면 "_200 OK_" 응답을 반환하는지 테스트할 수 있습니다.

```ts
describe('애플리케이션 테스트', () => {
  it('200 응답을 반환해야 합니다.', async () => {
    const res = await app.request('http://localhost/')
    expect(res.status).toBe(200)
  })
})
```

## 바인딩

Cloudflare Workers에서는 환경 값, KV 네임스페이스, R2 버킷 또는 내구성 개체를 바인딩할 수 있습니다. `c.env`에서 액세스할 수 있습니다. 바인딩에 대한 "_type 정의_"를 `Hono`에 제네릭으로 전달하면 해당 유형을 갖게 됩니다.

```ts
type Bindings = {
  MY_BUCKET: R2Bucket
  USERNAME: string
  PASSWORD: string
}

const app = new Hono<{ Bindings: Bindings }>()

// 환경 가치에 대한 접근
app.put('/upload/:key', async (c, next) => {
  const key = c.req.param('key')
  await c.env.MY_BUCKET.put(key, c.req.body)
  return c.text(`Put ${key} successfully!`)
})
```

## 미들웨어에서 변수 사용

이는 모듈 작업자 모드의 유일한 경우입니다.
기본 인증 미들웨어에서 "username"이나 "password"와 같은 변수나 비밀변수를 미들웨어에서 사용하고 싶다면 다음과 같이 작성하면 됩니다.

```ts
import { basicAuth } from 'hono/basic-auth'

type Bindings = {
  USERNAME: string
  PASSWORD: string
}

const app = new Hono<{ Bindings: Bindings }>()

//...

app.use('/auth/*', async (c, next) => {
  const auth = basicAuth({
    username: c.env.USERNAME,
    password: c.env.PASSWORD,
  })
  return auth(c, next)
})
```

Bearer 인증 미들웨어, JWT 인증 등에도 동일하게 적용됩니다.

## GitHub에서 배포

CI를 통해 Cloudflare에 코드를 배포하기 전에 Cloudflare 토큰이 필요합니다. [사용자 API 토큰](https://dash.cloudflare.com/profile/api-tokens)에서 관리할 수 있습니다.

새로 생성된 토큰인 경우 **Cloudflare Workers 편집** 템플릿을 선택하고, 이미 다른 토큰이 있는 경우 토큰에 해당 권한이 있는지 확인하세요(아니요, 토큰 권한은 Cloudflare Pages와 Cloudflare Workers 간에 공유되지 않습니다).

그런 다음 GitHub 저장소 설정 대시보드(`Settings->Secrets and variables->Actions->Repository secrets`)로 이동하여 `CLOUDFLARE_API_TOKEN`라는 이름의 새 비밀을 추가하세요.

그런 다음 Hono 프로젝트 루트 폴더에 `.github/workflows/deploy.yml`를 만들고 다음 코드를 붙여넣습니다.

```yml
name: Deploy

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    name: Deploy
    steps:
      - uses: actions/checkout@v4
      - name: Deploy
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

그런 다음 `wrangler.toml`를 편집하고 `compatibility_date` 줄 뒤에 이 코드를 추가하세요.

```toml
main = "src/index.ts"
minify = true
```

모든 것이 준비되었습니다! 이제 코드를 푸시하고 즐겨보세요.

## 로컬 개발 시 환경 로드

로컬 개발을 위한 환경 변수를 구성하려면 프로젝트의 루트 디렉터리에 `.dev.vars` 파일 또는 `.env` 파일을 만듭니다.
이러한 파일은 [dotenv](https://hexdocs.pm/dotenvy/dotenv-file-format.html) 구문을 사용하여 형식을 지정해야 합니다. 예를 들어:

```
SECRET_KEY=value
API_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
```

> 이 섹션에 대한 자세한 내용은 Cloudflare 설명서에서 확인할 수 있습니다.
> https://developers.cloudflare.com/workers/wrangler/configuration/#secrets

그런 다음 `c.env.*`를 사용하여 코드에서 환경 변수를 가져옵니다.

::: info
기본적으로 `process.env`는 Cloudflare Workers에서 사용할 수 없으므로 `c.env`에서 환경 변수를 가져오는 것이 좋습니다. 사용하려면 [`nodejs_compat_populate_process_env`](https://developers.cloudflare.com/workers/configuration/compatibility-flags/#enable-auto-populating-processenv) 플래그를 활성화해야 합니다. `cloudflare:workers`에서 `env`를 가져올 수도 있습니다. 자세한 내용은 [Cloudflare 문서에서 `env`에 액세스하는 방법](https://developers.cloudflare.com/workers/runtime-apis/bindings/#how-to-access-env)을 참조하세요.
:::

```ts
type Bindings = {
  SECRET_KEY: string
}

const app = new Hono<{ Bindings: Bindings }>()

app.get('/env', (c) => {
  const SECRET_KEY = c.env.SECRET_KEY
  return c.text(SECRET_KEY)
})
```

프로젝트를 Cloudflare에 배포하기 전에 Cloudflare Workers 프로젝트 구성에서 환경 변수/비밀번호를 설정해야 합니다.

> 이 섹션에 대한 자세한 내용은 Cloudflare 설명서에서 확인할 수 있습니다.
> https://developers.cloudflare.com/workers/configuration/environment-variables/#add-environment-variables-via-the-dashboard
