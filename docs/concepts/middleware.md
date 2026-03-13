# 미들웨어

`Response`를 "Handler"로 반환하는 기본 요소를 호출합니다.
"미들웨어"는 Handler 전후에 실행되어 `Request` 및 `Response`를 처리합니다.
양파 구조와 같습니다.

![](/images/onion.png)

예를 들어, 다음과 같이 "X-Response-Time" 헤더를 추가하는 미들웨어를 작성할 수 있습니다.

```ts twoslash
import { Hono } from 'hono'
const app = new Hono()
// ---cut---
app.use(async (c, next) => {
  const start = performance.now()
  await next()
  const end = performance.now()
  c.res.headers.set('X-Response-Time', `${end - start}`)
})
```

이 간단한 방법을 사용하면 자체 사용자 정의 미들웨어를 작성할 수 있고 내장 또는 타사 미들웨어를 사용할 수 있습니다.
