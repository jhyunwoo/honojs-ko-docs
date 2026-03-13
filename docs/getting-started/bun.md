# Bun

[Bun](https://bun.com)는 또 다른 JavaScript 런타임입니다. Node.js 또는 Deno가 아닙니다. Bun에는 트랜스 컴파일러가 포함되어 있으므로 TypeScript를 사용하여 코드를 작성할 수 있습니다.
Hono는 Bun에서도 작동합니다.

## 1. Bun 설치

`bun` 명령을 설치하려면 [공식 웹사이트](https://bun.com)의 지침을 따르세요.

## 2. 설정

### 2.1. 새 프로젝트 설정

Bun용 스타터를 사용할 수 있습니다. "bun create" 명령으로 프로젝트를 시작하세요.
이 예에서는 `bun` 템플릿을 선택합니다.

```sh
bun create hono@latest my-app
```

my-app으로 이동하여 종속성을 설치합니다.

```sh
cd my-app
bun install
```

### 2.2. 기존 프로젝트 설정

기존 Bun 프로젝트에서는 다음을 통해 프로젝트 루트 디렉터리에 `hono` 종속성을 설치하기만 하면 됩니다.

```sh
bun add hono
```

그런 다음 기존 `package.json`에 `dev` 명령을 추가합니다.

```json
{
  "scripts": {
    "dev": "bun run --hot src/index.ts"
  }
}
```

최소 예시 설정은 [Bun 시작 템플릿](https://github.com/honojs/starter/tree/main/templates/bun)을 참조하세요. 이것은 `bun create hono@latest`를 실행한 결과입니다.

## 3. 헬로 월드

"Hello World" 스크립트는 아래와 같습니다. 다른 플랫폼에서 쓰는 것과 거의 동일합니다.

```ts
import { Hono } from 'hono'

const app = new Hono()
app.get('/', (c) => c.text('안녕하세요 Bun!'))

export default app
```

기존 프로젝트에서 Hono를 설정하는 경우 `bun run dev` 명령은 "Hello World" 스크립트가 `src/index.tx`에 배치될 것으로 예상합니다.

## 4. 실행

명령을 실행하십시오.

```sh
bun run dev
```

그런 다음 브라우저에서 `http://localhost:3000`에 액세스하세요.

## 포트 번호 변경

`port`를 내보내면서 포트 번호를 지정할 수 있습니다.

<!-- prettier-ignore -->
```ts
import { Hono } from 'hono'

const app = new Hono()
app.get('/', (c) => c.text('안녕하세요 Bun!'))

export default app // [!code --]
export default { // [!code ++]
  port: 3000, // [!code ++]
  fetch: app.fetch, // [!code ++]
} // [!code ++]
```

## 정적 파일 제공

정적 파일을 제공하려면 `hono/bun`에서 가져온 `serveStatic`를 사용하세요.

```ts
import { serveStatic } from 'hono/bun'

const app = new Hono()

app.use('/static/*', ServeStatic({ root: './' }))
app.use('/favicon.ico', ServeStatic({ path: './favicon.ico' }))
app.get('/', (c) => c.text('액세스할 수 있습니다: /static/hello.txt'))
app.get('*', ServeStatic({ path: './static/fallback.txt' }))
```

위 코드의 경우 다음 디렉터리 구조에서 잘 작동합니다.

```
./
├── favicon.ico
├── src
└── static
    ├── demo
    │   └── index.html
    ├── fallback.txt
    ├── hello.txt
    └── images
        └── dinotocat.png
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

### `mimes`

`mimes`를 사용하여 MIME 유형을 추가할 수 있습니다.

```ts
app.get(
  '/static/*',
  serveStatic({
    mimes: {
      m3u8: 'application/vnd.apple.mpegurl',
      ts: '비디오/mp2t',
    },
  })
)
```

### `onFound`

`onFound`를 사용하여 요청된 파일을 찾았을 때 처리를 지정할 수 있습니다.

```ts
app.get(
  '/static/*',
  serveStatic({
    // ...
    onFound: (_path, c) => {
      c.header('캐시 제어', `public, immutable, max-age=31536000`)
    },
  })
)
```

### `onNotFound`

`onNotFound`를 사용하여 요청한 파일을 찾을 수 없는 경우 처리를 지정할 수 있습니다.

```ts
app.get(
  '/static/*',
  serveStatic({
    onNotFound: (경로, c) => {
      console.log(`${path} is not found, you access ${c.req.path}`)
    },
  })
)
```

### `precompressed`

`precompressed` 옵션은 `.br` 또는 `.gz`와 같은 확장자를 가진 파일을 사용할 수 있는지 확인하고 `Accept-Encoding` 헤더를 기반으로 해당 파일을 제공합니다. Brotli, Zstd 및 Gzip의 우선 순위를 정합니다. 사용 가능한 파일이 없으면 원본 파일을 제공합니다.

```ts
app.get(
  '/static/*',
  serveStatic({
    precompressed: true,
  })
)
```

## 테스트

Bun에서 테스트하려면 `bun:test`를 사용할 수 있습니다.

```ts
import { describe, expect, it } from 'bun:test'
import app from '.'

describe('나의 첫 번째 테스트', () => {
  it('200 응답을 반환해야 합니다.', async () => {
    const req = new Request('http://localhost/')
    const res = await app.fetch(req)
    expect(res.status).toBe(200)
  })
})
```

그런 다음 명령을 실행하십시오.

```sh
bun test index.test.ts
```
