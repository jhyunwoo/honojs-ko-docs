# 도우미

애플리케이션 개발을 지원하는 도우미가 제공됩니다. 미들웨어와 달리 핸들러 역할을 하지 않고 오히려 유용한 기능을 제공합니다.

예를 들어, [쿠키 도우미](/docs/helpers/cookie)를 사용하는 방법은 다음과 같습니다.

```ts
import { getCookie, setCookie } from 'hono/cookie'

const app = new Hono()

app.get('/cookie', (c) => {
  const yummyCookie = getCookie(c, 'yummy_cookie')
  // ...
  setCookie(c, 'delicious_cookie', 'macha')
  //
})
```

## 사용 가능한 도우미

- [수락](/docs/helpers/accepts)
- [어댑터](/docs/helpers/adapter)
- [쿠키](/docs/helpers/cookie)
- [css](/docs/helpers/css)
- [개발자](/docs/helpers/dev)
- [공장](/docs/helpers/factory)
- [html](/docs/helpers/html)
- [JWT](/docs/helpers/jwt)
- [SSG](/docs/helpers/ssg)
- [스트리밍](/docs/helpers/streaming)
- [테스트 중](/docs/helpers/testing)
- [WebSocket](/docs/helpers/websocket)
