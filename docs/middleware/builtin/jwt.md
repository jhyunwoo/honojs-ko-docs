# JWT 인증 미들웨어

JWT 인증 미들웨어는 JWT로 토큰을 확인하여 인증을 제공합니다.
`cookie` 옵션이 설정되지 않은 경우 미들웨어는 `Authorization` 헤더를 확인합니다. `headerName` 옵션을 사용하여 헤더 이름을 사용자 정의할 수 있습니다.

:::info
클라이언트에서 보낸 Authorization 헤더에는 지정된 체계가 있어야 합니다.

예: `Bearer my.token.value` 또는 `Basic my.token.value`
:::

## 가져오기

```ts
import { Hono } from 'hono'
import { jwt } from 'hono/jwt'
import type { JwtVariables } from 'hono/jwt'
```

## 사용법

```ts
// `c.get('jwtPayload')`를 추론할 변수 유형을 지정합니다.
type Variables = JwtVariables

const app = new Hono<{ Variables: Variables }>()

app.use(
  '/auth/*',
  jwt({
    secret: 'it-is-very-secret',
    alg: 'HS256',
  })
)

app.get('/auth/page', (c) => {
  return c.text('당신은 권한이 있습니다')
})
```

페이로드 가져오기:

```ts
const app = new Hono()

app.use(
  '/auth/*',
  jwt({
    secret: 'it-is-very-secret',
    alg: 'HS256',
    issuer: 'my-trusted-issuer',
  })
)

app.get('/auth/page', (c) => {
  const payload = c.get('jwtPayload')
  return c.json(payload) // 예: { "sub": "1234567890", "name": "John Doe", "iat": 1516239022, "iss": "my-trusted-issuer" }
})
```

::: tip

`jwt()`는 미들웨어 기능일 뿐입니다. 환경 변수(예: `c.env.JWT_SECRET`)를 사용하려면 다음과 같이 사용할 수 있습니다.

```js
app.use('/auth/*', (c, 다음) => {
  const jwtMiddleware = jwt({
    secret: c.env.JWT_SECRET,
    alg: 'HS256',
  })
  return jwtMiddleware(c, next)
})
```

:::

## 옵션

### <Badge type="danger" text="required" /> secret: `string`

비밀 키의 값입니다.

### <Badge type="danger" text="required" /> 정렬: `string`

검증에 사용되는 알고리즘 유형입니다.

사용 가능한 유형은 `HS256` | `HS384` | `HS512` | `RS256` | `RS384` | `RS512` | `PS256` | `PS384` | `PS512` | `ES256` | `ES384` | `ES512` | `EdDSA`.

### <Badge type="info" text="optional" /> 쿠키: `string`

이 값이 설정되면 해당 값을 키로 사용하여 쿠키 헤더에서 값이 검색된 다음 토큰으로 유효성이 검사됩니다.

### <Badge type="info" text="optional" /> 헤더 이름: `string`

JWT 토큰을 찾기 위한 헤더의 이름입니다. 기본값은 `Authorization`입니다.

```ts
app.use(
  '/auth/*',
  jwt({
    secret: 'it-is-very-secret',
    alg: 'HS256',
    headerName: 'x-custom-auth-header',
  })
)
```

### <Badge type="info" text="optional" /> verifyOptions: `VerifyOptions`

토큰 확인을 제어하는 ​​옵션입니다.

#### <Badge type="info" text="optional" /> verifyOptions.iss: `string | RegExp`

토큰 확인에 사용되는 예상 발급자입니다. 이것이 설정되지 않으면 `iss` 클레임이 확인되지 **않습니다**.

#### <Badge type="info" text="optional" /> verifyOptions.nbf: `boolean`

`nbf`(이전 아님) 클레임이 있는 경우 확인되며 이는 `true`로 설정됩니다. 기본값은 `true`입니다.

#### <Badge type="info" text="optional" /> verifyOptions.iat: `boolean`

`iat`(발행 위치) 클레임이 있는 경우 확인되며 이는 `true`로 설정됩니다. 기본값은 `true`입니다.

#### <Badge type="info" text="optional" /> verifyOptions.exp: `boolean`

`exp`(만료 시간) 클레임이 있는 경우 확인되며 이는 `true`로 설정됩니다. 기본값은 `true`입니다.
