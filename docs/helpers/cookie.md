# 쿠키 도우미

쿠키 도우미는 쿠키를 관리하기 위한 쉬운 인터페이스를 제공하여 개발자가 쿠키를 원활하게 설정, 구문 분석 및 삭제할 수 있도록 합니다.

## 가져오기

```ts
import { Hono } from 'hono'
import {
  deleteCookie,
  getCookie,
  getSignedCookie,
  setCookie,
  setSignedCookie,
  generateCookie,
  generateSignedCookie,
} from 'hono/cookie'
```

## 사용법

### 일반 쿠키

```ts
app.get('/cookie', (c) => {
  setCookie(c, 'cookie_name', 'cookie_value')
  const yummyCookie = getCookie(c, 'cookie_name')
  deleteCookie(c, 'cookie_name')
  const allCookies = getCookie(c)
  // ...
})
```

### 서명된 쿠키

**참고**: 서명된 쿠키를 설정하고 검색하면 HMAC SHA-256 서명을 생성하는 데 사용되는 WebCrypto API의 비동기 특성으로 인해 Promise가 반환됩니다.

```ts
app.get('/signed-cookie', (c) => {
  const secret = 'secret' // make sure it's a large enough string to be secure

  await setSignedCookie(c, 'cookie_name0', 'cookie_value', secret)
  const fortuneCookie = await getSignedCookie(
    c,
    secret,
    'cookie_name0'
  )
  deleteCookie(c, 'cookie_name0')
  // `getSignedCookie`는 서명이 변조되었거나 유효하지 않은 경우 지정된 쿠키에 대해 `false`를 반환합니다.
  const allSignedCookies = await getSignedCookie(c, secret)
  // ...
})
```

### 쿠키 생성

`generateCookie` 및 `generateSignedCookie` 함수를 사용하면 응답 헤더에 쿠키 문자열을 설정하지 않고 직접 쿠키 문자열을 만들 수 있습니다.

#### `generateCookie`

```ts
// 기본 쿠키 생성
const cookie = generateCookie('delicious_cookie', 'macha')
// 반환: 'delicious_cookie=macha; 경로=/'

// 옵션이 있는 쿠키
const cookie = generateCookie('delicious_cookie', 'macha', {
  path: '/',
  secure: true,
  httpOnly: true,
  domain: 'example.com',
})
```

#### `generateSignedCookie`

```ts
// 기본 서명된 쿠키 생성
const signedCookie = await generateSignedCookie(
  'delicious_cookie',
  'macha',
  '비밀 초콜릿 칩'
)

// 옵션이 포함된 서명된 쿠키
const signedCookie = await generateSignedCookie(
  'delicious_cookie',
  'macha',
  '비밀 초콜릿 칩',
  {
    path: '/',
    secure: true,
    httpOnly: true,
  }
)
```

**참고**: `setCookie` 및 `setSignedCookie`와 달리 이 함수는 쿠키 문자열만 생성합니다. 필요한 경우 헤더에서 수동으로 설정해야 합니다.

## 옵션

### `setCookie` & `setSignedCookie`

- 도메인: `string`
- 만료: `Date`
- httpOnly: `boolean`
- maxAge: `number`
- 경로: `string`
- 보안: `boolean`
- 동일한 사이트: `'Strict'` | `'Lax'` | `'None'`
- 우선순위: `'Low' | 'Medium' | 'High'`
- 접두사: `secure` | `'host'`
- 분할됨: `boolean`

예:

```ts
// 일반 쿠키
setCookie(c, 'great_cookie', 'banana', {
  path: '/',
  secure: true,
  domain: 'example.com',
  httpOnly: true,
  maxAge: 1000,
  expires: new Date(Date.UTC(2000, 11, 24, 10, 30, 59, 900)),
  sameSite: 'Strict',
})

// 서명된 쿠키
await setSignedCookie(
  c,
  'fortune_cookie',
  'lots-of-money',
  '비밀 성분',
  {
    path: '/',
    secure: true,
    domain: 'example.com',
    httpOnly: true,
    maxAge: 1000,
    expires: new Date(Date.UTC(2000, 11, 24, 10, 30, 59, 900)),
    sameSite: 'Strict',
  }
)
```

### `deleteCookie`

- 경로: `string`
- 보안: `boolean`
- 도메인: `string`

예:

```ts
deleteCookie(c, 'banana', {
  path: '/',
  secure: true,
  domain: 'example.com',
})
```

`deleteCookie`는 삭제된 값을 반환합니다.

```ts
const deletedCookie = deleteCookie(c, 'delicious_cookie')
```

## `__Secure-` 및 `__Host-` 접두사

쿠키 도우미는 쿠키 이름에 대해 `__Secure-` 및 `__Host-` 접두사를 지원합니다.

쿠키 이름에 접두사가 있는지 확인하려면 접두사 옵션을 지정하십시오.

```ts
const securePrefixCookie = getCookie(c, 'yummy_cookie', 'secure')
const hostPrefixCookie = getCookie(c, 'yummy_cookie', 'host')

const securePrefixSignedCookie = await getSignedCookie(
  c,
  secret,
  'fortune_cookie',
  'secure'
)
const hostPrefixSignedCookie = await getSignedCookie(
  c,
  secret,
  'fortune_cookie',
  'host'
)
```

또한, 쿠키를 설정할 때 접두사를 지정하려면 접두사 옵션에 값을 지정하세요.

```ts
setCookie(c, 'delicious_cookie', 'macha', {
  prefix: 'secure', // or `host`
})

await setSignedCookie(
  c,
  'delicious_cookie',
  'macha',
  '비밀초코칩',
  {
    prefix: 'secure', // or `host`
  }
)
```

## 모범 사례 따르기

새로운 쿠키 RFC(a.k.a cookie-bis) 및 CHIPS에는 개발자가 따라야 하는 쿠키 설정에 대한 몇 가지 모범 사례가 포함되어 있습니다.

- [RFC6265bis-13](https://datatracker.ietf.org/doc/html/draft-ietf-httpbis-rfc6265bis-13)
  - `Max-Age`/`Expires` 제한
  - `__Host-`/`__Secure-` 접두사 제한
- [CHIPS-01](https://www.ietf.org/archive/id/draft-cutler-httpbis-partitioned-cookies-01.html)
  - `Partitioned` 제한

Hono는 모범 사례를 따르고 있습니다.
쿠키 도우미는 다음 조건에서 쿠키를 구문 분석할 때 `Error`를 발생시킵니다.

- 쿠키 이름이 `__Secure-`로 시작하지만 `secure` 옵션이 설정되지 않았습니다.
- 쿠키 이름이 `__Host-`로 시작하지만 `secure` 옵션이 설정되지 않았습니다.
- 쿠키 이름은 `__Host-`로 시작하지만 `path`는 `/`가 아닙니다.
- 쿠키 이름은 `__Host-`로 시작하지만 `domain`가 설정되어 있습니다.
- `maxAge` 옵션 값이 400일보다 큽니다.
- `expires` 옵션 값은 현재 시간보다 400일 이후입니다.
