# CSS 도우미

CSS 도우미인 `hono/css`는 JS(X)에서 Hono에 내장된 CSS입니다.

`css`라는 JavaScript 템플릿 리터럴의 JSX에 CSS를 쓸 수 있습니다. `css`의 반환 값은 클래스 속성 값으로 설정된 클래스 이름이 됩니다. 그러면 `<Style />` 구성요소에는 CSS 값이 포함됩니다.

## 가져오기

```ts
import { Hono } from 'hono'
import { css, cx, keyframes, Style } from 'hono/css'
```

## `css` <Badge style="vertical-align: middle;" type="warning" text="Experimental" />

`css` 템플릿 리터럴에 CSS를 쓸 수 있습니다. 이 경우 `headerClass`를 `class` 속성의 값으로 사용합니다. CSS 콘텐츠가 포함되어 있으므로 `<Style />`를 추가하는 것을 잊지 마세요.

```ts{10,13}
app.get('/', (c) => {
  const headerClass = css`
    background-color: orange;
    color: white;
    padding: 1rem;
  `
  return c.html(
    <html>
      <head>
        <Style />
      </head>
      <body>
        <h1 class={headerClass}>안녕하세요!</h1>
      </body>
    </html>
  )
})
```

[중첩 선택기](https://developer.mozilla.org/en-US/docs/Web/CSS/Nesting_selector), `&`를 사용하여 `:hover`와 같은 의사 클래스의 스타일을 지정할 수 있습니다.

```ts
const buttonClass = css`
  background-color: #fff;
  &:hover {
    background-color: red;
  }
`
```

### 확장

클래스 이름을 삽입하여 CSS 정의를 확장할 수 있습니다.

```tsx
const baseClass = css`
  color: white;
  background-color: blue;
`

const header1Class = css`
  ${baseClass}
  font-size: 3rem;
`

const header2Class = css`
  ${baseClass}
  font-size: 2rem;
`
```

또한 `${baseClass} {}` 구문을 사용하면 클래스 중첩이 가능합니다.

```tsx
const headerClass = css`
  color: white;
  background-color: blue;
`
const containerClass = css`
  ${headerClass} {
    h1 {
      font-size: 3rem;
    }
  }
`
return c.render(
  <div class={containerClass}>
    <header class={headerClass}>
      <h1>안녕하세요!</h1>
    </header>
  </div>
)
```

### 글로벌 스타일

`:-hono-global`라는 의사 선택기를 사용하면 전역 스타일을 정의할 수 있습니다.

```tsx
const globalClass = css`
  :-hono-global {
    html {
      font-family: Arial, Helvetica, sans-serif;
    }
  }
`

return c.render(
  <div class={globalClass}>
    <h1>안녕하세요!</h1>
    <p>오늘은 좋은 날이다.</p>
  </div>
)
```

또는 `css` 리터럴을 사용하여 `<Style />` 구성 요소에 CSS를 작성할 수 있습니다.

```tsx
export const renderer = jsxRenderer(({ children, title }) => {
  return (
    <html>
      <head>
        <Style>{css`
          html {
            font-family: Arial, Helvetica, sans-serif;
          }
        `}</Style>
        <title>{title}</title>
      </head>
      <body>
        <div>{children}</div>
      </body>
    </html>
  )
})
```

## `keyframes` <Badge style="vertical-align: middle;" type="warning" text="Experimental" />

`keyframes`를 사용하여 `@keyframes`의 내용을 쓸 수 있습니다. 이 경우 애니메이션 이름은 `fadeInAnimation`가 됩니다.

```tsx
const fadeInAnimation = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`
const headerClass = css`
  animation-name: ${fadeInAnimation};
  animation-duration: 2s;
`
const Header = () => <a class={headerClass}>안녕하세요!</a>
```

## `cx` <Badge style="vertical-align: middle;" type="warning" text="Experimental" />

`cx`는 두 클래스 이름을 합성합니다.

```tsx
const buttonClass = css`
  border-radius: 10px;
`
const primaryClass = css`
  background: orange;
`
const Button = () => (
  <a class={cx(buttonClass, primaryClass)}>딸깍 하는 소리!</a>
)
```

간단한 문자열을 구성할 수도 있습니다.

```tsx
const Header = () => <a class={cx('h1', primaryClass)}>안녕</a>
```

## [Secure Headers](/docs/middleware/builtin/secure-headers) 미들웨어와 함께 사용

CSS 도우미를 [보안 헤더](/docs/middleware/builtin/secure-headers) 미들웨어와 함께 사용하려면 `<Style nonce={c.get('secureHeadersNonce')} />`에 [`nonce` 속성](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/nonce)을 추가하여 CSS 도우미로 인한 콘텐츠 보안 정책을 방지할 수 있습니다.

```tsx{8,23}
import { secureHeaders, NONCE } from 'hono/secure-headers'

app.get(
  '*',
  secureHeaders({
    contentSecurityPolicy: {
      // 사전 정의된 nonce 값을 `styleSrc`로 설정합니다.
      styleSrc: [NONCE],
    },
  })
)

app.get('/', (c) => {
  const headerClass = css`
    background-color: orange;
    color: white;
    padding: 1rem;
  `
  return c.html(
    <html>
      <head>
        {/* Set the `nonce` attribute on the css helpers `style` and `script` elements */}
        <Style nonce={c.get('secureHeadersNonce')} />
      </head>
      <body>
        <h1 class={headerClass}>안녕하세요!</h1>
      </body>
    </html>
  )
})
```

## 팁

VS Code를 사용하는 경우 구문 강조를 위해 [vscode-styled-comComponents](https://marketplace.visualstudio.com/items?itemName=styled-components.vscode-styled-components)를 사용하고 CSS 태그 리터럴을 위해 IntelliSense를 사용할 수 있습니다.

![](/images/css-ss.png)
