# 기본 인증 미들웨어

이 미들웨어는 지정된 경로에 기본 인증을 적용할 수 있습니다.
Cloudflare Workers 또는 다른 플랫폼을 사용하여 기본 인증을 구현하는 것은 생각보다 복잡하지만 이 미들웨어를 사용하면 매우 쉽습니다.

기본 인증 체계가 내부적으로 작동하는 방식에 대한 자세한 내용은 [MDN 문서](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication#basic_authentication_scheme)를 참조하세요.

## 가져오기

```ts
import { Hono } from 'hono'
import { basicAuth } from 'hono/basic-auth'
```

## 사용법

```ts
const app = new Hono()

app.use(
  '/auth/*',
  basicAuth({
    username: 'hono',
    password: 'acoolproject',
  })
)

app.get('/auth/page', (c) => {
  return c.text('당신은 권한이 있습니다')
})
```

특정 경로 + 방법으로 제한하려면 다음을 수행하세요.

```ts
const app = new Hono()

app.get('/auth/page', (c) => {
  return c.text('보는 페이지')
})

app.delete(
  '/auth/page',
  basicAuth({ username: 'hono', password: 'acoolproject' }),
  (c) => {
    return c.text('페이지가 삭제되었습니다.')
  }
)
```

사용자를 직접 확인하려면 `verifyUser` 옵션을 지정하세요. `true`를 반환하면 수락되었음을 의미합니다.

```ts
const app = new Hono()

app.use(
  basicAuth({
    verifyUser: (username, password, c) => {
      return (
        username === 'dynamic-user' && password === 'hono-password'
      )
    },
  })
)
```

## 옵션

### <Badge type="danger" text="required" /> username: `string`

인증하는 사용자의 사용자 이름입니다.

### <Badge type="danger" text="required" /> password: `string`

인증할 제공된 사용자 이름의 비밀번호 값입니다.

### <Badge type="info" text="optional" /> realm: `string`

반환된 WWW-인증 챌린지 헤더의 일부인 영역의 도메인 이름입니다. 기본값은 `"Secure Area"`입니다.
더보기: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/WWW-Authenticate#directives

### <Badge type="info" text="optional" /> 해시 함수: `Function`

비밀번호의 안전한 비교를 위해 해싱을 처리하는 기능입니다.

### <Badge type="info" text="optional" /> verifyUser: `(username: string, password: string, c: Context) => boolean | Promise<boolean>`

사용자를 확인하는 기능입니다.

### <Badge type="info" text="optional" /> 잘못된 사용자 메시지: `string | object | MessageFunction`

`MessageFunction`는 `(c: Context) => string | object | Promise<string | object>`입니다. 사용자가 유효하지 않은 경우 사용자 정의 메시지입니다.

### <Badge type="info" text="optional" /> onAuthSuccess: `(c: Context, username: string) => void | Promise<void>`

인증 성공 후 호출되는 콜백 함수입니다. 이를 통해 Authorization 헤더를 다시 구문 분석하지 않고도 컨텍스트 변수를 설정하거나 부작용을 수행할 수 있습니다.

```ts
app.use(
  '/auth/*',
  basicAuth({
    username: 'hono',
    password: 'acoolproject',
    onAuthSuccess: (c, 사용자 이름) => {
      c.set('username', username)
    },
  })
)

app.get('/auth/page', (c) => {
  const username = c.get('username')
  return c.text(`Hello, ${username}!`)
})
```

## 추가 옵션

### <Badge type="info" text="optional" /> ...사용자: `{ username: string, password: string }[]`

## 조리법

### 여러 사용자 정의

또한 이 미들웨어를 사용하면 더 많은 `username` 및 `password` 쌍을 정의하는 개체가 포함된 임의 매개 변수를 전달할 수 있습니다.

```ts
app.use(
  '/auth/*',
  basicAuth(
    {
      username: 'hono',
      password: 'acoolproject',
      // 첫 번째 객체에 다른 매개변수를 정의합니다.
      realm: 'www.example.com',
    },
    {
      username: 'hono-admin',
      password: 'super-secure',
      // 여기서 다른 매개변수를 재정의할 수 없습니다.
    },
    {
      username: 'hono-user-1',
      password: 'a-secret',
      // 아니면 여기
    }
  )
)
```

또는 덜 하드코딩됨:

```ts
import { users } from '../config/users'

app.use(
  '/auth/*',
  basicAuth(
    {
      realm: 'www.example.com',
      ...users[0],
    },
    ...users.slice(1)
  )
)
```
