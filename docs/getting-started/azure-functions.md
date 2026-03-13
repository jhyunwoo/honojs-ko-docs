# 애저 함수

[Azure Functions](https://azure.microsoft.com/en-us/products/functions)는 Microsoft Azure의 서버리스 플랫폼입니다. 이벤트에 대한 응답으로 코드를 실행할 수 있으며 기본 컴퓨팅 리소스가 자동으로 관리됩니다.

Hono는 처음에는 Azure Functions용으로 설계되지 않았습니다. 하지만 [Azure Functions Adapter](https://github.com/Marplex/hono-azurefunc-adapter)를 사용하면 해당 환경에서도 실행할 수 있습니다.

Node.js 18 이상에서 실행되는 Azure Functions **V4**와 함께 작동합니다.

## 1. CLI 설치

Azure Function을 만들려면 먼저 [Azure Functions Core Tools](https://learn.microsoft.com/en-us/azure/azure-functions/create-first-function-cli-typescript?pivots=nodejs-model-v4#install-the-azure-functions-core-tools)를 설치해야 합니다.

macOS에서

```sh
brew tap azure/functions
brew install azure-functions-core-tools@4
```

다른 OS의 경우 다음 링크를 따르세요.

- [Azure Functions 핵심 도구 설치 | 마이크로소프트 런](https://learn.microsoft.com/en-us/azure/azure-functions/create-first-function-cli-typescript?pivots=nodejs-model-v4#install-the-azure-functions-core-tools)

## 2. 설정

현재 폴더에 TypeScript Node.js V4 프로젝트를 만듭니다.

```sh
func init --typescript
```

호스트의 기본 경로 접두사를 변경합니다. `host.json`의 루트 json 객체에 이 속성을 추가합니다.

```json
"extensions": {
    "http": {
        "routePrefix": ""
    }
}
```

::: info
기본 Azure Functions 경로 접두사는 `/api`입니다. 위에 표시된 대로 변경하지 않으면 모든 Hono 경로를 `/api`로 시작해야 합니다.
:::

이제 다음을 사용하여 Hono 및 Azure Functions Adapter를 설치할 준비가 되었습니다.

::: code-group

```sh [npm]
npm i @marplex/hono-azurefunc-adapter hono
```

```sh [yarn]
yarn add @marplex/hono-azurefunc-adapter hono
```

```sh [pnpm]
pnpm add @marplex/hono-azurefunc-adapter hono
```

```sh [bun]
bun add @marplex/hono-azurefunc-adapter hono
```

:::

## 3. 헬로 월드

`src/app.ts` 생성:

```ts
// src/app.ts
import { Hono } from 'hono'
const app = new Hono()

app.get('/', (c) => c.text('안녕하세요 Azure Functions입니다!'))

export default app
```

`src/functions/httpTrigger.ts` 생성:

```ts
// src/functions/httpTrigger.ts
import { app } from '@azure/functions'
import { azureHonoHandler } from '@marplex/hono-azurefunc-adapter'
import honoApp from '../app'

app.http('httpTrigger', {
  methods: [
    //여기에 지원되는 모든 HTTP 메서드를 추가하세요.
    'GET',
    'POST',
    'DELETE',
    'PUT',
  ],
  authLevel: 'anonymous',
  route: '{*proxy}',
  handler: azureHonoHandler(honoApp.fetch),
})
```

## 4. 실행

개발 서버를 로컬에서 실행합니다. 그런 다음 웹 브라우저에서 `http://localhost:7071`에 액세스하십시오.

::: code-group

```sh [npm]
npm run start
```

```sh [yarn]
yarn start
```

```sh [pnpm]
pnpm start
```

```sh [bun]
bun run start
```

:::

## 5. 배포

::: info
Azure에 배포하려면 먼저 클라우드 인프라에 일부 리소스를 만들어야 합니다. [함수에 대한 지원 Azure 리소스 만들기](https://learn.microsoft.com/en-us/azure/azure-functions/create-first-function-cli-typescript?pivots=nodejs-model-v4&tabs=windows%2Cazure-cli%2Cbrowser#create-supporting-azure-resources-for-your-function)에 대한 Microsoft 설명서를 참조하세요.
:::

배포용 프로젝트를 빌드합니다.

::: code-group

```sh [npm]
npm run build
```

```sh [yarn]
yarn build
```

```sh [pnpm]
pnpm build
```

```sh [bun]
bun run build
```

:::

Azure Cloud의 함수 앱에 프로젝트를 배포합니다. `<YourFunctionAppName>`를 앱 이름으로 바꿉니다.

```sh
func azure functionapp publish <YourFunctionAppName>
```
