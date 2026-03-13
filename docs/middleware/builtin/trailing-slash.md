# 후행 슬래시 미들웨어

이 미들웨어는 GET 요청의 URL에서 후행 슬래시를 처리합니다.

`appendTrailingSlash`는 콘텐츠를 찾을 수 없는 경우 후행 슬래시를 추가한 URL을 리디렉션합니다. 또한 `trimTrailingSlash`는 후행 슬래시를 제거합니다.

## 가져오기

```ts
import { Hono } from 'hono'
import {
  appendTrailingSlash,
  trimTrailingSlash,
} from 'hono/trailing-slash'
```

## 사용법

`/about/me`의 GET 요청을 `/about/me/`로 리디렉션하는 예입니다.

```ts
import { Hono } from 'hono'
import { appendTrailingSlash } from 'hono/trailing-slash'

const app = new Hono({ strict: true })

app.use(appendTrailingSlash())
app.get('/about/me/', (c) => c.text('후행 슬래시 포함'))
```

`/about/me/`의 GET 요청을 `/about/me`로 리디렉션하는 예입니다.

```ts
import { Hono } from 'hono'
import { trimTrailingSlash } from 'hono/trailing-slash'

const app = new Hono({ strict: true })

app.use(trimTrailingSlash())
app.get('/about/me', (c) => c.text('후행 슬래시 없이'))
```

## 옵션

### <Badge type="info" text="optional" /> 항상리디렉션: `boolean`

기본적으로 후행 슬래시 미들웨어는 응답 상태가 `404`인 경우에만 리디렉션됩니다. `alwaysRedirect`가 `true`로 설정되면 미들웨어는 핸들러를 실행하기 전에 리디렉션됩니다. 이는 기본 동작이 작동하지 않는 와일드카드 경로(`*`)에 유용합니다.

```ts
const app = new Hono()

app.use(trimTrailingSlash({ alwaysRedirect: true }))
app.get('/my-path/*', (c) => c.text('와일드카드 경로'))
```

이 옵션은 `trimTrailingSlash` 및 `appendTrailingSlash` 모두에 사용할 수 있습니다.

## 메모

요청 방식이 `GET`, 응답 상태가 `404`일 때 활성화됩니다.
