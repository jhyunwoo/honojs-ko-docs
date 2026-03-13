# Fastly Compute

[Fastly Compute](https://www.fastly.com/products/edge-compute)는 Fastly의 글로벌 엣지 네트워크에서 원하는 언어로 코드를 실행하는 고급 엣지 컴퓨팅 시스템입니다. Hono는 Fastly Compute에서도 작동합니다.

로컬에서 애플리케이션을 개발하고 템플릿의 일부로 로컬에 자동으로 설치되는 [Fastly CLI](https://www.fastly.com/documentation/reference/tools/cli/)를 사용하여 몇 가지 명령으로 게시할 수 있습니다.

## 1. 설정

Fastly Compute용 스타터를 사용할 수 있습니다.
"create-hono" 명령으로 프로젝트를 시작하세요.
이 예에서는 `fastly` 템플릿을 선택합니다.

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
// src/index.ts
import { Hono } from 'hono'
import { fire } from '@fastly/hono-fastly-compute'

const app = new Hono()

app.get('/', (c) => c.text('안녕하세요 Fastly!'))

fire(app)
```

> [!메모]
> 애플리케이션의 최상위 수준에서 `@fastly/hono-fastly-compute'`에서 `fire`(또는 `buildFire()`)를 사용하는 경우 `'hono/quick'`보다는 `'hono'`에서 `Hono`를 사용하는 것이 적합합니다. 왜냐하면 `fire`는 라우터가 애플리케이션 초기화 단계에서 내부 데이터를 구축하도록 하기 때문입니다.

## 3. 실행

개발 서버를 로컬에서 실행합니다. 그런 다음 웹 브라우저에서 `http://localhost:7676`에 액세스하십시오.

::: code-group

```sh [npm]
npm run start
```

```sh [yarn]
yarn start
```

```sh [pnpm]
pnpm run start
```

```sh [bun]
bun run start
```

:::

## 4. 배포

애플리케이션을 빌드하고 Fastly 계정에 배포하려면 다음 명령을 입력합니다. 애플리케이션을 처음 배포하면 계정에 새 서비스를 생성하라는 메시지가 표시됩니다.

아직 계정이 없다면 [Fastly 계정을 생성](https://www.fastly.com/signup/)해야 합니다.

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

## 바인딩

Fastly Compute에서는 KV 저장소, 구성 저장소, 비밀 저장소, 백엔드, 액세스 제어 목록, 명명된 로그 스트림 및 환경 변수와 같은 Fastly 플랫폼 리소스를 바인딩할 수 있습니다. `c.env`를 통해 액세스할 수 있으며 개별 SDK 유형이 있습니다.

이러한 바인딩을 사용하려면 `@fastly/hono-fastly-compute`에서 `fire` 대신 `buildFire`를 가져옵니다. [바인딩](https://github.com/fastly/compute-js-context?tab=readme-ov-file#typed-bindings-with-buildcontextproxy)을 정의하고 [`buildFire()`](https://github.com/fastly/hono-fastly-compute?tab=readme-ov-file#basic-example)에 전달하여 `fire`를 얻습니다. 그런 다음 `Hono`를 구성할 때 `fire.Bindings`를 사용하여 `Env` 유형을 정의하세요.

```ts
// src/index.ts
import { buildFire } from '@fastly/hono-fastly-compute'

const fire = buildFire({
  siteData: 'KVStore:site-data', // I have a KV Store named "site-data"
})

const app = new Hono<{ Bindings: typeof fire.Bindings }>()

app.put('/upload/:key', async (c, next) => {
  // 예: KV 스토어에 접속
  const key = c.req.param('key')
  await c.env.siteData.put(key, c.req.body)
  return c.text(`Put ${key} successfully!`)
})

fire(app)
```
