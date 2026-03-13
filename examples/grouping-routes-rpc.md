# RPC에 대한 경로 그룹화

여러 `app`에 대해 유형 추론을 올바르게 활성화하려면 다음과 같이 `app.route()`를 사용할 수 있습니다.

`app.get()` 또는 `app.post()`와 같은 메서드에서 반환된 값을 `app.route()`의 두 번째 인수에 전달합니다.

```ts
import { Hono } from 'hono'
import { hc } from 'hono/client'

const authorsApp = new Hono()
  .get('/', (c) => c.json({ result: '저자 목록' }))
  .post('/', (c) => c.json({ result: '작가를 만들어라' }, 201))
  .get('/:id', (c) => c.json({ result: `get ${c.req.param('id')}` }))

const booksApp = new Hono()
  .get('/', (c) => c.json({ result: '도서 목록' }))
  .post('/', (c) => c.json({ result: '책을 만들다' }, 201))
  .get('/:id', (c) => c.json({ result: `get ${c.req.param('id')}` }))

const app = new Hono()
  .route('/authors', authorsApp)
  .route('/books', booksApp)

type AppType = typeof app
```

## 또한보십시오

- [가이드 - RPC - 클라이언트](/docs/guides/rpc#client)
