# 도우미 수락

Accepts Helper는 요청의 Accept 헤더를 처리하는 데 도움을 줍니다.

## 가져오기

```ts
import { Hono } from 'hono'
import { accepts } from 'hono/accepts'
```

## `accepts()`

`accepts()` 함수는 Accept-Encoding 및 Accept-Language와 같은 Accept 헤더를 살펴보고 적절한 값을 반환합니다.

```ts
import { accepts } from 'hono/accepts'

app.get('/', (c) => {
  const accept = accepts(c, {
    header: 'Accept-Language',
    supports: ['en', 'ja', 'zh'],
    default: 'en',
  })
  return c.json({ lang: accept })
})
```

### `AcceptHeader` 유형

`AcceptHeader` 유형의 정의는 다음과 같습니다.

```ts
export type AcceptHeader =
  | 'Accept'
  | 'Accept-Charset'
  | 'Accept-Encoding'
  | 'Accept-Language'
  | 'Accept-Patch'
  | 'Accept-Post'
  | 'Accept-Ranges'
```

## 옵션

### <Badge type="danger" text="required" /> 헤더: `AcceptHeader`

대상 승인 헤더입니다.

### <Badge type="danger" text="required" />는 다음을 지원합니다: `string[]`

애플리케이션이 지원하는 헤더 값입니다.

### <Badge type="danger" text="required" /> 기본값: `string`

기본값입니다.

### <Badge type="info" text="optional" /> 일치: `(accepts: Accept[], config: acceptsConfig) => string`

사용자 정의 일치 기능.
