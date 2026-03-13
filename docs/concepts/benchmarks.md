# 벤치마크

벤치마크는 단지 벤치마크일 뿐이지만 우리에게는 중요합니다.

## 라우터

여러 JavaScript 라우터의 속도를 측정했습니다.
예를 들어 `find-my-way`는 Fastify 내부에서 사용되는 매우 빠른 라우터입니다.

- @medley/router
- find-my-way
- koa-tree-router
- trek-router
- express (includes handling)
- koa-router

먼저 각 라우터에 다음 라우팅을 등록했습니다.
이는 실제 세계에서 사용되는 것과 유사합니다.

```ts twoslash
interface Route {
  method: string
  path: string
}
// ---cut---
export const routes: Route[] = [
  { method: 'GET', path: '/user' },
  { method: 'GET', path: '/user/comments' },
  { method: 'GET', path: '/user/avatar' },
  { method: 'GET', path: '/user/lookup/username/:username' },
  { method: 'GET', path: '/user/lookup/email/:address' },
  { method: 'GET', path: '/event/:id' },
  { method: 'GET', path: '/event/:id/comments' },
  { method: 'POST', path: '/event/:id/comment' },
  { method: 'GET', path: '/map/:location/events' },
  { method: 'GET', path: '/status' },
  { method: 'GET', path: '/very/deeply/nested/route/hello/there' },
  { method: 'GET', path: '/static/*' },
]
```

그런 다음 아래와 같은 엔드포인트로 요청을 보냈습니다.

```ts twoslash
interface Route {
  method: string
  path: string
}
// ---cut---
const routes: (Route & { name: string })[] = [
  {
    name: '짧은 정적',
    method: 'GET',
    path: '/user',
  },
  {
    name: '동일한 기수를 갖는 정적',
    method: 'GET',
    path: '/user/comments',
  },
  {
    name: '동적 경로',
    method: 'GET',
    path: '/user/lookup/username/hey',
  },
  {
    name: '혼합 정적 동적',
    method: 'GET',
    path: '/event/abcd1234/comments',
  },
  {
    name: 'POST',
    method: 'POST',
    path: '/event/abcd1234/comment',
  },
  {
    name: '긴 정적',
    method: 'GET',
    path: '/very/deeply/nested/route/hello/there',
  },
  {
    name: '와일드카드',
    method: 'GET',
    path: '/static/index.html',
  },
]
```

결과를 보자.

### Node.js에서

다음 스크린샷은 Node.js의 결과를 보여줍니다.

![](/images/bench01.png)

![](/images/bench02.png)

![](/images/bench03.png)

![](/images/bench04.png)

![](/images/bench05.png)

![](/images/bench06.png)

![](/images/bench07.png)

![](/images/bench08.png)

### Bun에서

다음 스크린샷은 Bun의 결과를 보여줍니다.

![](/images/bench09.png)

![](/images/bench10.png)

![](/images/bench11.png)

![](/images/bench12.png)

![](/images/bench13.png)

![](/images/bench14.png)

![](/images/bench15.png)

![](/images/bench16.png)

## Cloudflare Workers

**Hono는 Cloudflare Workers의 다른 라우터에 비해 가장 빠릅니다**.

- 머신: Apple MacBook Pro, 32 GiB, M1 Pro
- 스크립트: [벤치마크/이벤트 처리](https://github.com/honojs/hono/tree/main/benchmarks/handle-event)

```
Hono x 402,820 ops/sec ±4.78% (80 runs sampled)
itty-router x 212,598 ops/sec ±3.11% (87 runs sampled)
sunder x 297,036 ops/sec ±4.76% (77 runs sampled)
worktop x 197,345 ops/sec ±2.40% (88 runs sampled)
Fastest is Hono
✨  Done in 28.06s.
```

## Deno

**Hono는 Deno의 다른 프레임워크에 비해 가장 빠릅니다**.

- 머신: Apple MacBook Pro, 32 GiB, M1 Pro, Deno v1.22.0
- 스크립트: [벤치마크/deno](https://github.com/honojs/hono/tree/main/benchmarks/deno)
- 방법: `bombardier --fasthttp -d 10s -c 100 'http://localhost:8000/user/lookup/username/foo'`

| 뼈대 |   버전    |                  결과 |
| --------- | :----------: | -----------------------: |
| **Hono**  |    3.0.0     | **요청/초: 136112** |
| Fast      | 4.0.0-beta.1 |     요청/초: 103214 |
| Megalo    |    0.3.0     |      요청/초: 64597 |
| Faster    |     5.7      |      요청/초: 54801 |
| oak       |    10.5.1    |      요청/초: 43326 |
| opine     |    2.2.0     |      요청/초: 30700 |

또 다른 벤치마크 결과: [denosaurs/bench](https://github.com/denosaurs/bench)

## Bun

Hono는 Bun를 위한 가장 빠른 프레임워크 중 하나입니다.
아래에서 볼 수 있습니다.

- [SaltyAom/bun-http-framework-benchmark](https://github.com/SaltyAom/bun-http-framework-benchmark)
