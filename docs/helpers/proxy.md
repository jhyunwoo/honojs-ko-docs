# 프록시 도우미

Proxy Helper는 Hono 애플리케이션을 (역방향) 프록시로 사용할 때 유용한 기능을 제공합니다.

## 가져오기

```ts
import { Hono } from 'hono'
import { proxy } from 'hono/proxy'
```

## `proxy()`

`proxy()`는 프록시용 `fetch()` API 래퍼입니다. 매개변수 및 반환 값은 `fetch()`와 동일합니다(프록시 관련 옵션 제외).

`Accept-Encoding` 헤더는 현재 런타임에서 처리할 수 있는 인코딩으로 대체됩니다. 불필요한 응답 헤더는 삭제되고 핸들러에서 응답으로 반환할 수 있는 `Response` 개체가 반환됩니다.

### 예

간단한 사용법:

```ts
app.get('/proxy/:path', (c) => {
  return proxy(`http://${originServer}/${c.req.param('path')}`)
})
```

복잡한 사용법:

```ts
app.get('/proxy/:path', async (c) => {
  const res = await proxy(
    `http://${originServer}/${c.req.param('path')}`,
    {
      headers: {
        ...c.req.header(), // optional, specify only when forwarding all the request data (including credentials) is necessary.
        'X-Forwarded-For': '127.0.0.1',
        'X-Forwarded-Host': c.req.header('host'),
        Authorization: undefined, // do not propagate request headers contained in c.req.header('Authorization')
      },
    }
  )
  res.headers.delete('Set-Cookie')
  return res
})
```

또는 `c.req`를 매개변수로 전달할 수 있습니다.

```ts
app.all('/proxy/:path', (c) => {
  return proxy(`http://${originServer}/${c.req.param('path')}`, {
    ...c.req, // optional, specify only when forwarding all the request data (including credentials) is necessary.
    headers: {
      ...c.req.header(),
      'X-Forwarded-For': '127.0.0.1',
      'X-Forwarded-Host': c.req.header('host'),
      Authorization: undefined, // do not propagate request headers contained in c.req.header('Authorization')
    },
  })
})
```

`customFetch` 옵션을 사용하여 기본 전역 `fetch` 기능을 재정의할 수 있습니다.

```ts
app.get('/proxy', (c) => {
  return proxy('https://example.com/', {
    customFetch,
  })
})
```

### 연결 헤더 처리

기본적으로 `proxy()`는 홉별 헤더 삽입 공격을 방지하기 위해 `Connection` 헤더를 무시합니다. `strictConnectionProcessing` 옵션을 사용하면 엄격한 RFC 9110 준수를 활성화할 수 있습니다.

```ts
// 기본 동작(신뢰할 수 없는 클라이언트에 권장)
app.get('/proxy/:path', (c) => {
  return proxy(`http://${originServer}/${c.req.param('path')}`, c.req)
})

// 엄격한 RFC 9110 준수(신뢰할 수 있는 환경에서만 사용)
app.get('/internal-proxy/:path', (c) => {
  return proxy(`http://${internalServer}/${c.req.param('path')}`, {
    ...c.req,
    strictConnectionProcessing: true,
  })
})
```

### `ProxyFetch`

`proxy()`의 타입은 `ProxyFetch`로 정의되며 다음과 같습니다.

```ts
interface ProxyRequestInit extends Omit<RequestInit, 'headers'> {
  raw?: Request
  customFetch?: (request: Request) => Promise<Response>
  strictConnectionProcessing?: boolean
  headers?:
    | HeadersInit
    | [string, string][]
    | Record<RequestHeader, string | undefined>
    | Record<string, string | undefined>
}

interface ProxyFetch {
  (
    input: string | URL | Request,
    init?: ProxyRequestInit
  ): Promise<Response>
}
```
