# Cloudflare 테스트

`@cloudflare/vitest-pool-workers`를 사용하여 Cloudflare 테스트를 쉽게 구현할 수 있습니다. 이에 대한 일부 구성을 먼저 수행해야 하며 이에 대한 자세한 내용은 [Cloudflare 테스트 관련 문서](https://developers.cloudflare.com/workers/testing/vitest-integration/get-started/write-your-first-test/)에서 확인할 수 있습니다.

Cloudflare Testing with vitest pool workers는 런타임에 `cloudflare:test` 모듈을 제공하며, 테스트 시 두 번째 인수로 전달한 `env`를 노출합니다. 자세한 내용은 [Cloudflare Test APIs 섹션](https://developers.cloudflare.com/workers/testing/vitest-integration/test-apis/)을 참고하세요.

다음은 만들 수 있는 구성의 예입니다.

:::code-group

```ts [vitest.config.ts]
import { defineWorkersProject } from '@cloudflare/vitest-pool-workers/config'

export default defineWorkersProject(() => {
  return {
    test: {
      globals: true,
      poolOptions: {
        workers: { wrangler: { configPath: './wrangler.toml' } },
      },
    },
  }
})
```

```toml [wrangler.toml]
compatibility_date = "2024-09-09"
compatibility_flags = [ "nodejs_compat" ]

[vars]
MY_VAR = "my variable"
```

:::

다음과 같은 애플리케이션을 상상해 보세요.

```ts
// src/index.ts
import { Hono } from 'hono'

type Bindings = {
  MY_VAR: string
}

const app = new Hono<{ Bindings: Bindings }>()

app.get('/hello', (c) => {
  return c.json({ hello: 'world', var: c.env.MY_VAR })
})

export default app
```

`cloudflare:test` 모듈에서 노출된 `env`를 `app.request()`로 전달하여 Cloudflare 바인딩으로 애플리케이션을 테스트할 수 있습니다.

```ts
// src/index.test.ts
import { env } from 'cloudflare:test'
import app from './index'

describe('Example', () => {
  it('200 응답을 반환해야 합니다.', async () => {
    const res = await app.request('/hello', {}, env)

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({
      hello: 'world',
      var: 'my variable',
    })
  })
})
```

## 참조

`@cloudflare/vitest-pool-workers` [Github 저장소 예](https://github.com/cloudflare/workers-sdk/tree/main/fixtures/vitest-pool-workers-examples)\
[이전 테스트 시스템에서 마이그레이션](https://developers.cloudflare.com/workers/testing/vitest-integration/get-started/migrate-from-miniflare-2/)
