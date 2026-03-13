# CSRF 보호

이 미들웨어는 `Origin` 헤더와 `Sec-Fetch-Site` 헤더를 모두 확인하여 CSRF 공격으로부터 보호합니다. 유효성 검사 중 하나라도 통과하면 요청이 허용됩니다.

미들웨어는 다음과 같은 요청만 검증합니다.

- 안전하지 않은 HTTP 메소드 사용(GET, HEAD 또는 OPTIONS 아님)
- HTML 양식(`application/x-www-form-urlencoded`, `multipart/form-data` 또는 `text/plain`)으로 보낼 수 있는 콘텐츠 유형이 있습니다.

`Origin` 헤더를 전송하지 않는 이전 브라우저나 이러한 헤더를 제거하기 위해 역방향 프록시를 사용하는 환경에서는 제대로 작동하지 않을 수 있습니다. 이러한 환경에서는 다른 CSRF 토큰 방법을 사용하세요.

## 가져오기

```ts
import { Hono } from 'hono'
import { csrf } from 'hono/csrf'
```

## 사용법

```ts
const app = new Hono()

// 기본값: 원본 및 sec-fetch-site 검증 모두
app.use(csrf())

// 특정 출처 허용
app.use(csrf({ origin: 'https://myapp.example.com' }))

// 여러 출처 허용
app.use(
  csrf({
    origin: [
      'https://myapp.example.com',
      'https://development.myapp.example.com',
    ],
  })
)

// 특정 sec-fetch-site 값 허용
app.use(csrf({ secFetchSite: 'same-origin' }))
app.use(csrf({ secFetchSite: ['same-origin', 'none'] }))

// 동적 출처 검증
// `$`와 일치하는지 확인하기 위해 프로토콜을 검증하는 것이 좋습니다.
// 정방향 일치를 *절대* 수행해서는 안 됩니다.
app.use(
  '*',
  csrf({
    origin: (origin) =>
      /https:\/\/(\w+\.)?myapp\.example\.com$/.test(origin),
  })
)

// 동적 sec-fetch-사이트 검증
app.use(
  csrf({
    secFetchSite: (secFetchSite, c) => {
      // 항상 동일 출처 허용
      if (secFetchSite === 'same-origin') return true
      // 웹훅 엔드포인트에 대한 교차 사이트 허용
      if (
        secFetchSite === 'cross-site' &&
        c.req.path.startsWith('/webhook/')
      ) {
        return true
      }
      return false
    },
  })
)
```

## 옵션

### <Badge type="info" text="optional" /> origin: `string` | `string[]` | `Function`

CSRF 보호에 허용되는 원본을 지정합니다.

- **`string`**: 단일 허용 원본(예: `'https://example.com'`)
- **`string[]`**: 허용된 출처의 배열
- **`Function`**: 유연한 원본 검증 및 우회 논리를 위한 사용자 정의 핸들러 `(origin: string, context: Context) => boolean`

**기본값**: 요청 URL과 동일한 출처만

함수 핸들러는 요청의 `Origin` 헤더 값과 요청 컨텍스트를 수신하여 경로, 헤더 또는 기타 컨텍스트 데이터와 같은 요청 속성을 기반으로 동적 유효성 검사를 허용합니다.

### <Badge type="info" text="optional" /> secFetchSite: `string` | `string[]` | `Function`

[메타데이터 가져오기](https://web.dev/articles/fetch-metadata)를 사용하여 CSRF 보호에 허용되는 Sec-Fetch-Site 헤더 값을 지정합니다.

- **`string`**: 허용되는 단일 값(예: `'same-origin'`)
- **`string[]`**: 허용되는 값의 배열(예: `['same-origin', 'none']`)
- **`Function`**: 유연한 검증을 위한 사용자 정의 핸들러 `(secFetchSite: string, context: Context) => boolean`

**기본값**: `'same-origin'`만 허용합니다.

표준 Sec-Fetch-Site 값:

- `same-origin`: 동일한 출처의 요청
- `same-site`: 동일한 사이트(다른 하위 도메인)에서 요청
- `cross-site`: 다른 사이트에서 요청
- `none`: 웹페이지에서 요청하지 않음(예: 브라우저 주소 표시줄, 북마크)

함수 핸들러는 요청의 `Sec-Fetch-Site` 헤더 값과 요청 컨텍스트를 수신하여 요청 속성을 기반으로 동적 유효성 검사를 활성화합니다.
