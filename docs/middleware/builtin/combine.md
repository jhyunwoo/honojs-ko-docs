# 미들웨어 결합

Combine Middleware는 여러 미들웨어 기능을 단일 미들웨어로 결합합니다. 이는 세 가지 기능을 제공합니다:

- `some` - 지정된 미들웨어 중 하나만 실행합니다.
- `every` - 지정된 모든 미들웨어를 실행합니다.
- `except` - 조건이 충족되지 않는 경우에만 지정된 모든 미들웨어를 실행합니다.

## 가져오기

```ts
import { Hono } from 'hono'
import { some, every, except } from 'hono/combine'
```

## 사용법

다음은 Combine Middleware를 사용하는 복잡한 액세스 제어 규칙의 예입니다.

```ts
import { Hono } from 'hono'
import { bearerAuth } from 'hono/bearer-auth'
import { getConnInfo } from 'hono/cloudflare-workers'
import { every, some } from 'hono/combine'
import { ipRestriction } from 'hono/ip-restriction'
import { rateLimit } from '@/my-rate-limit'

const app = new Hono()

app.use(
  '*',
  some(
    every(
      ipRestriction(getConnInfo, { allowList: ['192.168.0.2'] }),
      bearerAuth({ token })
    ),
    // 두 조건이 모두 충족되면 rateLimit이 실행되지 않습니다.
    rateLimit()
  )
)

app.get('/', (c) => c.text('안녕하세요 Hono!'))
```

### 일부

true를 반환하는 첫 번째 미들웨어를 실행합니다. 미들웨어는 순서대로 적용되며, 미들웨어 중 하나라도 성공적으로 종료되면 다음 미들웨어는 실행되지 않습니다.

```ts
import { some } from 'hono/combine'
import { bearerAuth } from 'hono/bearer-auth'
import { myRateLimit } from '@/rate-limit'

// 클라이언트에 유효한 토큰이 있는 경우 속도 제한을 건너뜁니다.
// 그렇지 않으면 속도 제한을 적용합니다.
app.use(
  '/api/*',
  some(bearerAuth({ token }), myRateLimit({ limit: 100 }))
)
```

### 모든

모든 미들웨어를 실행하고 그중 하나라도 실패하면 중지합니다. 미들웨어는 순서대로 적용되며, 하나의 미들웨어에서 오류가 발생하면 다음 미들웨어는 실행되지 않습니다.

```ts
import { some, every } from 'hono/combine'
import { bearerAuth } from 'hono/bearer-auth'
import { myCheckLocalNetwork } from '@/check-local-network'
import { myRateLimit } from '@/rate-limit'

// 클라이언트가 로컬 네트워크에 있는 경우 인증 및 속도 제한을 건너뜁니다.
// 그렇지 않으면 인증 및 속도 제한을 적용하세요.
app.use(
  '/api/*',
  some(
    myCheckLocalNetwork(),
    every(bearerAuth({ token }), myRateLimit({ limit: 100 }))
  )
)
```

### 제외하고

조건이 만족되는 경우를 제외한 모든 미들웨어를 실행합니다. 문자열이나 함수를 조건으로 전달할 수 있습니다. 여러 대상을 일치시켜야 하는 경우 이를 배열로 전달하세요.

```ts
import { except } from 'hono/combine'
import { bearerAuth } from 'hono/bearer-auth'

// 클라이언트가 공개 API에 액세스하는 경우 인증을 건너뜁니다.
// 그렇지 않으면 유효한 토큰이 필요합니다.
app.use('/api/*', except('/api/public/*', bearerAuth({ token })))
```
