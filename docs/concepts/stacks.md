# Hono 스택

Hono는 쉬운 일을 쉽고 어려운 일을 쉽게 만듭니다.
JSON를 반환하는 것뿐만 아니라 적합합니다.
그러나 REST API 서버 및 클라이언트를 포함한 풀 스택 애플리케이션을 구축하는 데에도 적합합니다.

## RPC

Hono의 RPC 기능을 사용하면 코드를 거의 변경하지 않고도 API 사양을 공유할 수 있습니다.
`hc`에 의해 생성된 클라이언트는 사양을 읽고 엔드포인트 유형 안전성에 액세스합니다.

다음 라이브러리를 사용하면 가능합니다.

- Hono - API 서버
- [Zod](https://zod.dev) - 유효성 검사기
- [Zod 검증인 미들웨어](https://github.com/honojs/middleware/tree/main/packages/zod-validator)
- `hc` - HTTP 클라이언트

이러한 구성 요소 집합을 **Hono 스택**이라고 부를 수 있습니다.
이제 API 서버와 이를 사용하는 클라이언트를 만들어 보겠습니다.

## API 쓰기

먼저 GET 요청을 수신하고 JSON를 반환하는 엔드포인트를 작성합니다.

```ts twoslash
import { Hono } from 'hono'

const app = new Hono()

app.get('/hello', (c) => {
  return c.json({
    message: `Hello!`,
  })
})
```

## Zod로 검증

쿼리 매개변수 값을 받으려면 Zod로 유효성을 검사하세요.

![](/images/sc01.gif)

```ts
import { zValidator } from '@hono/zod-validator'
import * as z from 'zod'

app.get(
  '/hello',
  zValidator(
    'query',
    z.object({
      name: z.string(),
    })
  ),
  (c) => {
    const { name } = c.req.valid('query')
    return c.json({
      message: `Hello! ${name}`,
    })
  }
)
```

## 유형 공유

엔드포인트 사양을 내보내려면 해당 유형을 내보내세요.

::: warning

RPC가 경로를 올바르게 유추하려면 포함된 모든 메서드를 연결해야 하며, 선언된 변수에서 엔드포인트 또는 앱 유형을 유추해야 합니다. 자세한 내용은 [RPC 모범 사례](https://hono.dev/docs/guides/best-practices#if-you-want-to-use-rpc-features)를 참조하세요.

:::

```ts{1,17}
const route = app.get(
  '/hello',
  zValidator(
    'query',
    z.object({
      name: z.string(),
    })
  ),
  (c) => {
    const { name } = c.req.valid('query')
    return c.json({
      message: `Hello! ${name}`,
    })
  }
)

export type AppType = typeof route
```

## 고객

다음. 클라이언트 측 구현.
`AppType` 유형을 `hc`에 제네릭으로 전달하여 클라이언트 개체를 만듭니다.
그러면 마술처럼 완료가 작동하고 엔드포인트 경로와 요청 유형이 제안됩니다.

![](/images/sc03.gif)

```ts
import { AppType } from './server'
import { hc } from 'hono/client'

const client = hc<AppType>('/api')
const res = await client.hello.$get({
  query: {
    name: 'Hono',
  },
})
```

`Response`는 API 가져오기와 호환되지만 `json()`로 검색할 수 있는 데이터에는 유형이 있습니다.

![](/images/sc04.gif)

```ts
const data = await res.json()
console.log(`${data.message}`)
```

API 사양을 공유하면 서버 측 변경 사항을 알 수 있습니다.

![](/images/ss03.png)

## 반응으로

React를 사용하여 Cloudflare Pages에서 애플리케이션을 만들 수 있습니다.

API 서버입니다.

```ts
// 기능/api/[[route]].ts
import { Hono } from 'hono'
import { handle } from 'hono/cloudflare-pages'
import * as z from 'zod'
import { zValidator } from '@hono/zod-validator'

const app = new Hono()

const schema = z.object({
  id: z.string(),
  title: z.string(),
})

type Todo = z.infer<typeof schema>

const todos: Todo[] = []

const route = app
  .post('/todo', zValidator('form', schema), (c) => {
    const todo = c.req.valid('form')
    todos.push(todo)
    return c.json({
      message: '생성되었습니다!',
    })
  })
  .get((c) => {
    return c.json({
      todos,
    })
  })

export type AppType = typeof route

export const onRequest = handle(app, '/api')
```

React 및 React Query를 사용하는 클라이언트.

```tsx
// src/App.tsx
import {
  useQuery,
  useMutation,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { AppType } from '../functions/api/[[route]]'
import { hc, InferResponseType, InferRequestType } from 'hono/client'

const queryClient = new QueryClient()
const client = hc<AppType>('/api')

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Todos />
    </QueryClientProvider>
  )
}

const Todos = () => {
  const query = useQuery({
    queryKey: ['todos'],
    queryFn: async () => {
      const res = await client.todo.$get()
      return await res.json()
    },
  })

  const $post = client.todo.$post

  const mutation = useMutation<
    InferResponseType<typeof $post>,
    Error,
    InferRequestType<typeof $post>['form']
  >({
    mutationFn: async (todo) => {
      const res = await $post({
        form: todo,
      })
      return await res.json()
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
    onError: (error) => {
      console.log(error)
    },
  })

  return (
    <div>
      <button
        onClick={() => {
          mutation.mutate({
            id: Date.now().toString(),
            title: '코드 작성',
          })
        }}
      >
        Add Todo
      </button>

      <ul>
        {query.data?.todos.map((todo) => (
          <li key={todo.id}>{todo.title}</li>
        ))}
      </ul>
    </div>
  )
}
```
