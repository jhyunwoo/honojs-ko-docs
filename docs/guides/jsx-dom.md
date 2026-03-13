# 클라이언트 구성요소

`hono/jsx`는 서버 측뿐만 아니라 클라이언트 측도 지원합니다. 이는 브라우저에서 실행되는 대화형 UI를 만드는 것이 가능하다는 것을 의미합니다. 우리는 이를 클라이언트 구성 요소 또는 `hono/jsx/dom`라고 부릅니다.

빠르고 매우 작습니다. `hono/jsx/dom`의 카운터 프로그램은 Brotli 압축을 사용하면 2.8KB에 불과합니다. 하지만 React의 경우 47.8KB입니다.

이 섹션에서는 클라이언트 구성 요소별 기능을 소개합니다.

## 반대 예

다음은 간단한 카운터의 예입니다. React에서와 동일한 코드가 작동합니다.

```tsx
import { useState } from 'hono/jsx'
import { render } from 'hono/jsx/dom'

function Counter() {
  const [count, setCount] = useState(0)
  return (
    <div>
      <p>개수: {count}</p>
      <button onClick={() =>setCount(count + 1)}>증분</button>
    </div>
  )
}

function App() {
  return (
    <html>
      <body>
        <Counter />
      </body>
    </html>
  )
}

const root = document.getElementById('root')
render(<App />, root)
```

## `render()`

`render()`를 사용하여 지정된 HTML 요소 내에 JSX 구성요소를 삽입할 수 있습니다.

```tsx
render(<Component />, container)
```

여기에서 전체 예제 코드를 볼 수 있습니다: [카운터 예제](https://github.com/honojs/examples/tree/main/hono-vite-jsx).

## React와 호환되는 Hook

hono/jsx/dom에는 React와 호환되거나 부분적으로 호환되는 Hook이 있습니다. [React 문서](https://react.dev/reference/react/hooks)를 보면 이러한 API에 대해 알아볼 수 있습니다.

- `useState()`
- `useEffect()`
- `useRef()`
- `useCallback()`
- `use()`
- `startTransition()`
- `useTransition()`
- `useDeferredValue()`
- `useMemo()`
- `useLayoutEffect()`
- `useReducer()`
- `useDebugValue()`
- `createElement()`
- `memo()`
- `isValidElement()`
- `useId()`
- `createRef()`
- `forwardRef()`
- `useImperativeHandle()`
- `useSyncExternalStore()`
- `useInsertionEffect()`
- `useFormStatus()`
- `useActionState()`
- `useOptimistic()`

## `startViewTransition()` 제품군

`startViewTransition()` 제품군에는 [보기 전환 API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API)를 쉽게 처리할 수 있는 원래 후크와 기능이 포함되어 있습니다. 다음은 이를 사용하는 방법의 예입니다.

### 1. 가장 쉬운 예

`startViewTransition()`와 함께 `document.startViewTransition`를 사용하여 전환을 작성할 수 있습니다.

```tsx
import { useState, startViewTransition } from 'hono/jsx'
import { css, Style } from 'hono/css'

export default function App() {
  const [showLargeImage, setShowLargeImage] = useState(false)
  return (
    <>
      <Style />
      <button
        onClick={() =>
          startViewTransition(() =>
            setShowLargeImage((state) => !state)
          )
        }
      >
        Click!
      </button>
      <div>
        {!showLargeImage ? (
          <img src='https://hono.dev/images/logo.png' />
        ) : (
          <div
            class={css`
              background: url('https://hono.dev/images/logo-large.png');
              background-size: contain;
              background-repeat: no-repeat;
              background-position: center;
              width: 600px;
              height: 600px;
            `}
          ></div>
        )}
      </div>
    </>
  )
}
```

### 2. `keyframes()`와 함께 `viewTransition()` 사용

`viewTransition()` 기능을 사용하면 고유한 `view-transition-name`를 얻을 수 있습니다.

`keyframes()`와 함께 사용할 수 있으며, `::view-transition-old()`는 `::view-transition-old(${uniqueName))`로 변환됩니다.

```tsx
import { useState, startViewTransition } from 'hono/jsx'
import { viewTransition } from 'hono/jsx/dom/css'
import { css, keyframes, Style } from 'hono/css'

const rotate = keyframes`
  from {
    rotate: 0deg;
  }
  to {
    rotate: 360deg;
  }
`

export default function App() {
  const [showLargeImage, setShowLargeImage] = useState(false)
  const [transitionNameClass] = useState(() =>
    viewTransition(css`
      ::view-transition-old() {
        animation-name: ${rotate};
      }
      ::view-transition-new() {
        animation-name: ${rotate};
      }
    `)
  )
  return (
    <>
      <Style />
      <button
        onClick={() =>
          startViewTransition(() =>
            setShowLargeImage((state) => !state)
          )
        }
      >
        Click!
      </button>
      <div>
        {!showLargeImage ? (
          <img src='https://hono.dev/images/logo.png' />
        ) : (
          <div
            class={css`
              ${transitionNameClass}
              background: url('https://hono.dev/images/logo-large.png');
              background-size: contain;
              background-repeat: no-repeat;
              background-position: center;
              width: 600px;
              height: 600px;
            `}
          ></div>
        )}
      </div>
    </>
  )
}
```

### 3. `useViewTransition` 사용

애니메이션 중에만 스타일을 변경하려는 경우. `useViewTransition()`를 사용할 수 있습니다. 이 후크는 `[boolean, (callback: () => void) => void]`를 반환하며 `isUpdating` 플래그와 `startViewTransition()` 함수입니다.

이 후크를 사용하면 구성 요소가 다음 두 번 평가됩니다.

- `startViewTransition()` 호출의 콜백 내부.
- [`finish` 약속이 이루어지면](https://developer.mozilla.org/en-US/docs/Web/API/ViewTransition/finished)

```tsx
import { useState, useViewTransition } from 'hono/jsx'
import { viewTransition } from 'hono/jsx/dom/css'
import { css, keyframes, Style } from 'hono/css'

const rotate = keyframes`
  from {
    rotate: 0deg;
  }
  to {
    rotate: 360deg;
  }
`

export default function App() {
  const [isUpdating, startViewTransition] = useViewTransition()
  const [showLargeImage, setShowLargeImage] = useState(false)
  const [transitionNameClass] = useState(() =>
    viewTransition(css`
      ::view-transition-old() {
        animation-name: ${rotate};
      }
      ::view-transition-new() {
        animation-name: ${rotate};
      }
    `)
  )
  return (
    <>
      <Style />
      <button
        onClick={() =>
          startViewTransition(() =>
            setShowLargeImage((state) => !state)
          )
        }
      >
        Click!
      </button>
      <div>
        {!showLargeImage ? (
          <img src='https://hono.dev/images/logo.png' />
        ) : (
          <div
            class={css`
              ${transitionNameClass}
              background: url('https://hono.dev/images/logo-large.png');
              background-size: contain;
              background-repeat: no-repeat;
              background-position: center;
              width: 600px;
              height: 600px;
              position: relative;
              ${isUpdating &&
              css`
                &:before {
                  content: '로드 중...';
                  position: absolute;
                  top: 50%;
                  left: 50%;
                }
              `}
            `}
          ></div>
        )}
      </div>
    </>
  )
}
```

## `hono/jsx/dom` 런타임

클라이언트 구성 요소에 대한 작은 JSX 런타임이 있습니다. 이를 사용하면 `hono/jsx`를 사용하는 것보다 bundled 결과가 더 작아집니다. `tsconfig.json`에 `hono/jsx/dom`를 지정합니다. Deno의 경우 deno.json을 수정합니다.

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "hono/jsx/dom"
  }
}
```

또는 `vite.config.ts`의 esbuild 변환 옵션에서 `hono/jsx/dom`를 지정할 수 있습니다.

```ts
import { defineConfig } from 'vite'

export default defineConfig({
  esbuild: {
    jsxImportSource: 'hono/jsx/dom',
  },
})
```
