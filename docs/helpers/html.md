# HTML 도우미

html 도우미를 사용하면 `html`라는 태그를 사용하여 JavaScript 템플릿 리터럴에 HTML를 작성할 수 있습니다. `raw()`를 사용하면 콘텐츠가 있는 그대로 렌더링됩니다. 이 문자열을 직접 이스케이프 처리해야 합니다.

## 가져오기

```ts
import { Hono } from 'hono'
import { html, raw } from 'hono/html'
```

## `html`

```ts
const app = new Hono()

app.get('/:username', (c) => {
  const { username } = c.req.param()
  return c.html(
    html`<!doctype html>
      <h1>안녕하세요! ${username}!</h1>`
  )
})
```

### JSX에 스니펫 삽입

JSX에 인라인 스크립트를 삽입합니다.

```tsx
app.get('/', (c) => {
  return c.html(
    <html>
      <head>
        <title>테스트 사이트</title>
        {html`
          <script>
            // 위험하게SetInnerHTML를 사용할 필요가 없습니다.
            // 여기에 쓰면 이스케이프되지 않습니다.
          </script>
        `}
      </head>
      <body>안녕하세요!</body>
    </html>
  )
})
```

### 기능적 구성 요소로 작동

`html`는 HtmlEscapedString을 반환하므로 JSX를 사용하지 않고도 완전한 기능을 갖춘 구성 요소로 작동할 수 있습니다.

#### 프로세스 속도를 높이려면 `memo` 대신 `html`를 사용하세요.

```typescript
const Footer = () => html`
  <footer>
    <address>내 주소...</address>
  </footer>
`
```

### 소품을 받고 값을 삽입합니다.

```typescript
interface SiteData {
  title: string
  description: string
  image: string
  children?: any
}
const Layout = (props: SiteData) => html`
<html>
<head>
  <meta charset="UTF-8">
  <title>${props.title}</title>
  <meta name="description" content="${props.description}">
  <head prefix="og: http://ogp.me/ns#">
  <meta property="og:type" content="article">
  <!-- More elements slow down JSX, but not template literals. -->
  <meta property="og:title" content="${props.title}">
  <meta property="og:image" content="${props.image}">
</head>
<body>
  ${props.children}
</body>
</html>
`

const Content = (props: { siteData: SiteData; name: string }) => (
  <Layout {...props.siteData}>
    <h1>안녕하세요 {props.name}</h1>
  </Layout>
)

app.get('/', (c) => {
  const props = {
    name: '세계',
    siteData: {
      title: 'Hello <> World',
      description: '이것은 설명입니다',
      image: 'https://example.com/image.png',
    },
  }
  return c.html(<Content {...props} />)
})
```

## `raw()`

```ts
app.get('/', (c) => {
  const name = '존 "조니" 스미스'
  return c.html(html`<p>저는 ${raw(name)}입니다.</p>`)
})
```

## 팁

이러한 라이브러리 덕분에 Visual Studio Code 및 vim은 템플릿 리터럴을 HTML로 해석하여 구문 강조 및 서식 적용을 허용합니다.

- <https://marketplace.visualstudio.com/items?itemName=bierner.lit-html>
- <https://github.com/MaxMEllon/vim-jsx-pretty>
