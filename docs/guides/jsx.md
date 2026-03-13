# JSX

`hono/jsx`를 사용하여 JSX 구문으로 HTML를 작성할 수 있습니다.

`hono/jsx`는 클라이언트에서 작동하지만 아마도 서버 측에서 콘텐츠를 렌더링할 때 가장 자주 사용하게 될 것입니다. 다음은 서버와 클라이언트 모두에 공통되는 JSX와 관련된 몇 가지 사항입니다.

## 설정

JSX를 사용하려면 `tsconfig.json`를 수정합니다.

`tsconfig.json`:

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "hono/jsx"
  }
}
```

또는 pragma 지시문을 사용하십시오.

```ts
/** @jsx jsx*/
/** @jsxImportSource hono/jsx */
```

Deno의 경우 `tsconfig.json` 대신 `deno.json`를 수정해야 합니다.

```json
{
  "compilerOptions": {
    "jsx": "precompile",
    "jsxImportSource": "@hono/hono/jsx"
  }
}
```

## 사용법

:::info
[빠른 시작](/docs/#quick-start)에서 바로 오는 경우 기본 파일에는 `.ts` 확장자가 있습니다. 이를 `.tsx`로 변경해야 합니다. 그렇지 않으면 응용 프로그램을 전혀 실행할 수 없습니다. 해당 변경 사항을 반영하도록 `package.json`(또는 Deno를 사용하는 경우 `deno.json`)를 추가로 수정해야 합니다(예: 개발 스크립트에 `bun run --hot src/index.ts` 대신 `bun run --hot src/index.tsx`가 있어야 함).
:::

`index.tsx`:

```tsx
import { Hono } from 'hono'
import type { FC } from 'hono/jsx'

const app = new Hono()

const Layout: FC = (props) => {
  return (
    <html>
      <body>{props.children}</body>
    </html>
  )
}

const Top: FC<{ messages: string[] }> = (props: {
  messages: string[]
}) => {
  return (
    <Layout>
      <h1>안녕하세요 Hono!</h1>
      <ul>
        {props.messages.map((message) => {
          return <li>{message}!!</li>
        })}
      </ul>
    </Layout>
  )
}

app.get('/', (c) => {
  const messages = ['좋은 아침이에요', '좋은 저녁이에요', '안녕히 주무세요']
  return c.html(<Top messages={messages} />)
})

export default app
```

## 메타데이터 호이스팅

`<title>`, `<link>` 및 `<meta>`와 같은 문서 메타데이터 태그를 구성 요소 내부에 직접 작성할 수 있습니다. 이러한 태그는 문서의 `<head>` 섹션에 자동으로 끌어올려집니다. 이는 `<head>` 요소가 적절한 메타데이터를 결정하는 구성 요소에서 멀리 렌더링될 때 특히 유용합니다.

```tsx
import { Hono } from 'hono'

const app = new Hono()

app.use('*', async (c, next) => {
  c.setRenderer((content) => {
    return c.html(
      <html>
        <head></head>
        <body>{content}</body>
      </html>
    )
  })
  await next()
})

app.get('/about', (c) => {
  return c.render(
    <>
      <title>페이지 소개</title>
      <meta name='description' content='소개 페이지입니다.' />
      about page content
    </>
  )
})

export default app
```

:::info
호이스팅이 발생하면 기존 요소는 제거되지 않습니다. 나중에 나타나는 요소는 끝에 추가됩니다. 예를 들어 `<head>`에 `<title>Default</title>`가 있고 구성 요소가 `<title>Page Title</title>`를 렌더링하는 경우 두 제목이 모두 헤드에 표시됩니다.
:::

## 파편

추가 노드를 추가하지 않고 여러 요소를 그룹화하려면 Fragment를 사용하세요.

```tsx
import { Fragment } from 'hono/jsx'

const List = () => (
  <Fragment>
    <p>첫 번째 아이</p>
    <p>둘째 아이</p>
    <p>셋째 아이</p>
  </Fragment>
)
```

또는 제대로 설정되었다면 `<></>`로 쓸 수도 있습니다.

```tsx
const List = () => (
  <>
    <p>첫 번째 아이</p>
    <p>둘째 아이</p>
    <p>셋째 아이</p>
  </>
)
```

## `PropsWithChildren`

`PropsWithChildren`를 사용하면 함수 구성 요소의 하위 요소를 올바르게 유추할 수 있습니다.

```tsx
import { PropsWithChildren } from 'hono/jsx'

type Post = {
  id: number
  title: string
}

function Component({ title, children }: PropsWithChildren<Post>) {
  return (
    <div>
      <h1>{title}</h1>
      {children}
    </div>
  )
}
```

## 원시 HTML 삽입 중

HTML를 직접 삽입하려면 `dangerouslySetInnerHTML`를 사용하세요.

```tsx
app.get('/foo', (c) => {
  const inner = { __html: 'JSX · SSR' }
  const Div = <div dangerouslySetInnerHTML={inner} />
})
```

## 메모

`memo`를 사용하여 계산된 문자열을 메모하여 구성 요소를 최적화합니다.

```tsx
import { memo } from 'hono/jsx'

const Header = memo(() => <header>Hono에 오신 것을 환영합니다.</header>)
const Footer = memo(() => <footer>제공: Hono</footer>)
const Layout = (
  <div>
    <Header />
    <p>Hono 멋지네요!</p>
    <Footer />
  </div>
)
```

## 문맥

`useContext`를 사용하면 props를 통해 값을 전달하지 않고도 구성 요소 트리의 모든 수준에서 전역적으로 데이터를 공유할 수 있습니다.

```tsx
import type { FC } from 'hono/jsx'
import { createContext, useContext } from 'hono/jsx'

const themes = {
  light: {
    color: '#000000',
    background: '#eeeeee',
  },
  dark: {
    color: '#ffffff',
    background: '#222222',
  },
}

const ThemeContext = createContext(themes.light)

const Button: FC = () => {
  const theme = useContext(ThemeContext)
  return <button style={theme}>푸시!</button>
}

const Toolbar: FC = () => {
  return (
    <div>
      <Button />
    </div>
  )
}

// ...

app.get('/', (c) => {
  return c.html(
    <div>
      <ThemeContext.Provider value={themes.dark}>
        <Toolbar />
      </ThemeContext.Provider>
    </div>
  )
})
```

## 비동기 구성요소

`hono/jsx`는 비동기 구성 요소를 지원하므로 구성 요소에서 `async`/`await`를 사용할 수 있습니다.
`c.html()`로 렌더링하면 자동으로 대기하게 됩니다.

```tsx
const AsyncComponent = async () => {
  await new Promise((r) => setTimeout(r, 1000)) // sleep 1s
  return <div>완료!</div>
}

app.get('/', (c) => {
  return c.html(
    <html>
      <body>
        <AsyncComponent />
      </body>
    </html>
  )
})
```

## 서스펜스 <Badge style="vertical-align: middle;" type="warning" text="Experimental" />

React와 유사한 `Suspense` 기능을 사용할 수 있습니다.
`Suspense`로 비동기 구성 요소를 래핑하면 대체 콘텐츠가 먼저 렌더링되고 Promise가 해결되면 대기 중인 콘텐츠가 표시됩니다.
`renderToReadableStream()`와 함께 사용할 수 있습니다.

```tsx
import { renderToReadableStream, Suspense } from 'hono/jsx/streaming'

//...

app.get('/', (c) => {
  const stream = renderToReadableStream(
    <html>
      <body>
        <Suspense fallback={<div>로드 중...</div>}>
          <Component />
        </Suspense>
      </body>
    </html>
  )
  return c.body(stream, {
    headers: {
      'Content-Type': 'text/html; charset=UTF-8',
      'Transfer-Encoding': 'chunked',
    },
  })
})
```

## 오류경계 <Badge style="vertical-align: middle;" type="warning" text="Experimental" />

`ErrorBoundary`를 사용하여 하위 구성요소의 오류를 포착할 수 있습니다.

아래 예에서는 오류가 발생하면 `fallback`에 지정된 내용을 표시합니다.

```tsx
function SyncComponent() {
  throw new Error('오류')
  return <div>안녕하세요</div>
}

app.get('/sync', async (c) => {
  return c.html(
    <html>
      <body>
        <ErrorBoundary fallback={<div>서비스 중단</div>}>
          <SyncComponent />
        </ErrorBoundary>
      </body>
    </html>
  )
})
```

`ErrorBoundary`는 비동기 구성 요소 및 `Suspense`와 함께 사용할 수도 있습니다.

```tsx
async function AsyncComponent() {
  await new Promise((resolve) => setTimeout(resolve, 2000))
  throw new Error('오류')
  return <div>안녕하세요</div>
}

app.get('/with-suspense', async (c) => {
  return c.html(
    <html>
      <body>
        <ErrorBoundary fallback={<div>서비스 중단</div>}>
          <Suspense fallback={<div>로드 중...</div>}>
            <AsyncComponent />
          </Suspense>
        </ErrorBoundary>
      </body>
    </html>
  )
})
```

## 스트리밍컨텍스트 <Badge style="vertical-align: middle;" type="warning" text="Experimental" />

`StreamingContext`를 사용하여 `Suspense` 및 `ErrorBoundary`와 같은 스트리밍 구성 요소에 대한 구성을 제공할 수 있습니다. 이는 CSP(콘텐츠 보안 정책)에 대해 이러한 구성 요소에서 생성된 스크립트 태그에 nonce 값을 추가하는 데 유용합니다.

```tsx
import { Suspense, StreamingContext } from 'hono/jsx/streaming'

// ...

app.get('/', (c) => {
  const stream = renderToReadableStream(
    <html>
      <body>
        <StreamingContext
          value={{ scriptNonce: 'random-nonce-value' }}
        >
          <Suspense fallback={<div>로드 중...</div>}>
            <AsyncComponent />
          </Suspense>
        </StreamingContext>
      </body>
    </html>
  )

  return c.body(stream, {
    headers: {
      'Content-Type': 'text/html; charset=UTF-8',
      'Transfer-Encoding': 'chunked',
      'Content-Security-Policy':
        "script-src 'nonce-random-nonce-value'",
    },
  })
})
```

`scriptNonce` 값은 `Suspense` 및 `ErrorBoundary` 구성요소에 의해 생성된 모든 `<script>` 태그에 자동으로 추가됩니다.

## HTML 미들웨어와 통합

강력한 템플릿을 위해 JSX와 html 미들웨어를 결합하세요.
자세한 내용은 [html 미들웨어 문서](/docs/helpers/html)를 참조하세요.

```tsx
import { Hono } from 'hono'
import { html } from 'hono/html'

const app = new Hono()

interface SiteData {
  title: string
  children?: any
}

const Layout = (props: SiteData) =>
  html`<!doctype html>
    <html>
      <head>
        <title>${props.title}</title>
      </head>
      <body>
        ${props.children}
      </body>
    </html>`

const Content = (props: { siteData: SiteData; name: string }) => (
  <Layout {...props.siteData}>
    <h1>안녕하세요 {props.name}</h1>
  </Layout>
)

app.get('/:name', (c) => {
  const { name } = c.req.param()
  const props = {
    name: name,
    siteData: {
      title: 'HTML 샘플이 포함된 JSX',
    },
  }
  return c.html(<Content {...props} />)
})

export default app
```

## JSX 렌더러 미들웨어 포함

[JSX 렌더러 미들웨어](/docs/middleware/builtin/jsx-renderer)를 사용하면 JSX를 사용하여 HTML 페이지를 더 쉽게 만들 수 있습니다.

## 유형 정의 재정의

유형 정의를 재정의하여 사용자 정의 요소 및 속성을 추가할 수 있습니다.

```ts
declare module 'hono/jsx' {
  namespace JSX {
    interface IntrinsicElements {
      'my-custom-element': HTMLAttributes & {
        'x-event'?: 'click' | 'scroll'
      }
    }
  }
}
```
