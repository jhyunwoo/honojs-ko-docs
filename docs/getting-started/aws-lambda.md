# AWS 람다

AWS Lambda는 Amazon Web Services의 서버리스 플랫폼입니다.
이벤트에 대한 응답으로 코드를 실행하고 기본 컴퓨팅 리소스를 자동으로 관리할 수 있습니다.

Hono는 Node.js 18+ 환경의 AWS Lambda에서 작동합니다.

## 1. 설정

AWS Lambda에서 애플리케이션을 생성할 때,
[CDK](https://docs.aws.amazon.com/cdk/v2/guide/home.html)
IAM 역할, API 게이트웨이 등과 같은 기능을 설정하는 데 유용합니다.

`cdk` CLI를 사용하여 프로젝트를 초기화합니다.

::: code-group

```sh [npm]
mkdir my-app
cd my-app
cdk init app -l typescript
npm i hono
npm i -D esbuild
mkdir lambda
touch lambda/index.ts
```

```sh [yarn]
mkdir my-app
cd my-app
cdk init app -l typescript
yarn add hono
yarn add -D esbuild
mkdir lambda
touch lambda/index.ts
```

```sh [pnpm]
mkdir my-app
cd my-app
cdk init app -l typescript
pnpm add hono
pnpm add -D esbuild
mkdir lambda
touch lambda/index.ts
```

```sh [bun]
mkdir my-app
cd my-app
cdk init app -l typescript
bun add hono
bun add -D esbuild
mkdir lambda
touch lambda/index.ts
```

:::

## 2. 헬로 월드

`lambda/index.ts`를 편집하세요.

```ts
import { Hono } from 'hono'
import { handle } from 'hono/aws-lambda'

const app = new Hono()

app.get('/', (c) => c.text('안녕하세요 Hono!'))

export const handler = handle(app)
```

## 3. 배포

`lib/my-app-stack.ts`를 편집하세요.

```ts
import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'

export class MyAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    const fn = new NodejsFunction(this, 'lambda', {
      entry: 'lambda/index.ts',
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_22_X,
    })
    const fnUrl = fn.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE,
    })
    new cdk.CfnOutput(this, 'lambdaUrl', {
      value: fnUrl.url!,
    })
  }
}
```

마지막으로 다음 명령을 실행하여 배포합니다.

```sh
cdk deploy
```

## 바이너리 데이터 제공

Hono는 바이너리 데이터를 응답으로 지원합니다.
Lambda에서는 이진 데이터를 반환하려면 base64 인코딩이 필요합니다.
바이너리 유형이 `Content-Type` 헤더로 설정되면 Hono는 자동으로 데이터를 base64로 인코딩합니다.

```ts
app.get('/binary', async (c) => {
  // ...
  c.status(200)
  c.header('Content-Type', 'image/png') // means binary data
  return c.body(buffer) // supports `ArrayBufferLike` type, encoded to base64.
})
```

## AWS Lambda 객체에 액세스

Hono에서는 `LambdaEvent`, `LambdaContext` 유형을 바인딩하고 `c.env`를 사용하여 AWS Lambda 이벤트 및 컨텍스트에 액세스할 수 있습니다.

```ts
import { Hono } from 'hono'
import type { LambdaEvent, LambdaContext } from 'hono/aws-lambda'
import { handle } from 'hono/aws-lambda'

type Bindings = {
  event: LambdaEvent
  lambdaContext: LambdaContext
}

const app = new Hono<{ Bindings: Bindings }>()

app.get('/aws-lambda-info/', (c) => {
  return c.json({
    isBase64Encoded: c.env.event.isBase64Encoded,
    awsRequestId: c.env.lambdaContext.awsRequestId,
  })
})

export const handler = handle(app)
```

## 요청 컨텍스트에 액세스

Hono에서는 `LambdaEvent` 유형을 바인딩하고 `c.env.event.requestContext`를 사용하여 AWS Lambda 요청 컨텍스트에 액세스할 수 있습니다.

```ts
import { Hono } from 'hono'
import type { LambdaEvent } from 'hono/aws-lambda'
import { handle } from 'hono/aws-lambda'

type Bindings = {
  event: LambdaEvent
}

const app = new Hono<{ Bindings: Bindings }>()

app.get('/custom-context/', (c) => {
  const lambdaContext = c.env.event.requestContext
  return c.json(lambdaContext)
})

export const handler = handle(app)
```

### v3.10.0 이전(더 이상 사용되지 않음)

`ApiGatewayRequestContext` 유형을 바인딩하고 `c.env.`를 사용하여 AWS Lambda 요청 컨텍스트에 액세스할 수 있습니다.

```ts
import { Hono } from 'hono'
import type { ApiGatewayRequestContext } from 'hono/aws-lambda'
import { handle } from 'hono/aws-lambda'

type Bindings = {
  requestContext: ApiGatewayRequestContext
}

const app = new Hono<{ Bindings: Bindings }>()

app.get('/custom-context/', (c) => {
  const lambdaContext = c.env.requestContext
  return c.json(lambdaContext)
})

export const handler = handle(app)
```

## Lambda 응답 스트리밍

AWS Lambda의 호출 모드를 변경하면 [스트리밍 응답](https://aws.amazon.com/blogs/compute/introducing-aws-lambda-response-streaming/)을 얻을 수 있습니다.

```diff
fn.addFunctionUrl({
  authType: lambda.FunctionUrlAuthType.NONE,
+  invokeMode: lambda.InvokeMode.RESPONSE_STREAM,
})
```

일반적으로 구현하려면 awslambda.streamifyResponse를 사용하여 NodeJS.WritableStream에 청크를 작성해야 하지만 AWS Lambda Adapter를 사용하면 핸들 대신 streamHandle을 사용하여 Hono의 기존 스트리밍 응답을 얻을 수 있습니다.

```ts
import { Hono } from 'hono'
import { streamHandle } from 'hono/aws-lambda'
import { streamText } from 'hono/streaming'

const app = new Hono()

app.get('/stream', async (c) => {
  return streamText(c, async (stream) => {
    for (let i = 0; i < 3; i++) {
      await stream.writeln(`${i}`)
      await stream.sleep(1)
    }
  })
})

export const handler = streamHandle(app)
```
