# JWT 인증 도우미

이 도우미는 JSON 웹 토큰(JWT)을 인코딩, 디코딩, 서명 및 확인하는 기능을 제공합니다. JWT는 일반적으로 웹 애플리케이션에서 인증 및 권한 부여 목적으로 사용됩니다. 이 도우미는 다양한 암호화 알고리즘을 지원하는 강력한 JWT 기능을 제공합니다.

## 가져오기

이 도우미를 사용하려면 다음과 같이 가져올 수 있습니다.

```ts
import { decode, sign, verify } from 'hono/jwt'
```

::: info
[JWT 미들웨어](/docs/middleware/builtin/jwt)도 `hono/jwt`에서 `jwt` 기능을 가져옵니다.
:::

## `sign()`

이 함수는 페이로드를 인코딩하고 지정된 알고리즘과 비밀을 사용하여 서명하여 JWT 토큰을 생성합니다.

```ts
sign(
  payload: unknown,
  secret: string,
  alg?: 'HS256';

): Promise<string>;
```

### 예

```ts
import { sign } from 'hono/jwt'

const payload = {
  sub: 'user123',
  role: 'admin',
  exp: Math.floor(Date.now() / 1000) + 60 * 5, // Token expires in 5 minutes
}
const secret = 'mySecretKey'
const token = await sign(payload, secret)
```

### 옵션

<br/>

#### <Badge type="danger" text="required" /> 페이로드: `unknown`

서명할 JWT 페이로드입니다. [페이로드 유효성 검사](#payload-validation)와 같은 다른 클레임을 포함할 수 있습니다.

#### <Badge type="danger" text="required" /> secret: `string`

JWT 확인 또는 서명에 사용되는 비밀 키입니다.

#### <Badge type="info" text="optional" /> alg: [알고리즘 유형](#supported-algorithmtypes)

JWT 서명 또는 확인에 사용되는 알고리즘입니다. 기본값은 HS256입니다.

## `verify()`

이 기능은 JWT 토큰이 정품이고 여전히 유효한지 확인합니다. 토큰이 변경되지 않았는지 확인하고 [페이로드 유효성 검사](#payload-validation)를 추가한 경우에만 유효성을 확인합니다.

```ts
verify(
  token: string,
  secret: string,
  alg: 'HS256';
  issuer?: string | RegExp;
): Promise<any>;

```

### 예

```ts
import { verify } from 'hono/jwt'

const tokenToVerify = 'token'
const secretKey = 'mySecretKey'

const decodedPayload = await verify(tokenToVerify, secretKey, 'HS256')
console.log(decodedPayload)
```

### 옵션

<br/>

#### <Badge type="danger" text="required" /> token: `string`

검증할 JWT 토큰입니다.

#### <Badge type="danger" text="required" /> secret: `string`

JWT 확인 또는 서명에 사용되는 비밀 키입니다.

#### <Badge type="danger" text="required" /> alg: [알고리즘 유형](#supported-algorithmtypes)

JWT 서명 또는 확인에 사용되는 알고리즘입니다.

#### <Badge type="info" text="optional" /> 발급자: `string | RegExp`

JWT 확인에 사용되는 예상 발급자입니다.

## `decode()`

이 함수는 서명 확인을 수행하지 않고 JWT 토큰을 디코딩합니다. 토큰에서 헤더와 페이로드를 추출하고 반환합니다.

```ts
decode(token: string): { header: any; payload: any };
```

### 예

```ts
import { decode } from 'hono/jwt'

// JWT 토큰 디코딩
const tokenToDecode =
  'eyJhbGciOiAiSFMyNTYiLCAidHlwIjogIkpXVCJ9.eyJzdWIiOiAidXNlcjEyMyIsICJyb2xlIjogImFkbWluIn0.JxUwx6Ua1B0D1B0FtCrj72ok5cm1Pkmr_hL82sd7ELA'

const { header, payload } = decode(tokenToDecode)

console.log('Decoded Header:', header)
console.log('Decoded Payload:', payload)
```

### 옵션

<br/>

#### <Badge type="danger" text="required" /> token: `string`

디코딩할 JWT 토큰입니다.

> `decode` 기능을 사용하면 확인을 수행하지 않고 _**없이**_ JWT 토큰의 헤더와 페이로드를 검사할 수 있습니다. 이는 JWT 토큰에서 정보를 디버깅하거나 추출하는 데 유용할 수 있습니다.

## 페이로드 검증

JWT 토큰을 확인할 때 다음 페이로드 유효성 검사가 수행됩니다.

- `exp`: 토큰이 만료되지 않았는지 확인합니다.
- `nbf`: 토큰이 지정된 시간 이전에 사용되지 않는지 확인합니다.
- `iat`: 토큰이 향후 발행되지 않는지 확인합니다.
- `iss`: 토큰이 신뢰할 수 있는 발급자에 의해 발행되었는지 확인합니다.

확인 중에 이러한 검사를 수행하려는 경우 JWT 페이로드에 이러한 필드가 객체로 포함되어 있는지 확인하세요.

## 사용자 정의 오류 유형

또한 모듈은 JWT 관련 오류를 처리하기 위해 사용자 정의 오류 유형을 정의합니다.

- `JwtAlgorithmNotImplemented`: 요청된 JWT 알고리즘이 구현되지 않았음을 나타냅니다.
- `JwtTokenInvalid`: JWT 토큰이 유효하지 않음을 나타냅니다.
- `JwtTokenNotBefore`: 토큰이 유효한 날짜 이전에 사용되고 있음을 나타냅니다.
- `JwtTokenExpired`: 토큰이 만료되었음을 나타냅니다.
- `JwtTokenIssuedAt`: 토큰의 "iat" 클레임이 잘못되었음을 나타냅니다.
- `JwtTokenIssuer`: 토큰의 "iss" 클레임이 잘못되었음을 나타냅니다.
- `JwtTokenSignatureMismatched`: 토큰의 서명 불일치를 나타냅니다.

## 지원되는 알고리즘 유형

모듈은 다음 JWT 암호화 알고리즘을 지원합니다.

- `HS256`: SHA-256을 사용하는 HMAC
- `HS384`: SHA-384를 사용하는 HMAC
- `HS512`: SHA-512를 사용하는 HMAC
- `RS256`: SHA-256을 사용하는 RSASSA-PKCS1-v1_5
- `RS384`: SHA-384를 사용하는 RSASSA-PKCS1-v1_5
- `RS512`: SHA-512를 사용하는 RSASSA-PKCS1-v1_5
- `PS256`: SHA-256을 사용하는 RSASSA-PSS 및 SHA-256과 함께 MGF1
- `PS384`: SHA-386을 사용하는 RSASSA-PSS 및 SHA-386과 함께 MGF1
- `PS512`: SHA-512를 사용하는 RSASSA-PSS 및 SHA-512와 함께 MGF1
- `ES256`: P-256 및 SHA-256을 사용하는 ECDSA
- `ES384`: P-384 및 SHA-384를 사용하는 ECDSA
- `ES512`: P-521 및 SHA-512를 사용하는 ECDSA
- `EdDSA`: Ed25519를 사용하는 EdDSA
