# 어댑터 도우미

Adapter Helper는 통합 인터페이스를 통해 다양한 플랫폼과 원활하게 상호 작용할 수 있는 방법을 제공합니다.

## 가져오기

```ts
import { Hono } from 'hono'
import { env, getRuntimeKey } from 'hono/adapter'
```

## `env()`

`env()` 함수는 Cloudflare Workers' 바인딩 이상으로 확장하여 다양한 런타임에서 환경 변수를 쉽게 검색할 수 있도록 해줍니다. `env(c)`로 검색할 수 있는 값은 런타임마다 다를 수 있습니다.

```ts
import { env } from 'hono/adapter'

app.get('/env', (c) => {
  // 이름은 Node.js 또는 Bun의 process.env.NAME입니다.
  // NAME은 Cloudflare의 `wrangler.toml`에 작성된 값입니다.
  const { NAME } = env<{ NAME: string }>(c)
  return c.text(NAME)
})
```

지원되는 런타임, 서버리스 플랫폼 및 클라우드 서비스:

- Cloudflare Workers
  - `wrangler.toml`
  - `wrangler.jsonc`
- Deno
  - [`Deno.env`](https://docs.deno.com/runtime/manual/basics/env_variables)
  - `.env` 파일
- Bun
  - [`Bun.env`](https://bun.com/guides/runtime/set-env)
  - `process.env`
- Node.js
  - `process.env`
- Vercel
  - [Vercel의 환경 변수](https://vercel.com/docs/projects/environment-variables)
- AWS 람다
  - [AWS Lambda의 환경 변수](https://docs.aws.amazon.com/lambda/latest/dg/samples-blank.html#samples-blank-architecture)
- Lambda@Edge\
Lambda의 환경 변수는 Lambda@Edge에 의해 [지원되지 않음](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/add-origin-custom-headers.html), 대신 [Lamdba@Edge 이벤트](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/lambda-event-structure.html)를 사용해야 합니다.
- Fastly Compute\
Fastly Compute에서는 ConfigStore를 사용하여 사용자 정의 데이터를 관리할 수 있습니다.
- Netlify\
Netlify에서는 [Netlify 컨텍스트](https://docs.netlify.com/site-deploys/overview/#deploy-contexts)를 사용하여 사용자 정의 데이터를 관리할 수 있습니다.

### 런타임 지정

런타임 키를 두 번째 인수로 전달하여 환경 변수를 가져오도록 런타임을 지정할 수 있습니다.

```ts
app.get('/env', (c) => {
  const { NAME } = env<{ NAME: string }>(c, 'workerd')
  return c.text(NAME)
})
```

## `getRuntimeKey()`

`getRuntimeKey()` 함수는 현재 런타임의 식별자를 반환합니다.

```ts
app.get('/', (c) => {
  if (getRuntimeKey() === 'workerd') {
    return c.text('현재 위치: Cloudflare')
  } else if (getRuntimeKey() === 'bun') {
    return c.text('현재 위치: Bun')
  }
  ...
})
```

### 사용 가능한 런타임 키

사용 가능한 런타임 키는 다음과 같습니다. 사용할 수 없는 런타임 키 런타임은 지원되고 `other`로 표시될 수 있으며 일부는 [WinterCG의 런타임 키](https://runtime-keys.proposal.wintercg.org/)에서 영감을 받았습니다.

- `workerd` - Cloudflare Workers
- `deno`
- `bun`
- `node`
- `edge-light` - Vercel 에지 기능
- `fastly` - Fastly Compute
- `other` - 기타 알 수 없는 런타임 키
