# 베어러 인증 미들웨어

Bearer 인증 미들웨어는 요청 헤더에서 API 토큰을 확인하여 인증을 제공합니다.
엔드포인트에 액세스하는 HTTP 클라이언트는 `Bearer {token}`를 헤더 값으로 사용하여 `Authorization` 헤더를 추가합니다.

터미널에서 `curl`를 사용하면 다음과 같습니다.

```sh
curl -H 'Authorization: Bearer honoiscool' http://localhost:8787/auth/page
```

## 가져오기

```ts
import { Hono } from 'hono'
import { bearerAuth } from 'hono/bearer-auth'
```

## 사용법

> [!메모]
> `token`는 정규식 `/[A-Za-z0-9._~+/-]+=*/`와 일치해야 합니다. 그렇지 않으면 400 오류가 반환됩니다. 특히 이 정규식은 URL 안전 Base64 및 표준 Base64 인코딩 JWT를 모두 수용합니다. 이 미들웨어에서는 전달자 토큰이 JWT일 필요는 없으며 단지 위의 정규식과 일치하면 됩니다.

```ts
const app = new Hono()

const token = 'honoiscool'

app.use('/api/*', bearerAuth({ token }))

app.get('/api/page', (c) => {
  return c.json({ message: 'You are authorized' })
})
```

특정 경로 + 방법으로 제한하려면 다음을 수행하세요.

```ts
const app = new Hono()

const token = 'honoiscool'

app.get('/api/page', (c) => {
  return c.json({ message: '게시물 읽기' })
})

app.post('/api/page', bearerAuth({ token }), (c) => {
  return c.json({ message: '게시물을 작성했습니다!' }, 201)
})
```

여러 토큰을 구현하려면(예: 모든 유효한 토큰을 읽을 수 있지만 생성/업데이트/삭제는 권한 있는 토큰으로 제한됩니다):

```ts
const app = new Hono()

const readToken = 'read'
const privilegedToken = 'read+write'
const privilegedMethods = ['POST', 'PUT', 'PATCH', 'DELETE']

app.on('GET', '/api/page/*', async (c, next) => {
  // 유효한 토큰 목록
  const bearer = bearerAuth({ token: [readToken, privilegedToken] })
  return bearer(c, next)
})
app.on(privilegedMethods, '/api/page/*', async (c, next) => {
  // 유효한 단일 권한 토큰
  const bearer = bearerAuth({ token: privilegedToken })
  return bearer(c, next)
})

// GET, POST 등에 대한 핸들러를 정의합니다.
```

토큰 값을 직접 확인하려면 `verifyToken` 옵션을 지정하세요. `true`를 반환하면 수락되었음을 의미합니다.

```ts
const app = new Hono()

app.use(
  '/auth-verify-token/*',
  bearerAuth({
    verifyToken: async (token, c) => {
      return token === 'dynamic-token'
    },
  })
)
```

## 옵션

### <Badge type="danger" text="required" /> token: `string` | `string[]`

들어오는 전달자 토큰의 유효성을 검사할 문자열입니다.

### <Badge type="info" text="optional" /> 영역: `string`

반환된 WWW-인증 챌린지 헤더의 일부인 영역의 도메인 이름입니다. 기본값은 `""`입니다.
더보기: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/WWW-Authenticate#directives

### <Badge type="info" text="optional" /> 접두사: `string`

Authorization 헤더 값의 접두사(또는 `schema`라고도 함)입니다. 기본값은 `"Bearer"`입니다.

### <Badge type="info" text="optional" /> 헤더 이름: `string`

헤더 이름입니다. 기본값은 `Authorization`입니다.

### <Badge type="info" text="optional" /> 해시 함수: `Function`

인증 토큰의 안전한 비교를 위해 해싱을 처리하는 기능입니다.

### <Badge type="info" text="optional" /> verifyToken: `(token: string, c: Context) => boolean | Promise<boolean>`

토큰을 검증하는 기능입니다.

### <Badge type="info" text="optional" /> noAuthentication헤더: `object`

요청에 인증 헤더가 없을 때 오류 응답을 사용자 정의합니다.

- `wwwAuthenticateHeader`: `string | object | MessageFunction` - WWW-인증 헤더 값을 사용자 정의합니다.
- `message`: `string | object | MessageFunction` - 응답 본문에 대한 사용자 정의 메시지입니다.

`MessageFunction`는 `(c: Context) => string | object | Promise<string | object>`입니다.

### <Badge type="info" text="optional" /> 유효하지 않은 인증 헤더: `object`

인증 헤더 형식이 유효하지 않은 경우 오류 응답을 사용자 정의합니다.

- `wwwAuthenticateHeader`: `string | object | MessageFunction` - WWW-인증 헤더 값을 사용자 정의합니다.
- `message`: `string | object | MessageFunction` - 응답 본문에 대한 사용자 정의 메시지입니다.

### <Badge type="info" text="optional" /> invalidTokenMessage: `object`

토큰이 유효하지 않은 경우 오류 응답을 사용자 정의합니다.

- `wwwAuthenticateHeader`: `string | object | MessageFunction` - WWW-인증 헤더 값을 사용자 정의합니다.
- `message`: `string | object | MessageFunction` - 응답 본문에 대한 사용자 정의 메시지입니다.
