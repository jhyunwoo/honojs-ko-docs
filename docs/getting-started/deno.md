# Deno

[Deno](https://deno.com/)는 V8을 기반으로 구축된 JavaScript 런타임입니다. Node.js가 아닙니다.
Hono는 Deno에서도 작동합니다.

Hono를 사용하고, TypeScript로 코드를 작성하고, `deno` 명령으로 애플리케이션을 실행하고, "Deno Deploy"에 배포할 수 있습니다.

## 1. Deno 설치

먼저 `deno` 명령을 설치하십시오.
[공식문서](https://docs.deno.com/runtime/getting_started/installation/)를 참고하세요.

## 2. 설정

Deno용 스타터를 사용할 수 있습니다.
[`deno init`](https://docs.deno.com/runtime/reference/cli/init/) 명령으로 프로젝트를 시작합니다.

```sh
deno init --npm hono --template=deno my-app
```

`my-app`로 이동합니다. Deno의 경우 Hono를 명시적으로 설치할 필요가 없습니다.

```sh
cd my-app
```

## 3. 헬로 월드

`main.ts` 편집:

```ts [main.ts]
import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => c.text('안녕하세요 Deno!'))

Deno.serve(app.fetch)
```

## 4. 실행

개발 서버를 로컬에서 실행합니다. 그런 다음 웹 브라우저에서 `http://localhost:8000`에 액세스하십시오.

```sh
deno task start
```

## 포트 번호 변경

`main.ts`에서 `Deno.serve`의 인수를 업데이트하여 포트 번호를 지정할 수 있습니다.

```ts
Deno.serve(app.fetch) // [!code --]
Deno.serve({ port: 8787 }, app.fetch) // [!code ++]
```

## 정적 파일 제공

정적 파일을 제공하려면 `hono/deno`에서 가져온 `serveStatic`를 사용하세요.

```ts
import { Hono } from 'hono'
import { serveStatic } from 'hono/deno'

const app = new Hono()

app.use('/static/*', ServeStatic({ root: './' }))
app.use('/favicon.ico', ServeStatic({ path: './favicon.ico' }))
app.get('/', (c) => c.text('액세스할 수 있습니다: /static/hello.txt'))
app.get('*', ServeStatic({ path: './static/fallback.txt' }))

Deno.serve(app.fetch)
```

위 코드의 경우 다음 디렉터리 구조에서 잘 작동합니다.

```
./
├── favicon.ico
├── index.ts
└── static
    ├── demo
    │   └── index.html
    ├── fallback.txt
    ├── hello.txt
    └── images
        └── dinotocat.png
```

### `rewriteRequestPath`

`http://localhost:8000/static/*`를 `./statics`에 매핑하려면 `rewriteRequestPath` 옵션을 사용할 수 있습니다.

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

## Deno 배포

Deno Deploy는 클라우드에서 JavaScript 및 TypeScript 애플리케이션을 실행하기 위한 서버리스 플랫폼입니다.
GitHub 배포와 같은 통합을 통해 애플리케이션을 배포하고 실행하기 위한 관리 플레인을 제공합니다.

Hono는 Deno Deploy에서도 작동합니다. [공식문서](https://docs.deno.com/deploy/manual/)를 참고하세요.

## 테스트

Deno에서 애플리케이션을 테스트하는 것은 쉽습니다.
`Deno.test`로 작성하고 [@std/assert](https://jsr.io/@std/assert)에서 `assert` 또는 `assertEquals`를 사용할 수 있습니다.

```sh
deno add jsr:@std/assert
```

```ts [hello.ts]
import { Hono } from 'hono'
import { assertEquals } from '@std/assert'

Deno.test('안녕하세요 세계', async () => {
  const app = new Hono()
  app.get('/', (c) => c.text('나를 시험해 주세요'))

  const res = await app.request('http://localhost/')
  assertEquals(res.status, 200)
})
```

그런 다음 다음 명령을 실행합니다.

```sh
deno test hello.ts
```

## npm 및 JSR

Hono는 [npm](https://www.npmjs.com/package/hono) 및 [JSR](https://jsr.io/@hono/hono)(JavaScript 레지스트리)에서 모두 사용할 수 있습니다. `deno.json`에서 `npm:hono` 또는 `jsr:@hono/hono`를 사용할 수 있습니다.

```json
{
  "imports": {
    "hono": "jsr:@hono/hono" // [!code --]
    "hono": "npm:hono" // [!code ++]
  }
}
```

미들웨어를 사용하려면 가져오기에서 [Deno 디렉터리](https://docs.deno.com/runtime/fundamentals/configuration/#custom-path-mappings) 구문을 사용해야 합니다.

```json
{
  "imports": {
    "hono/": "npm:/hono/"
  }
}
```

타사 미들웨어를 사용하는 경우 적절한 TypeScript 유형 추론을 위해 미들웨어와 동일한 레지스트리에서 Hono를 사용해야 할 수도 있습니다. 예를 들어 npm의 미들웨어를 사용하는 경우 npm의 Hono도 사용해야 합니다.

```json
{
  "imports": {
    "hono": "npm:hono",
    "zod": "npm:zod",
    "@hono/zod-validator": "npm:@hono/zod-validator"
  }
}
```

또한 [JSR](https://jsr.io/@hono)에서 다양한 타사 미들웨어 패키지를 제공합니다. JSR에서 미들웨어를 사용하는 경우 JSR에서 Hono를 사용하세요.

```json
{
  "imports": {
    "hono": "jsr:@hono/hono",
    "zod": "npm:zod",
    "@hono/zod-validator": "jsr:@hono/zod-validator"
  }
}
```
