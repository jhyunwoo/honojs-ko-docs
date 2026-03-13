# 대리

::: tip
**업데이트:** 더 쉬운 프록시 기능을 위해 새로운 프록시 도우미를 도입했습니다. 자세한 내용은 [프록시 도우미 문서](https://hono.dev/docs/helpers/proxy)를 확인하세요.
:::

```ts
import { Hono } from 'hono'

const app = new Hono()

app.get('/posts/:filename{.+.png$}', (c) => {
  const referer = c.req.header('Referer')
  if (referer && !/^https:\/\/example.com/.test(referer)) {
    return c.text('금지됨', 403)
  }
  return fetch(c.req.url)
})

app.get('*', (c) => {
  return fetch(c.req.url)
})

export default app
```

::: tip
유사한 코드로 `Can't modify immutable headers.` 오류가 표시되면 응답 개체를 복제해야 합니다.

```ts
app.get('/', async (_c) => {
  const response = await fetch('https://example.com')
  // 응답을 복제하여 수정 가능한 헤더가 있는 응답을 반환합니다.
  const newResponse = new Response(response.body, response)
  return newResponse
})
```

`fetch`에서 반환된 `Response`의 헤더는 변경할 수 없습니다. 따라서 수정하면 오류가 발생합니다.
:::
