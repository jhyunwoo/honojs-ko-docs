# Lambda@Edge

[Lambda@Edge](https://aws.amazon.com/lambda/edge/)는 Amazon Web Services의 서버리스 플랫폼입니다. 이를 통해 Amazon CloudFront의 엣지 로케이션에서 Lambda 함수를 실행하여 HTTP 요청/응답에 대한 동작을 사용자 지정할 수 있습니다.

Hono는 Node.js 18+ 환경에서 Lambda@Edge를 지원합니다.

## 1. 설정

Lambda@Edge에서 애플리케이션을 생성할 때,
[CDK](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-cdk.html)
CloudFront, IAM 역할, API 게이트웨이 등과 같은 기능을 설정하는 데 유용합니다.

`cdk` CLI를 사용하여 프로젝트를 초기화합니다.

::: code-group

```sh [npm]
mkdir my-app
cd my-app
cdk init app -l typescript
npm i hono
mkdir lambda
```

```sh [yarn]
mkdir my-app
cd my-app
cdk init app -l typescript
yarn add hono
mkdir lambda
```

```sh [pnpm]
mkdir my-app
cd my-app
cdk init app -l typescript
pnpm add hono
mkdir lambda
```

```sh [bun]
mkdir my-app
cd my-app
cdk init app -l typescript
bun add hono
mkdir lambda
```

:::

## 2. 헬로 월드

`lambda/index_edge.ts`를 편집하세요.

```ts
import { Hono } from 'hono'
import { handle } from 'hono/lambda-edge'

const app = new Hono()

app.get('/', (c) => c.text('Lambda@Edge의 Hono님, 안녕하세요!'))

export const handler = handle(app)
```

## 3. 배포

`bin/my-app.ts`를 편집하세요.

```ts
#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { MyAppStack } from '../lib/my-app-stack'

const app = new cdk.App()
new MyAppStack(app, 'MyAppStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: 'us-east-1',
  },
})
```

`lambda/cdk-stack.ts`를 편집하세요.

```ts
import { Construct } from 'constructs'
import * as cdk from 'aws-cdk-lib'
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront'
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import * as s3 from 'aws-cdk-lib/aws-s3'

export class MyAppStack extends cdk.Stack {
  public readonly edgeFn: lambda.Function

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)
    const edgeFn = new NodejsFunction(this, 'edgeViewer', {
      entry: 'lambda/index_edge.ts',
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_20_X,
    })

    // HTML을 업로드하세요.
    const originBucket = new s3.Bucket(this, 'originBucket')

    new cloudfront.Distribution(this, 'Cdn', {
      defaultBehavior: {
        origin: new origins.S3Origin(originBucket),
        edgeLambdas: [
          {
            functionVersion: edgeFn.currentVersion,
            eventType: cloudfront.LambdaEdgeEventType.VIEWER_REQUEST,
          },
        ],
      },
    })
  }
}
```

마지막으로 다음 명령을 실행하여 배포합니다.

```sh
cdk deploy
```

## 콜백

Basic Auth를 추가하고 검증 후 요청 처리를 계속하려면 `c.env.callback()`를 사용하면 됩니다.

```ts
import { Hono } from 'hono'
import { basicAuth } from 'hono/basic-auth'
import type { Callback, CloudFrontRequest } from 'hono/lambda-edge'
import { handle } from 'hono/lambda-edge'

type Bindings = {
  callback: Callback
  request: CloudFrontRequest
}

const app = new Hono<{ Bindings: Bindings }>()

app.get(
  '*',
  basicAuth({
    username: 'hono',
    password: 'acoolproject',
  })
)

app.get('/', async (c, next) => {
  await next()
  c.env.callback(null, c.env.request)
})

export const handler = handle(app)
```
