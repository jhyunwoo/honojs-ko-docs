# RPC

RPC 기능을 사용하면 서버와 클라이언트 간에 API 사양을 공유할 수 있습니다.

먼저 서버 코드에서 `typeof` 앱(일반적으로 `AppType`라고 함)을 내보내거나 클라이언트에 사용할 수 있는 경로만 내보냅니다.

`AppType`를 일반 매개변수로 허용함으로써 Hono 클라이언트는 유효성 검사기가 지정한 입력 유형과 `c.json()`를 반환하는 핸들러가 내보낸 출력 유형을 모두 추론할 수 있습니다.

> [!메모]
> RPC 유형이 단일 저장소(클라이언트 및 서버의 tsconfig.json 파일 모두)에서 제대로 작동하려면 `compilerOptions`에서 `"strict": true`를 설정하세요. [자세히 읽어보세요.](https://github.com/honojs/hono/issues/2270#issuecomment-2143745118)

## 섬기는 사람

서버 측에서 해야 할 일은 유효성 검사기를 작성하고 변수 `route`를 만드는 것뿐입니다. 다음 예에서는 [Zod 검사기](https://github.com/honojs/middleware/tree/main/packages/zod-validator)를 사용합니다.

```ts{1}
const route = app.post(
  '/posts',
  zValidator(
    'form',
    z.object({
      title: z.string(),
      body: z.string(),
    })
  ),
  (c) => {
    // ...
    return c.json(
      {
        ok: true,
        message: 'Created!',
      },
      201
    )
  }
)
```

그런 다음 유형을 내보내 API 사양을 클라이언트와 공유합니다.

```ts
export type AppType = typeof route
```

## 고객

클라이언트 측에서는 `hc` 및 `AppType`를 먼저 가져옵니다.

```ts
import type { AppType } from '.'
import { hc } from 'hono/client'
```

`hc`는 클라이언트를 생성하는 함수입니다. `AppType`를 Generics로 전달하고 서버 URL을 인수로 지정합니다.

```ts
const client = hc<AppType>('http://localhost:8787/')
```

`client.{path}.{method}`를 호출하고 서버에 보내려는 데이터를 인수로 전달합니다.

```ts
const res = await client.posts.$post({
  form: {
    title: '안녕하세요',
    body: 'Hono는 멋진 프로젝트입니다.',
  },
})
```

`res`는 "가져오기" 응답과 호환됩니다. `res.json()`를 사용하여 서버에서 데이터를 검색할 수 있습니다.

```ts
if (res.ok) {
  const data = await res.json()
  console.log(data.message)
}
```

### 쿠키

클라이언트가 모든 요청과 함께 쿠키를 보내도록 하려면 클라이언트를 생성할 때 옵션에 `{ 'init': { 'credentials": 'include' } }`를 추가하세요.

```ts
// client.ts
const client = hc<AppType>('http://localhost:8787/', {
  init: {
    credentials: 'include',
  },
})

// 이제 이 요청에는 귀하가 설정했을 수 있는 모든 쿠키가 포함됩니다.
const res = await client.posts.$get({
  query: {
    id: '123',
  },
})
```

## 상태 코드

`c.json()`에 `200` 또는 `404`와 같은 상태 코드를 명시적으로 지정하는 경우. 클라이언트에 전달하기 위한 유형으로 추가됩니다.

```ts
// server.ts
const app = new Hono().get(
  '/posts',
  zValidator(
    'query',
    z.object({
      id: z.string(),
    })
  ),
  async (c) => {
    const { id } = c.req.valid('query')
    const post: Post | undefined = await getPost(id)

    if (post === undefined) {
      return c.json({ error: '찾을 수 없음' }, 404) // Specify 404
    }

    return c.json({ post }, 200) // Specify 200
  }
)

export type AppType = typeof app
```

상태 코드를 통해 데이터를 얻을 수 있습니다.

```ts
// client.ts
const client = hc<AppType>('http://localhost:8787/')

const res = await client.posts.$get({
  query: {
    id: '123',
  },
})

if (res.status === 404) {
  const data: { error: string } = await res.json()
  console.log(data.error)
}

if (res.ok) {
  const data: { post: Post } = await res.json()
  console.log(data.post)
}

// { post: Post } | { error: string }
type ResponseType = InferResponseType<typeof client.posts.$get>

// { post: Post }
type ResponseType200 = InferResponseType<
  typeof client.posts.$get,
  200
>
```

## 글로벌 대응

Hono RPC 클라이언트는 `app.onError()` 또는 전역 미들웨어와 같은 전역 오류 처리기에서 응답 유형을 자동으로 추론하지 않습니다. `ApplyGlobalResponse` 유형 도우미를 사용하여 전역 오류 응답 유형을 모든 경로에 병합할 수 있습니다.

```ts
import type { ApplyGlobalResponse } from 'hono/client'

const app = new Hono()
  .get('/api/users', (c) => c.json({ users: ['alice', 'bob'] }, 200))
  .onError((err, c) => c.json({ error: err.message }, 500))

type AppWithErrors = ApplyGlobalResponse<
  typeof app,
  {
    500: { json: { error: string } }
  }
>

const client = hc<AppWithErrors>('http://localhost')
```

이제 클라이언트는 성공과 오류 응답을 모두 알고 있습니다.

```ts
const res = await client.api.users.$get()

if (res.ok) {
  const data = await res.json() // { users: string[] }
}

// InferResponseType에는 전역 오류 유형이 포함됩니다.
type ResType = InferResponseType<typeof client.api.users.$get>
// { users: string[] } | { error: string }
```

여러 전역 오류 상태 코드를 한 번에 정의할 수도 있습니다.

```ts
type AppWithErrors = ApplyGlobalResponse<
  typeof app,
  {
    401: { json: { error: string; message: string } }
    500: { json: { error: string; message: string } }
  }
>
```

## 찾을 수 없음

클라이언트를 사용하려면 찾을 수 없음 응답에 `c.notFound()`를 사용하면 안 됩니다. 클라이언트가 서버에서 가져오는 데이터를 올바르게 유추할 수 없습니다.

```ts
// server.ts
export const routes = new Hono().get(
  '/posts',
  zValidator(
    'query',
    z.object({
      id: z.string(),
    })
  ),
  async (c) => {
    const { id } = c.req.valid('query')
    const post: Post | undefined = await getPost(id)

    if (post === undefined) {
      return c.notFound() // ❌️
    }

    return c.json({ post })
  }
)

// client.ts
import { hc } from 'hono/client'

const client = hc<typeof routes>('/')

const res = await client.posts[':id'].$get({
  param: {
    id: '123',
  },
})

const data = await res.json() // 🙁 data is unknown
```

`c.json()`를 사용하고 찾을 수 없음 응답에 대한 상태 코드를 지정하십시오.

```ts
export const routes = new Hono().get(
  '/posts',
  zValidator(
    'query',
    z.object({
      id: z.string(),
    })
  ),
  async (c) => {
    const { id } = c.req.valid('query')
    const post = await getPost(id)

    if (!post) {
      return c.json({ error: '찾을 수 없음' }, 404) // Specify 404
    }

    return c.json({ post }, 200) // Specify 200
  }
)
```

또는 모듈 기능 보강을 사용하여 `NotFoundResponse` 인터페이스를 확장할 수 있습니다. 이를 통해 `c.notFound()`는 입력된 응답을 반환할 수 있습니다.

```ts
// server.ts
import { Hono, TypedResponse } from 'hono'

declare module 'hono' {
  interface NotFoundResponse
    extends Response,
      TypedResponse<{ error: string }, 404, 'json'> {}
}

const app = new Hono()
  .get('/posts/:id', async (c) => {
    const post = await getPost(c.req.param('id'))
    if (!post) {
      return c.notFound()
    }
    return c.json({ post }, 200)
  })
  .notFound((c) => c.json({ error: '찾을 수 없음' }, 404))

export type AppType = typeof app
```

이제 클라이언트는 404 응답 유형을 올바르게 추론할 수 있습니다.

## 경로 매개변수

경로 매개변수나 쿼리 값을 포함하는 경로를 처리할 수도 있습니다.

```ts
const route = app.get(
  '/posts/:id',
  zValidator(
    'query',
    z.object({
      page: z.coerce.number().optional(), // coerce to convert to number
    })
  ),
  (c) => {
    // ...
    return c.json({
      title: '밤',
      body: '잠잘 시간',
    })
  }
)
```

기본 값의 유형이 다른 경우에도 경로 매개변수와 쿼리 값 모두 **반드시** `string`로 전달되어야 합니다.

`param`를 사용하여 경로에 포함할 문자열을 지정하고 `query`를 사용하여 쿼리 값을 지정합니다.

```ts
const res = await client.posts[':id'].$get({
  param: {
    id: '123',
  },
  query: {
    page: '1', // `string`, converted by the validator to `number`
  },
})
```

### 다중 매개변수

여러 매개변수가 있는 경로를 처리합니다.

```ts
const route = app.get(
  '/posts/:postId/:authorId',
  zValidator(
    'query',
    z.object({
      page: z.string().optional(),
    })
  ),
  (c) => {
    // ...
    return c.json({
      title: '밤',
      body: '잠잘 시간',
    })
  }
)
```

경로에 매개변수를 지정하려면 `['']`를 여러 개 추가하세요.

```ts
const res = await client.posts[':postId'][':authorId'].$get({
  param: {
    postId: '123',
    authorId: '456',
  },
  query: {},
})
```

### 슬래시 포함

`hc` 함수는 `param` 값을 URL 인코딩하지 않습니다. 매개변수에 슬래시를 포함하려면 [정규식](/docs/api/routing#regexp)을 사용하세요.

```ts
// client.ts

// 요청 /게시물/123/456
const res = await client.posts[':id'].$get({
  param: {
    id: '123/456',
  },
})

// server.ts
const route = app.get(
  '/posts/:id{.+}',
  zValidator(
    'param',
    z.object({
      id: z.string(),
    })
  ),
  (c) => {
    // 아이디: 123/456
    const { id } = c.req.valid('param')
    // ...
  }
)
```

> [!메모]
> 정규식이 없는 기본 경로 매개변수는 슬래시와 일치하지 않습니다. hc 함수를 사용하여 슬래시가 포함된 `param`를 전달하면 서버가 의도한 대로 라우팅되지 않을 수 있습니다. `encodeURIComponent`를 사용하여 매개변수를 인코딩하는 것은 올바른 라우팅을 보장하기 위해 권장되는 접근 방식입니다.

## 헤더

요청에 헤더를 추가할 수 있습니다.

```ts
const res = await client.search.$get(
  {
    //...
  },
  {
    headers: {
      'X-Custom-Header': '여기 Hono 클라이언트가 있습니다.',
      'X-User-Agent': 'hc',
    },
  }
)
```

모든 요청에 ​​공통 헤더를 추가하려면 이를 `hc` 함수에 대한 인수로 지정합니다.

```ts
const client = hc<AppType>('/api', {
  headers: {
    Authorization: 'Bearer TOKEN',
  },
})
```

## `init` 옵션

가져오기의 `RequestInit` 객체를 `init` 옵션으로 요청에 전달할 수 있습니다. 다음은 요청을 중단하는 예입니다.

```ts
import { hc } from 'hono/client'

const client = hc<AppType>('http://localhost:8787/')

const abortController = new AbortController()
const res = await client.api.posts.$post(
  {
    json: {
      // 요청 본문
    },
  },
  {
    // RequestInit 객체
    init: {
      signal: abortController.signal,
    },
  }
)

// ...

abortController.abort()
```

::: info
`init`에 의해 정의된 `RequestInit` 객체가 가장 높은 우선순위를 갖습니다. `body | method | headers`와 같은 다른 옵션으로 설정된 항목을 덮어쓰는 데 사용할 수 있습니다.
:::

## `$url()`

`$url()`를 사용하여 엔드포인트에 액세스하기 위한 `URL` 객체를 가져올 수 있습니다.

::: warning
이것이 작동하려면 절대 URL을 전달해야 합니다. 상대 URL `/`를 전달하면 다음 오류가 발생합니다.

`Uncaught TypeError: Failed to construct 'URL': Invalid URL`

```ts
// ❌ 오류가 발생합니다.
const client = hc<AppType>('/')
client.api.post.$url()

// ✅ 예상대로 작동합니다
const client = hc<AppType>('http://localhost:8787/')
client.api.post.$url()
```

:::

```ts
const route = app
  .get('/api/posts', (c) => c.json({ posts }))
  .get('/api/posts/:id', (c) => c.json({ post }))

const client = hc<typeof route>('http://localhost:8787/')

let url = client.api.posts.$url()
console.log(url.pathname) // `/api/posts`

url = client.api.posts[':id'].$url({
  param: {
    id: '123',
  },
})
console.log(url.pathname) // `/api/posts/123`
```

### 입력된 URL

보다 정확한 URL 유형을 얻으려면 기본 URL을 두 번째 유형 매개변수로 `hc`에 전달할 수 있습니다.

```ts
const client = hc<typeof route, 'http://localhost:8787'>(
  'http://localhost:8787/'
)

const url = client.api.posts.$url()
// url은 정확한 유형 정보가 포함된 TypedURL입니다.
// 프로토콜, 호스트, 경로 포함
```

이는 SWR과 같은 라이브러리의 유형 안전 키로 URL을 사용하려는 경우에 유용합니다.

## `$path()`

`$path()`는 `$url()`와 유사하지만 `URL` 개체 대신 경로 문자열을 반환합니다. `$url()`와 달리 기본 URL 원본을 포함하지 않으므로 `hc`에 전달하는 기본 URL에 관계없이 작동합니다.

```ts
const route = app
  .get('/api/posts', (c) => c.json({ posts }))
  .get('/api/posts/:id', (c) => c.json({ post }))

const client = hc<typeof route>('http://localhost:8787/')

let path = client.api.posts.$path()
console.log(path) // `/api/posts`

path = client.api.posts[':id'].$path({
  param: {
    id: '123',
  },
})
console.log(path) // `/api/posts/123`
```

쿼리 매개변수를 전달할 수도 있습니다.

```ts
const path = client.api.posts.$path({
  query: {
    page: '1',
    limit: '10',
  },
})
console.log(path) // `/api/posts?page=1&limit=10`
```

## 파일 업로드

양식 본문을 사용하여 파일을 업로드할 수 있습니다.

```ts
// 고객
const res = await client.user.picture.$put({
  form: {
    file: new File([fileToUpload], filename, {
      type: fileToUpload.type,
    }),
  },
})
```

```ts
// 섬기는 사람
const route = app.put(
  '/user/picture',
  zValidator(
    'form',
    z.object({
      file: z.instanceof(File),
    })
  )
  // ...
)
```

## 사용자 정의 `fetch` 방법

사용자 정의 `fetch` 방법을 설정할 수 있습니다.

Cloudflare 작업자에 대한 다음 예제 스크립트에서는 기본 `fetch` 대신 서비스 바인딩의 `fetch` 메서드가 사용됩니다.

```toml
# wrangler.toml
services = [
  { binding = "AUTH", service = "auth-service" },
]
```

```ts
// src/client.ts
const client = hc<CreateProfileType>('http://localhost', {
  fetch: c.env.AUTH.fetch.bind(c.env.AUTH),
})
```

## 사용자 정의 쿼리 직렬 변환기

`buildSearchParams` 옵션을 사용하여 쿼리 매개변수가 직렬화되는 방식을 사용자 정의할 수 있습니다. 이는 배열이나 기타 사용자 정의 형식에 대괄호 표기가 필요할 때 유용합니다.

```ts
const client = hc<AppType>('http://localhost', {
  buildSearchParams: (query) => {
    const searchParams = new URLSearchParams()
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined) {
        continue
      }
      if (Array.isArray(v)) {
        v.forEach((item) => searchParams.append(`${k}[]`, item))
      } else {
        searchParams.set(k, v)
      }
    }
    return searchParams
  },
})
```

## 미루다

`InferRequestType` 및 `InferResponseType`를 사용하면 요청될 개체 유형과 반환할 개체 유형을 알 수 있습니다.

```ts
import type { InferRequestType, InferResponseType } from 'hono/client'

// 요청 유형 추론
const $post = client.todo.$post
type ReqType = InferRequestType<typeof $post>['form']

// 추론응답 유형
type ResType = InferResponseType<typeof $post>
```

## 유형 안전성 도우미를 사용하여 응답 구문 분석

`parseResponse()` 도우미를 사용하면 유형 안전성을 통해 `hc`의 응답을 쉽게 구문 분석할 수 있습니다.

```ts
import { parseResponse, DetailedError } from 'hono/client'

// 결과에는 구문 분석된 응답 본문이 포함됩니다(Content-Type을 기반으로 자동 구문 분석됨).
const result = await parseResponse(client.hello.$get()).catch(
  (e: DetailedError) => {
    console.error(e)
  }
)
// 응답이 정상이 아닌 경우parseResponse가 자동으로 오류를 발생시킵니다.
```

## SWR 사용

[SWR](https://swr.vercel.app)와 같은 React Hook 라이브러리를 사용할 수도 있습니다.

```tsx
import useSWR from 'swr'
import { hc } from 'hono/client'
import type { InferRequestType } from 'hono/client'
import type { AppType } from '../functions/api/[[route]]'

const App = () => {
  const client = hc<AppType>('/api')
  const $get = client.hello.$get

  const fetcher =
    (arg: InferRequestType<typeof $get>) => async () => {
      const res = await $get(arg)
      return await res.json()
    }

  const { data, error, isLoading } = useSWR(
    'api-hello',
    fetcher({
      query: {
        name: 'SWR',
      },
    })
  )

  if (error) return <div>로드하지 못했습니다.</div>
  if (isLoading) return <div>로드 중...</div>

  return <h1>{data?.message}</h1>
}

export default App
```

## 더 큰 애플리케이션에서 RPC 사용

[더 큰 애플리케이션 구축](/docs/guides/best-practices#building-a-larger-application)에서 언급한 예시와 같이 더 큰 애플리케이션의 경우 추론 유형에 주의해야 합니다.
이를 수행하는 간단한 방법은 유형이 항상 추론되도록 핸들러를 연결하는 것입니다.

```ts
// 저자.ts
import { Hono } from 'hono'

const app = new Hono()
  .get('/', (c) => c.json('저자 목록'))
  .post('/', (c) => c.json('작가를 만들어라', 201))
  .get('/:id', (c) => c.json(`get ${c.req.param('id')}`))

export default app
```

```ts
// books.ts
import { Hono } from 'hono'

const app = new Hono()
  .get('/', (c) => c.json('도서 목록'))
  .post('/', (c) => c.json('책을 만들다', 201))
  .get('/:id', (c) => c.json(`get ${c.req.param('id')}`))

export default app
```

그런 다음 평소와 같이 하위 라우터를 가져올 수 있고 해당 핸들러도 연결했는지 확인할 수 있습니다. 이 경우 이것이 앱의 최상위 수준이고 우리가 내보내려는 유형이기 때문입니다.

```ts
// index.ts
import { Hono } from 'hono'
import authors from './authors'
import books from './books'

const app = new Hono()

const routes = app.route('/authors', authors).route('/books', books)

export default app
export type AppType = typeof routes
```

이제 등록된 AppType을 사용하여 새 클라이언트를 생성하고 평소처럼 사용할 수 있습니다.

## 알려진 문제

### IDE 성능

RPC를 사용하는 경우 경로가 많을수록 IDE 속도가 느려집니다. 그 주된 이유 중 하나는 앱 유형을 추론하기 위해 엄청난 양의 유형 인스턴스화가 실행된다는 것입니다.

예를 들어 앱에 다음과 같은 경로가 있다고 가정해 보겠습니다.

```ts
// app.ts
export const app = new Hono().get('foo/:id', (c) =>
  c.json({ ok: true }, 200)
)
```

Hono는 다음과 같이 유형을 추론합니다.

```ts
export const app = Hono<BlankEnv, BlankSchema, '/'>().얻다<
  'foo/:id',
  'foo/:id',
  JSONRespondReturn<{ ok: boolean }, 200>,
  BlankInput,
  BlankEnv
>('foo/:id', (c) => c.json({ ok: true }, 200))
```

이는 단일 경로에 대한 유형 인스턴스화입니다. 사용자가 이러한 유형 인수를 수동으로 작성할 필요가 없다는 점은 좋은 일이지만 유형 인스턴스화에는 많은 시간이 걸리는 것으로 알려져 있습니다. IDE에서 사용되는 `tsserver`는 앱을 사용할 때마다 시간이 많이 걸리는 작업을 수행합니다. 경로가 많으면 IDE 속도가 크게 느려질 수 있습니다.

하지만 이 문제를 완화할 수 있는 몇 가지 팁이 있습니다.

#### Hono 버전 불일치

백엔드가 프런트엔드와 분리되어 있고 다른 디렉터리에 있는 경우 Hono 버전이 일치하는지 확인해야 합니다. 백엔드에서 하나의 Hono 버전을 사용하고 프런트엔드에서 다른 버전을 사용하는 경우 "_유형 인스턴스화가 지나치게 깊고 무한할 수 있음_"과 같은 문제가 발생합니다.

![](https://github.com/user-attachments/assets/e4393c80-29dd-408d-93ab-d55c11ccca05)

#### TypeScript 프로젝트 참조

[Hono 버전 불일치](#hono-version-mismatch)의 경우와 마찬가지로 백엔드와 프런트엔드가 분리되어 있으면 문제가 발생합니다. 프런트엔드에서 백엔드(예: `AppType`)의 코드에 액세스하려면 [프로젝트 참조](https://www.typescriptlang.org/docs/handbook/project-references.html)를 사용해야 합니다. TypeScript의 프로젝트 참조를 통해 하나의 TypeScript 코드베이스가 다른 TypeScript 코드베이스의 코드에 액세스하고 사용할 수 있습니다. _(출처: [Hono RPC 및 TypeScript 프로젝트 참조](https://catalins.tech/hono-rpc-in-monorepos/))_.

#### 사용하기 전에 코드를 컴파일하세요(권장)

`tsc`는 컴파일 타임에 유형 인스턴스화와 같은 무거운 작업을 수행할 수 있습니다! 그러면 `tsserver`는 사용할 때마다 모든 유형 인수를 인스턴스화할 필요가 없습니다. 그러면 IDE가 훨씬 더 빨라질 것입니다!

서버 앱을 포함하여 클라이언트를 컴파일하면 최고의 성능을 얻을 수 있습니다. 프로젝트에 다음 코드를 추가하세요.

```ts
import { app } from './app'
import { hc } from 'hono/client'

// 이것은 컴파일할 때 유형을 계산하는 트릭입니다.
export type Client = ReturnType<typeof hc<typeof app>>

export const hcWithType = (...args: Parameters<typeof hc>): Client =>
  hc<typeof app>(...args)
```

컴파일 후 `hc` 대신 `hcWithType`를 사용하면 이미 계산된 유형의 클라이언트를 얻을 수 있습니다.

```ts
const client = hcWithType('http://localhost:8787/')
const res = await client.posts.$post({
  form: {
    title: '안녕하세요',
    body: 'Hono는 멋진 프로젝트입니다.',
  },
})
```

프로젝트가 단일 저장소인 경우 이 솔루션이 적합합니다. [`turborepo`](https://turbo.build/repo/docs)와 같은 도구를 사용하면 서버 프로젝트와 클라이언트 프로젝트를 쉽게 분리하고 둘 사이의 종속성을 관리하여 더 나은 통합을 얻을 수 있습니다. 다음은 [작동 예시](https://github.com/m-shaka/hono-rpc-perf-tips-example)입니다.

`concurrently` 또는 `npm-run-all`와 같은 도구를 사용하여 빌드 프로세스를 수동으로 조정할 수도 있습니다.

#### 유형 인수를 수동으로 지정

이는 다소 번거롭지만 유형 인스턴스화를 피하기 위해 유형 인수를 수동으로 지정할 수 있습니다.

```ts
const app = new Hono().get<'foo/:id'>('foo/:id', (c) =>
  c.json({ ok: true }, 200)
)
```

단일 유형 인수만 지정하면 성능이 달라지지만 경로가 많으면 많은 시간과 노력이 필요할 수 있습니다.

#### 앱과 클라이언트를 여러 파일로 분할

[대규모 애플리케이션에서 RPC 사용](#using-rpc-with-larger-applications)에 설명된 대로 앱을 여러 앱으로 분할할 수 있습니다. 각 앱에 대한 클라이언트를 만들 수도 있습니다.

```ts
// 작성자-cli.ts
import { app as authorsApp } from './authors'
import { hc } from 'hono/client'

const authorsClient = hc<typeof authorsApp>('/authors')

// 책-cli.ts
import { app as booksApp } from './books'
import { hc } from 'hono/client'

const booksClient = hc<typeof booksApp>('/books')
```

이렇게 하면 `tsserver`는 모든 경로에 대한 유형을 한 번에 인스턴스화할 필요가 없습니다.
