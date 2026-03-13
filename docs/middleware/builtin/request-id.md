# 요청 ID 미들웨어

요청 ID 미들웨어는 핸들러에서 사용할 수 있는 각 요청에 대해 고유한 ID를 생성합니다.

::: info
**Node.js**: 이 미들웨어는 `crypto.randomUUID()`를 사용하여 ID를 생성합니다. 전역 `crypto`는 Node.js 버전 20 이상에서 도입되었습니다. 따라서 그 이전 버전에서는 오류가 발생할 수 있습니다. 그 경우에는 `generator`를 지정해 주십시오. 하지만 [Node.js 어댑터](https://github.com/honojs/node-server)를 사용하는 경우 자동으로 전역적으로 `crypto`가 설정되므로 이 작업은 필요하지 않습니다.
:::

## 가져오기

```ts
import { Hono } from 'hono'
import { requestId } from 'hono/request-id'
```

## 사용법

요청 ID 미들웨어가 적용된 핸들러 및 미들웨어에서 `requestId` 변수를 통해 요청 ID에 접근할 수 있습니다.

```ts
const app = new Hono()

app.use('*', requestId())

app.get('/', (c) => {
  return c.text(`Your request id is ${c.get('requestId')}`)
})
```

유형을 명시적으로 지정하려면 `RequestIdVariables`를 가져와 `new Hono()`의 제네릭에 전달하세요.

```ts
import type { RequestIdVariables } from 'hono/request-id'

const app = new Hono<{
  Variables: RequestIdVariables
}>()
```

### 요청 ID 설정

헤더에 사용자 정의 요청 ID를 설정하면(기본값: `X-Request-Id`) 미들웨어는 새 값을 생성하는 대신 해당 값을 사용합니다.

```ts
const app = new Hono()

app.use('*', requestId())

app.get('/', (c) => {
  return c.text(`${c.get('requestId')}`)
})

const res = await app.request('/', {
  headers: {
    'X-Request-Id': 'your-custom-id',
  },
})
console.log(await res.text()) // your-custom-id
```

이 기능을 비활성화하려면 [`headerName` 옵션](#headername-string)을 빈 문자열로 설정하세요.

## 옵션

### <Badge type="info" text="optional" /> 제한길이: `number`

요청 ID의 최대 길이입니다. 기본값은 `255`입니다.

### <Badge type="info" text="optional" /> 헤더 이름: `string`

요청 ID에 사용되는 헤더 이름입니다. 기본값은 `X-Request-Id`입니다.

### <Badge type="info" text="optional" /> 생성기: `(c: Context) => string`

요청 ID 생성 기능. 기본적으로 `crypto.randomUUID()`를 사용합니다.

## 플랫폼별 요청 ID

일부 플랫폼(예: AWS Lambda)은 이미 요청당 자체 요청 ID를 생성합니다.
추가 구성이 없으면 이 미들웨어는 이러한 특정 요청 ID를 인식하지 못합니다.
새 요청 ID를 생성합니다. 이로 인해 애플리케이션 로그를 볼 때 혼란이 생길 ​​수 있습니다.

이러한 ID를 통합하려면 `generator` 기능을 사용하여 플랫폼별 요청 ID를 캡처하고 이를 이 미들웨어에서 사용합니다.

### 플랫폼별 링크

- AWS 람다
  - [AWS 설명서: 컨텍스트 객체](https://docs.aws.amazon.com/lambda/latest/dg/nodejs-context.html)
  - [Hono: AWS Lambda 객체에 액세스](/docs/getting-started/aws-lambda#access-aws-lambda-object)
- Cloudflare
  - [Cloudflare 레이 ID
    ](https://developers.cloudflare.com/fundamentals/reference/cloudflare-ray-id/)
- Deno
  - [Deno 블로그에서 ID 요청](https://deno.com/blog/zero-config-debugging-deno-opentelemetry#:~:text=s%20automatically%20have-,unique%20request%20IDs,-associated%20with%20them)
- Fastly
  - [Fastly 문서: req.xid](https://www.fastly.com/documentation/reference/vcl/variables/client-request/req-xid/)
