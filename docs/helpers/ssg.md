# SSG 도우미

SSG 도우미는 Hono 애플리케이션에서 정적 사이트를 생성합니다. 등록된 경로의 내용을 검색하여 정적 파일로 저장합니다.

## 사용법

### 수동

다음과 같은 간단한 Hono 애플리케이션이 있는 경우:

```tsx
// index.tsx
const app = new Hono()

app.get('/', (c) => c.html('안녕하세요, 월드!'))

app.use('/about', async (c, next) => {
  c.setRenderer((content) => {
    return c.html(
      <html>
        <head />
        <body>
          <p>{content}</p>
        </body>
      </html>
    )
  })
  await next()
})

app.get('/about', (c) => {
  return c.render(
    <>
      <title>Hono SSG 페이지</title>Hello!
    </>
  )
})

export default app
```

Node.js의 경우 다음과 같은 빌드 스크립트를 만듭니다.

```ts
// build.ts
import app from './index'
import { toSSG } from 'hono/ssg'
import fs from 'fs/promises'

toSSG(app, fs)
```

스크립트를 실행하면 파일이 다음과 같이 출력됩니다.

```bash
ls ./static
about.html  index.html
```

### VITE 플러그인

`@hono/vite-ssg` Vite 플러그인을 사용하면 프로세스를 쉽게 처리할 수 있습니다.

자세한 내용은 여기를 참조하세요.

https://github.com/honojs/vite-plugins/tree/main/packages/ssg

## toSSG

`toSSG`는 애플리케이션과 파일 시스템 모듈을 인수로 사용하여 정적 사이트를 생성하는 주요 기능입니다. 이는 다음을 기반으로 합니다.

### 입력

toSSG에 대한 인수는 ToSSGInterface에 지정됩니다.

```ts
export interface ToSSGInterface {
  (
    app: Hono,
    fsModule: FileSystemModule,
    options?: ToSSGOptions
  ): Promise<ToSSGResult>
}
```

- `app`는 등록된 경로로 `new Hono()`를 지정합니다.
- `fs`는 `node:fs/promise`를 가정하여 다음 개체를 지정합니다.

```ts
export interface FileSystemModule {
  writeFile(path: string, data: string | Uint8Array): Promise<void>
  mkdir(
    path: string,
    options: { recursive: boolean }
  ): Promise<void | string>
}
```

### Deno 및 Bun용 어댑터 사용

Deno 또는 Bun에서 SSG를 사용하려는 경우 각 파일 시스템마다 `toSSG` 기능이 제공됩니다.

Deno의 경우:

```ts
import { toSSG } from 'hono/deno'

toSSG(app) // The second argument is an option typed `ToSSGOptions`.
```

Bun의 경우:

```ts
import { toSSG } from 'hono/bun'

toSSG(app) // The second argument is an option typed `ToSSGOptions`.
```

### 옵션

옵션은 ToSSGOptions 인터페이스에 지정됩니다.

```ts
export interface ToSSGOptions {
  dir?: string
  concurrency?: number
  extensionMap?: Record<string, string>
  plugins?: SSGPlugin[]
}
```

- `dir`는 정적 파일의 출력 대상입니다. 기본값은 `./static`입니다.
- `concurrency`는 동시에 생성되는 동시 파일 수입니다. 기본값은 `2`입니다.
- `extensionMap`는 `Content-Type`를 키로, 확장 문자열을 값으로 포함하는 맵입니다. 이는 출력 파일의 파일 확장자를 결정하는 데 사용됩니다.
- `plugins`는 정적 사이트 생성 프로세스의 기능을 확장하는 SSG 플러그인 배열입니다.

### 산출

`toSSG`는 다음 Result 유형으로 결과를 반환합니다.

```ts
export interface ToSSGResult {
  success: boolean
  files: string[]
  error?: Error
}
```

## 파일 생성

### 경로 및 파일 이름

등록된 경로 정보와 생성된 파일 이름에는 다음 규칙이 적용됩니다. 기본 `./static`는 다음과 같이 작동합니다.

- `/` -> `./static/index.html`
- `/path` -> `./static/path.html`
- `/path/` -> `./static/path/index.html`

### 파일 확장자

파일 확장자는 각 경로에서 반환된 `Content-Type`에 따라 달라집니다. 예를 들어 `c.html`의 응답은 `.html`로 저장됩니다.

파일 확장자를 사용자 정의하려면 `extensionMap` 옵션을 설정하십시오.

```ts
import { toSSG, defaultExtensionMap } from 'hono/ssg'

// `.html`를 사용하여 `application/x-html` 콘텐츠 저장
toSSG(app, fs, {
  extensionMap: {
    'application/x-html': 'html',
    ...defaultExtensionMap,
  },
})
```

슬래시로 끝나는 경로는 확장자에 관계없이 index.ext로 저장된다는 점에 유의하세요.

```ts
// ./static/html/index.html에 저장
app.get('/html/', (c) => c.html('html'))

// ./static/text/index.txt에 저장
app.get('/text/', (c) => c.text('text'))
```

## 미들웨어

SSG를 지원하는 내장 미들웨어를 소개합니다.

### ssgParams

Next.js의 `generateStaticParams`와 같은 API를 사용할 수 있습니다.

예:

```ts
app.get(
  '/shops/:id',
  ssgParams(async () => {
    const shops = await getShops()
    return shops.map((shop) => ({ id: shop.id }))
  }),
  async (c) => {
    const shop = await getShop(c.req.param('id'))
    if (!shop) {
      return c.notFound()
    }
    return c.render(
      <div>
        <h1>{shop.name}</h1>
      </div>
    )
  }
)
```

### 비활성화SSG

`disableSSG` 미들웨어 세트가 있는 경로는 `toSSG`에 의한 정적 파일 생성에서 제외됩니다.

```ts
app.get('/api', disableSSG(), (c) => c.text('an-api'))
```

### 만SSG

`onlySSG` 미들웨어 세트가 있는 경로는 `toSSG` 실행 후 `c.notFound()`에 의해 재정의됩니다.

```ts
app.get('/static-page', onlySSG(), (c) =>c.html(<h1>내 사이트에 오신 것을 환영합니다</h1>))
```

## 플러그인

플러그인을 사용하면 정적 사이트 생성 프로세스의 기능을 확장할 수 있습니다. 그들은 후크를 사용하여 다양한 단계에서 생성 프로세스를 사용자 정의합니다.

### 기본 플러그인

기본적으로 `toSSG`는 200이 아닌 상태 응답(예: 리디렉션, 오류 또는 404)을 건너뛰는 `defaultPlugin`를 사용합니다. 이렇게 하면 실패한 응답에 대한 파일이 생성되지 않습니다.

```ts
import { toSSG, defaultPlugin } from 'hono/ssg'

// 지정된 플러그인이 없으면 defaultPlugin이 자동으로 적용됩니다.
toSSG(app, fs)

// 다음과 동일:
toSSG(app, fs, { plugins: [defaultPlugin] })
```

사용자 정의 플러그인을 지정하면 `defaultPlugin`가 자동으로 포함되지 **않습니다**. 사용자 정의 플러그인을 추가하는 동안 기본 동작을 유지하려면 명시적으로 포함하십시오.

```ts
toSSG(app, fs, {
  plugins: [defaultPlugin, myCustomPlugin],
})
```

### 리디렉션 플러그인

`redirectPlugin`는 HTTP 리디렉션 응답(301, 302, 303, 307, 308)을 반환하는 경로에 대해 HTML 리디렉션 페이지를 생성합니다. 생성된 HTML에는 `<meta http-equiv="refresh">` 태그와 표준 링크가 포함됩니다.

```ts
import { toSSG, redirectPlugin, defaultPlugin } from 'hono/ssg'

toSSG(app, fs, {
  plugins: [redirectPlugin(), defaultPlugin()],
})
```

예를 들어 앱에 다음이 포함된 경우:

```ts
app.get('/old', (c) => c.redirect('/new'))
```

`redirectPlugin`는 `/new`로 리디렉션되는 메타 새로 고침을 사용하여 `/old.html`에서 HTML 파일을 생성합니다.

> [!메모]
> `defaultPlugin`와 함께 사용하는 경우 `redirectPlugin`를 `defaultPlugin` **앞에** 배치하세요. `defaultPlugin`는 200이 아닌 응답을 건너뛰므로 먼저 배치하면 `redirectPlugin`가 리디렉션 응답을 처리하지 못하게 됩니다.

### 후크 유형

플러그인은 다음 후크를 사용하여 `toSSG` 프로세스를 사용자 정의할 수 있습니다.

```ts
export type BeforeRequestHook = (req: Request) => Request | false
export type AfterResponseHook = (res: Response) => Response | false
export type AfterGenerateHook = (
  result: ToSSGResult
) => void | Promise<void>
```

- **BeforeRequestHook**: 각 요청을 처리하기 전에 호출됩니다. 경로를 건너뛰려면 `false`를 반환하세요.
- **AfterResponseHook**: 각 응답을 받은 후 호출됩니다. 파일 생성을 건너뛰려면 `false`를 반환합니다.
- **AfterGenerateHook**: 전체 생성 프로세스가 완료된 후 호출됩니다.

### 플러그인 인터페이스

```ts
export interface SSGPlugin {
  beforeRequestHook?: BeforeRequestHook | BeforeRequestHook[]
  afterResponseHook?: AfterResponseHook | AfterResponseHook[]
  afterGenerateHook?: AfterGenerateHook | AfterGenerateHook[]
}
```

### 기본 플러그인 예

GET 요청만 필터링합니다.

```ts
const getOnlyPlugin: SSGPlugin = {
  beforeRequestHook: (req) => {
    if (req.method === 'GET') {
      return req
    }
    return false
  },
}
```

상태 코드로 필터링:

```ts
const statusFilterPlugin: SSGPlugin = {
  afterResponseHook: (res) => {
    if (res.status === 200 || res.status === 500) {
      return res
    }
    return false
  },
}
```

로그 생성 파일:

```ts
const logFilesPlugin: SSGPlugin = {
  afterGenerateHook: (result) => {
    if (result.files) {
      result.files.forEach((file) => console.log(file))
    }
  },
}
```

### 고급 플러그인 예

다음은 `sitemap.xml` 파일을 생성하는 사이트맵 플러그인을 만드는 예입니다.

```ts
// 플러그인.ts
import fs from 'node:fs/promises'
import path from 'node:path'
import type { SSGPlugin } from 'hono/ssg'
import { DEFAULT_OUTPUT_DIR } from 'hono/ssg'

export const sitemapPlugin = (baseURL: string): SSGPlugin => {
  return {
    afterGenerateHook: (result, fsModule, options) => {
      const outputDir = options?.dir ?? DEFAULT_OUTPUT_DIR
      const filePath = path.join(outputDir, '사이트맵.xml')
      const urls = result.files.map((file) =>
        new URL(file, baseURL).toString()
      )
      const siteMapText = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `<url><loc>${url}</loc></url>`).join('\n')}
</urlset>`
      fsModule.writeFile(filePath, siteMapText)
    },
  }
}
```

플러그인 적용:

```ts
import app from './index'
import { toSSG } from 'hono/ssg'
import { sitemapPlugin } from './plugins'

toSSG(app, fs, {
  plugins: [
    getOnlyPlugin,
    statusFilterPlugin,
    logFilesPlugin,
    sitemapPlugin('https://example.com'),
  ],
})
```
