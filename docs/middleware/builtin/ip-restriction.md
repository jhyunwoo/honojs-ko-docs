# IP 제한 미들웨어

IP 제한 미들웨어는 사용자의 IP 주소를 기반으로 리소스에 대한 접근을 제한하는 미들웨어입니다.

## 가져오기

```ts
import { Hono } from 'hono'
import { ipRestriction } from 'hono/ip-restriction'
```

## 사용법

Bun에서 실행되는 애플리케이션의 경우 로컬에서만 액세스를 허용하려면 다음과 같이 작성하면 됩니다. `denyList`에서 거부하려는 규칙을 지정하고 `allowList`에서 허용하려는 규칙을 지정합니다.

```ts
import { Hono } from 'hono'
import { getConnInfo } from 'hono/bun'
import { ipRestriction } from 'hono/ip-restriction'

const app = new Hono()

app.use(
  '*',
  ipRestriction(getConnInfo, {
    denyList: [],
    allowList: ['127.0.0.1', '::1'],
  })
)

app.get('/', (c) => c.text('안녕하세요 Hono!'))
```

`ipRestriction`의 첫 번째 인수로 사용자 환경에 적합한 [ConnInfo 도우미](/docs/helpers/conninfo)의 `getConninfo`를 전달합니다. 예를 들어 Deno의 경우 다음과 같습니다.

```ts
import { getConnInfo } from 'hono/deno'
import { ipRestriction } from 'hono/ip-restriction'

//...

app.use(
  '*',
  ipRestriction(getConnInfo, {
    // ...
  })
)
```

## 규칙

규칙을 작성하려면 아래 지침을 따르세요.

### IPv4

- `192.168.2.0` - 고정 IP 주소
- `192.168.2.0/24` - CIDR 표기법
- `*` - 모든 주소

### IPv6

- `::1` - 고정 IP 주소
- `::1/10` - CIDR 표기법
- `*` - 모든 주소

## 오류 처리

오류를 맞춤설정하려면 세 번째 인수에 `Response`를 반환하세요.

```ts
app.use(
  '*',
  ipRestriction(
    getConnInfo,
    {
      denyList: ['192.168.2.0/24'],
    },
    async (remote, c) => {
      return c.text(`Blocking access from ${remote.addr}`, 403)
    }
  )
)
```
