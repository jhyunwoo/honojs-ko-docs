# JWK 인증 미들웨어

JWK 인증 미들웨어는 JWK(JSON 웹 키)를 사용하여 토큰을 확인하여 요청을 인증합니다. 지정된 경우 `Authorization` 헤더 및 기타 구성된 소스(예: 쿠키)를 확인합니다. 제공된 `keys`를 사용하여 토큰의 유효성을 검사하고, 지정된 경우 `jwks_uri`에서 키를 검색하며, `cookie` 옵션이 설정된 경우 쿠키에서 토큰 추출을 지원합니다.

## 이 미들웨어가 검증하는 것

각 토큰 `jwk()`에 대해 다음을 수행합니다.

- JWT 헤더 형식을 구문 분석하고 유효성을 검사합니다.
- `kid` 헤더가 필요하며 `kid`로 일치하는 키를 찾습니다.
- 대칭 알고리즘(`HS256`, `HS384`, `HS512`)을 거부합니다.
- 구성된 `alg` 허용 목록에 헤더 `alg`가 포함되어야 합니다.
- 일치하는 JWK에 `alg` 필드가 있는 경우 JWT 헤더 `alg`와 일치해야 합니다.
- 일치하는 키로 토큰 서명을 확인합니다.
- 기본적으로 시간 기반 클레임(`nbf`, `exp` 및 `iat`)을 검증합니다.

선택적 클레임 유효성 검사는 `verification` 옵션을 사용하여 구성할 수 있습니다.

- `iss`: 제공되면 발급자를 검증합니다.
- `aud`: 제공된 경우 청중의 유효성을 검사합니다.

위 항목 외에 추가 토큰 확인이 필요한 경우(예: 사용자 정의 애플리케이션 수준 권한 부여 규칙) `jwk()` 뒤에 자체 미들웨어에 추가하세요.

:::info
클라이언트에서 보낸 Authorization 헤더에는 지정된 체계가 있어야 합니다.

예: `Bearer my.token.value` 또는 `Basic my.token.value`
:::

## 가져오기

```ts
import { Hono } from 'hono'
import { jwk } from 'hono/jwk'
import { verifyWithJwks } from 'hono/jwt'
```

## 사용법

```ts
const app = new Hono()

app.use(
  '/auth/*',
  jwk({
    jwks_uri: `https://${backendServer}/.well-known/jwks.json`,
    alg: ['RS256'],
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
  jwk({
    jwks_uri: `https://${backendServer}/.well-known/jwks.json`,
    alg: ['RS256'],
  })
)

app.get('/auth/page', (c) => {
  const payload = c.get('jwtPayload')
  return c.json(payload) // 예: { "sub": "1234567890", "name": "John Doe", "iat": 1516239022 }
})
```

익명 액세스:

```ts
const app = new Hono()

app.use(
  '/auth/*',
  jwk({
    jwks_uri: (c) =>
      `https://${c.env.authServer}/.well-known/jwks.json`,
    alg: ['RS256'],
    allow_anon: true,
  })
)

app.get('/auth/page', (c) => {
  const payload = c.get('jwtPayload')
  return c.json(payload ?? { message: 'hello anon' })
})
```

## 미들웨어 외부에서 `verifyWithJwks` 사용

`verifyWithJwks` 유틸리티 함수는 SvelteKit SSR 페이지 또는 기타 서버 측 환경과 같이 Hono의 미들웨어 컨텍스트 외부에서 JWT 토큰을 확인하는 데 사용할 수 있습니다.

```ts
const id_payload = await verifyWithJwks(
  id_token,
  {
    jwks_uri: 'https://your-auth-server/.well-known/jwks.json',
    allowedAlgorithms: ['RS256'],
  },
  {
    cf: { cacheEverything: true, cacheTtl: 3600 },
  }
)
```

## JWKS 가져오기 요청 옵션 구성

JWKS가 `jwks_uri`에서 검색되는 방법을 구성하려면 가져오기 요청 옵션을 `jwk()`의 두 번째 인수로 전달하세요.

이 인수는 `RequestInit`이며 JWKS 가져오기 요청에만 사용됩니다.

```ts
const app = new Hono()

app.use(
  '/auth/*',
  jwk(
    {
      jwks_uri: `https://${backendServer}/.well-known/jwks.json`,
      alg: ['RS256'],
    },
    {
      headers: {
        Authorization: 'Bearer TOKEN',
      },
    }
  )
)
```

## 옵션

### <Badge type="danger" text="required" /> 정렬: `AsymmetricAlgorithm[]`

토큰 확인에 사용되는 허용되는 비대칭 알고리즘의 배열입니다.

사용 가능한 유형은 `RS256` | `RS384` | `RS512` | `PS256` | `PS384` | `PS512` | `ES256` | `ES384` | `ES512` | `EdDSA`.

### <Badge type="info" text="optional" /> 키: `HonoJsonWebKey[] | (c: Context) => Promise<HonoJsonWebKey[]>`

공개 키의 값 또는 이를 반환하는 함수. 함수는 Context 객체를 받습니다.

### <Badge type="info" text="optional" /> jwks_uri: `string` | `(c: Context) => Promise<string>`

이 값이 설정된 경우 제공된 `keys` 옵션에 추가되는 `keys`가 포함된 JSON 응답을 예상하여 이 URI에서 JWK를 가져오려고 시도합니다. 또한 콜백 함수를 전달하여 컨텍스트를 사용하여 JWKS URI를 동적으로 결정할 수도 있습니다.

### <Badge type="info" text="optional" /> 허용_anon: `boolean`

이 값을 `true`로 설정하면 유효한 토큰이 없는 요청이 미들웨어를 통과하도록 허용됩니다. 요청이 인증되었는지 확인하려면 `c.get('jwtPayload')`를 사용하세요. 기본값은 `false`입니다.

### <Badge type="info" text="optional" /> 쿠키: `string`

이 값이 설정되면 해당 값을 키로 사용하여 쿠키 헤더에서 값이 검색된 다음 토큰으로 유효성이 검사됩니다.

### <Badge type="info" text="optional" /> 헤더 이름: `string`

JWT 토큰을 찾기 위한 헤더의 이름입니다. 기본값은 `Authorization`입니다.

### <Badge type="info" text="optional" /> 확인: `VerifyOptions`

서명 확인 외에 청구 확인 동작을 구성합니다.

- `iss`: 예상 발급자.
- `aud`: 예상 청중.
- `exp`, `nbf`, `iat`: 기본적으로 활성화되어 있으며 필요한 경우 비활성화할 수 있습니다.
