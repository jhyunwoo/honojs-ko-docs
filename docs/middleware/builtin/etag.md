# ETag 미들웨어

이 미들웨어를 사용하면 ETag 헤더를 쉽게 추가할 수 있습니다.

## 가져오기

```ts
import { Hono } from 'hono'
import { etag } from 'hono/etag'
```

## 사용법

```ts
const app = new Hono()

app.use('/etag/*', etag())
app.get('/etag/abc', (c) => {
  return c.text('Hono 멋지네요')
})
```

## 유지된 헤더

304 응답에는 동등한 200 OK 응답으로 전송되었을 헤더가 포함되어야 합니다. 기본 헤더는 Cache-Control, Content-Location, Date, ETag, Expires 및 Vary입니다.

전송되는 헤더를 추가하려면 `retainedHeaders` 옵션과 기본 헤더를 포함하는 `RETAINED_304_HEADERS` 문자열 배열 변수를 사용할 수 있습니다.

```ts
import { etag, RETAINED_304_HEADERS } from 'hono/etag'

// ...

app.use(
  '/etag/*',
  etag({
    retainedHeaders: ['x-message', ...RETAINED_304_HEADERS],
  })
)
```

## 옵션

### <Badge type="info" text="optional" /> 약함: `boolean`

[약한 검증](https://developer.mozilla.org/en-US/docs/Web/HTTP/Conditional_requests#weak_validation) 사용 여부를 정의합니다. `true`가 설정된 경우 `w/`가 값의 접두사에 추가됩니다. 기본값은 `false`입니다.

### <Badge type="info" text="optional" /> 보유헤더: `string[]`

304 응답에 유지하려는 헤더입니다.

### <Badge type="info" text="optional" /> 생성다이제스트: `(body: Uint8Array) => ArrayBuffer | Promise<ArrayBuffer>`

사용자 정의 다이제스트 생성 기능. 기본적으로 `SHA-1`를 사용합니다. 이 함수는 응답 본문을 `Uint8Array`로 사용하여 호출되며 `ArrayBuffer` 또는 Promise로 해시를 반환해야 합니다.
