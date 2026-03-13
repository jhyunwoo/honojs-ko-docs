# Service Worker

[Service Worker](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)는 캐싱 및 푸시 알림과 같은 작업을 처리하기 위해 브라우저 백그라운드에서 실행되는 스크립트입니다. Service Worker 어댑터를 사용하면 Hono로 만든 애플리케이션을 브라우저 내에서 [FetchEvent](https://developer.mozilla.org/en-US/docs/Web/API/FetchEvent) 핸들러로 실행할 수 있습니다.

이 페이지에서는 [Vite](https://vitejs.dev/)를 사용하여 프로젝트를 생성하는 예를 보여줍니다.

## 1. 설정

먼저 프로젝트 디렉터리를 만들고 이동합니다.

```sh
mkdir my-app
cd my-app
```

프로젝트에 필요한 파일을 생성합니다. 다음을 사용하여 `package.json` 파일을 만듭니다.

```json
{
  "name": "my-app",
  "private": true,
  "scripts": {
    "dev": "vite dev"
  },
  "type": "module"
}
```

마찬가지로 다음을 사용하여 `tsconfig.json` 파일을 만듭니다.

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "WebWorker"],
    "moduleResolution": "bundler"
  },
  "include": ["./"],
  "exclude": ["node_modules"]
}
```

다음으로 필요한 모듈을 설치합니다.

::: code-group

```sh [npm]
npm i hono
npm i -D vite
```

```sh [yarn]
yarn add hono
yarn add -D vite
```

```sh [pnpm]
pnpm add hono
pnpm add -D vite
```

```sh [bun]
bun add hono
bun add -D vite
```

:::

## 2. 헬로 월드

`index.html` 편집:

```html
<!doctype html>
<html>
  <body>
    <a href="/sw">안녕하세요 세계 by Service Worker</a>
    <script type="module" src="/main.ts"></script>
  </body>
</html>
```

`main.ts`는 Service Worker를 등록하는 스크립트입니다.

```ts
function register() {
  navigator.serviceWorker
    .register('/sw.ts', { scope: '/sw', type: 'module' })
    .then(
      function (_registration) {
        console.log('Register Service Worker: Success')
      },
      function (_error) {
        console.log('Register Service Worker: Error')
      }
    )
}
function start() {
  navigator.serviceWorker
    .getRegistrations()
    .then(function (registrations) {
      for (const registration of registrations) {
        console.log('Service Worker 등록 취소')
        registration.unregister()
      }
      register()
    })
}
start()
```

`sw.ts`에서 Hono를 사용하여 애플리케이션을 생성하고 Service Worker 어댑터의 `handle` 기능을 사용하여 `fetch` 이벤트에 등록합니다. 이를 통해 Hono 애플리케이션이 `/sw`에 대한 액세스를 차단할 수 있습니다.

```ts
// 유형을 지원하려면
// https://github.com/microsoft/TypeScript/issues/14877
declare const self: ServiceWorkerGlobalScope

import { Hono } from 'hono'
import { handle } from 'hono/service-worker'

const app = new Hono().basePath('/sw')
app.get('/', (c) => c.text('안녕하세요 세계'))

self.addEventListener('fetch', handle(app))
```

### `fire()` 사용

`fire()` 함수는 자동으로 `addEventListener('fetch', handle(app))`를 호출하여 코드를 더욱 간결하게 만듭니다.

```ts
import { Hono } from 'hono'
import { fire } from 'hono/service-worker'

const app = new Hono().basePath('/sw')
app.get('/', (c) => c.text('안녕하세요 세계'))

fire(app)
```

## 3. 실행

개발 서버를 시작합니다.

::: code-group

```sh [npm]
npm run dev
```

```sh [yarn]
yarn dev
```

```sh [pnpm]
pnpm run dev
```

```sh [bun]
bun run dev
```

:::

기본적으로 개발 서버는 `5173` 포트에서 실행됩니다. 브라우저에서 `http://localhost:5173/`에 접속하여 Service Worker 등록을 완료하세요. 그런 다음 `/sw`에 액세스하여 Hono 애플리케이션의 응답을 확인하세요.
