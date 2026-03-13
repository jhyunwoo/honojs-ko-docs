# Alibaba Cloud 기능 컴퓨팅

[Alibaba Cloud Function Compute](https://www.alibabacloud.com/en/product/function-compute)는 완전 관리형 이벤트 기반 컴퓨팅 서비스입니다. Function Compute를 사용하면 서버와 같은 인프라를 관리할 필요 없이 코드 작성 및 업로드에 집중할 수 있습니다.

이 가이드에서는 타사 어댑터 [rwv/hono-alibaba-cloud-fc3-adapter](https://github.com/rwv/hono-alibaba-cloud-fc3-adapter)를 사용하여 Alibaba Cloud Function Compute에서 Hono를 실행합니다.

## 1. 설정

::: code-group

```sh [npm]
mkdir my-app
cd my-app
npm i hono hono-alibaba-cloud-fc3-adapter
npm i -D @serverless-devs/s esbuild
mkdir src
touch src/index.ts
```

```sh [yarn]
mkdir my-app
cd my-app
yarn add hono hono-alibaba-cloud-fc3-adapter
yarn add -D @serverless-devs/s esbuild
mkdir src
touch src/index.ts
```

```sh [pnpm]
mkdir my-app
cd my-app
pnpm add hono hono-alibaba-cloud-fc3-adapter
pnpm add -D @serverless-devs/s esbuild
mkdir src
touch src/index.ts
```

```sh [bun]
mkdir my-app
cd my-app
bun add hono hono-alibaba-cloud-fc3-adapter
bun add -D esbuild @serverless-devs/s
mkdir src
touch src/index.ts
```

:::

## 2. 헬로 월드

`src/index.ts`를 편집하세요.

```ts
import { Hono } from 'hono'
import { handle } from 'hono-alibaba-cloud-fc3-adapter'

const app = new Hono()

app.get('/', (c) => c.text('안녕하세요 Hono!'))

export const handler = handle(app)
```

## 3. 서버리스 개발자 설정

> [serverless-devs](https://github.com/Serverless-Devs/Serverless-Devs)는 개발자에게 강력한 도구 체인 시스템을 제공하는 데 전념하는 오픈 소스 및 개방형 서버리스 개발자 플랫폼입니다. 이 플랫폼을 통해 개발자는 원클릭으로 멀티 클라우드 서버리스 제품을 경험하고 서버리스 프로젝트를 신속하게 배포할 수 있을 뿐만 아니라 서버리스 애플리케이션의 전체 라이프사이클에서 프로젝트를 관리할 수 있으며, 서버리스 개발자를 다른 도구/플랫폼과 매우 간단하고 빠르게 결합하여 R&D, 운영 및 유지 관리의 효율성을 더욱 향상시킬 수 있습니다.

Alibaba Cloud AccessKeyID 및 AccessKeySecret 추가

```sh
npx s config add
# Please select a provider: Alibaba Cloud (alibaba)
# Input your AccessKeyID & AccessKeySecret
```

`s.yaml` 편집

```yaml
edition: 3.0.0
name: my-app
access: 'default'

vars:
  region: 'us-west-1'

resources:
  my-app:
    component: fc3
    props:
      region: ${vars.region}
      functionName: 'my-app'
      description: 'Hello World by Hono'
      runtime: 'nodejs20'
      code: ./dist
      handler: index.handler
      memorySize: 1024
      timeout: 300
```

`package.json`에서 `scripts` 섹션을 편집합니다.

```json
{
  "scripts": {
    "build": "esbuild --bundle --outfile=./dist/index.js --platform=node --target=node20 ./src/index.ts",
    "deploy": "s deploy -y"
  }
}
```

## 4. 배포

마지막으로 다음 명령을 실행하여 배포합니다.

```sh
npm run build # Compile the TypeScript code to JavaScript
npm run deploy # Deploy the function to Alibaba Cloud Function Compute
```
