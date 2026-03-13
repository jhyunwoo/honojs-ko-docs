# JSX 렌더러 미들웨어

JSX 렌더러 미들웨어를 사용하면 `c.setRenderer()`를 사용할 필요 없이 `c.render()` 기능으로 JSX를 렌더링할 때 레이아웃을 설정할 수 있습니다. 또한 `useRequestContext()`를 사용하여 구성 요소 내의 컨텍스트 인스턴스에 액세스할 수 있습니다.

## 가져오기

```ts
import { Hono } from 'hono'
import { jsxRenderer, useRequestContext } from 'hono/jsx-renderer'
```

## 사용법

```jsx
const app = new Hono()

app.get(
  '/page/*',
  jsxRenderer(({ children }) => {
    return (
      <html>
        <body>
          <header>메뉴</header>
          <div>{children}</div>
        </body>
      </html>
    )
  })
)

app.get('/page/about', (c) => {
  return c.render(<h1>내 정보!</h1>)
})
```

## 옵션

### <Badge type="info" text="optional" /> 문서 유형: `boolean` | `string`

HTML 시작 부분에 DOCTYPE을 추가하지 않으려면 `docType` 옵션을 `false`로 설정하세요.

```tsx
app.use(
  '*',
  jsxRenderer(
    ({ children }) => {
      return (
        <html>
          <body>{children}</body>
        </html>
      )
    },
    { docType: false }
  )
)
```

그리고 DOCTYPE을 지정할 수 있습니다.

```tsx
app.use(
  '*',
  jsxRenderer(
    ({ children }) => {
      return (
        <html>
          <body>{children}</body>
        </html>
      )
    },
    {
      docType:
        '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">',
    }
  )
)
```

### <Badge type="info" text="optional" /> 스트림: `boolean` | `Record<string, string>`

`true`로 설정하거나 Record 값을 제공하면 스트리밍 응답으로 렌더링됩니다.

```tsx
const AsyncComponent = async () => {
  await new Promise((r) => setTimeout(r, 1000)) // sleep 1s
  return <div>안녕!</div>
}

app.get(
  '*',
  jsxRenderer(
    ({ children }) => {
      return (
        <html>
          <body>
            <h1>SSR 스트리밍</h1>
            {children}
          </body>
        </html>
      )
    },
    { stream: true }
  )
)

app.get('/', (c) => {
  return c.render(
    <Suspense fallback={<div>로드 중...</div>}>
      <AsyncComponent />
    </Suspense>
  )
})
```

`true`가 설정된 경우 다음 헤더가 추가됩니다.

```ts
{
  'Transfer-Encoding': 'chunked',
  'Content-Type': 'text/html; charset=UTF-8',
  'Content-Encoding': 'Identity'
}
```

레코드 값을 지정하여 헤더 값을 사용자 정의할 수 있습니다.

### 기능 기반 옵션

정적 옵션 개체 대신 `Context` 개체를 받는 함수를 전달할 수 있습니다. 이를 통해 환경 변수나 요청 매개변수와 같은 요청 컨텍스트를 기반으로 옵션을 동적으로 설정할 수 있습니다.

```tsx
app.use(
  '*',
  jsxRenderer(
    ({ children }) => {
      return (
        <html>
          <body>{children}</body>
        </html>
      )
    },
    (c) => ({
      stream: c.req.header('X-Enable-Streaming') === 'true',
    })
  )
)
```

## 중첩 레이아웃

`Layout` 구성요소를 사용하면 레이아웃 중첩이 가능합니다.

```tsx
app.use(
  jsxRenderer(({ children }) => {
    return (
      <html>
        <body>{children}</body>
      </html>
    )
  })
)

const blog = new Hono()
blog.use(
  jsxRenderer(({ children, Layout }) => {
    return (
      <Layout>
        <nav>블로그 메뉴</nav>
        <div>{children}</div>
      </Layout>
    )
  })
)

app.route('/blog', blog)
```

## `useRequestContext()`

`useRequestContext()`는 Context의 인스턴스를 반환합니다.

```tsx
import { useRequestContext, jsxRenderer } from 'hono/jsx-renderer'

const app = new Hono()
app.use(jsxRenderer())

const RequestUrlBadge: FC = () => {
  const c = useRequestContext()
  return <b>{c.req.url}</b>
}

app.get('/page/info', (c) => {
  return c.render(
    <div>
      You are accessing: <RequestUrlBadge />
    </div>
  )
})
```

::: warning
`useRequestContext()`는 Deno의 `precompile` JSX 옵션과 함께 사용할 수 없습니다. `react-jsx`를 사용하십시오:

```json
   "compilerOptions": {
     "jsx": "precompile", // [!code --]
     "jsx": "react-jsx", // [!code ++]
     "jsxImportSource": "hono/jsx"
   }
 }
```

:::

## `ContextRenderer` 확장 중

아래와 같이 `ContextRenderer`를 정의하면 추가 콘텐츠를 렌더러에 전달할 수 있습니다. 예를 들어 페이지에 따라 head 태그의 내용을 변경하려는 경우에 유용합니다.

```tsx
declare module 'hono' {
  interface ContextRenderer {
    (
      content: string | Promise<string>,
      props: { title: string }
    ): Response
  }
}

const app = new Hono()

app.get(
  '/page/*',
  jsxRenderer(({ children, title }) => {
    return (
      <html>
        <head>
          <title>{title}</title>
        </head>
        <body>
          <header>메뉴</header>
          <div>{children}</div>
        </body>
      </html>
    )
  })
)

app.get('/page/favorites', (c) => {
  return c.render(
    <div>
      <ul>
        <li>초밥 먹기</li>
        <li>야구 경기 관람</li>
      </ul>
    </div>,
    {
      title: '내가 가장 좋아하는 것',
    }
  )
})
```
