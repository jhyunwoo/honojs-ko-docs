# Cloudflare Durable Objects

Cloudflare 지속성 개체는 HTTP 요청을 직접 처리할 수 없습니다. 대신 다음과 같은 두 단계 프로세스를 통해 작업합니다.

1. 작업자는 클라이언트로부터 HTTP 가져오기 요청을 받습니다.
2. 작업자는 지속성 개체에 대해 RPC(원격 프로시저 호출) 호출을 수행합니다.
3. 지속성 개체는 RPC를 처리하고 결과를 작업자에게 반환합니다.
4. 작업자는 HTTP 응답을 클라이언트에 다시 보냅니다.

Hono를 Cloudflare 작업자의 라우터로 사용하여 RPC(원격 프로시저 호출)를 호출하여 [내구성 개체](https://developers.cloudflare.com/durable-objects/)와 상호 작용할 수 있습니다. 이는 Cloudflare Workers 호환성 날짜 `2024-04-03` 기준으로 권장되는 접근 방식입니다.

## 예: 카운터 내구성 개체

```ts
import { DurableObject } from 'cloudflare:workers'
import { Hono } from 'hono'

export class Counter extends DurableObject {
  // 메모리 내 상태
  value = 0

  constructor(ctx: DurableObjectState, env: unknown) {
    super(ctx, env)

    // `blockConcurrencyWhile()`는 초기화가 완료될 때까지 요청이 전달되지 않도록 합니다.
    ctx.blockConcurrencyWhile(async () => {
      // 초기화 후 향후 읽기에서는 스토리지에 액세스할 필요가 없습니다.
      this.value = (await ctx.storage.get('value')) || 0
    })
  }

  async getCounterValue() {
    return this.value
  }

  async increment(amount = 1): Promise<number> {
    this.value += amount
    await this.ctx.storage.put('value', this.value)
    return this.value
  }

  async decrement(amount = 1): Promise<number> {
    this.value -= amount
    await this.ctx.storage.put('value', this.value)
    return this.value
  }
}

// 들어오는 HTTP 요청을 처리하기 위해 새로운 Hono 앱을 만듭니다.
type Bindings = {
  COUNTER: DurableObjectNamespace<Counter>
}

const app = new Hono<{ Bindings: Bindings }>()

// 지속성 개체와 상호 작용하는 경로를 추가합니다.
app.get('/counter', async (c) => {
  const env = c.env
  const id = env.COUNTER.idFromName('counter')
  const stub = env.COUNTER.get(id)
  const counterValue = await stub.getCounterValue()
  return c.text(counterValue.toString())
})

app.post('/counter/increment', async (c) => {
  const env = c.env
  const id = env.COUNTER.idFromName('counter')
  const stub = env.COUNTER.get(id)
  const value = await stub.increment()
  return c.text(value.toString())
})

app.post('/counter/decrement', async (c) => {
  const env = c.env
  const id = env.COUNTER.idFromName('counter')
  const stub = env.COUNTER.get(id)
  const value = await stub.decrement()
  return c.text(value.toString())
})

// Hono 앱을 작업자의 가져오기 핸들러로 내보내기
export default app
```

`wrangler.jsonc`:

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "durable",
  "main": "src/index.ts",
  "compatibility_date": "2025-04-14",
  "migrations": [
    {
      "new_sqlite_classes": ["Counter"],
      "tag": "v1",
    },
  ],
  "durable_objects": {
    "bindings": [
      {
        "class_name": "Counter",
        "name": "COUNTER",
      },
    ],
  },
  "observability": {
    "enabled": true,
  },
}
```

이제 지속성 개체와 인터페이스하는 완전한 기능을 갖춘 Hono 애플리케이션이 생겼습니다! Hono 라우터는 내구성 개체의 메서드와 상호 작용하고 노출하기 위한 깔끔한 API 인터페이스를 제공합니다.
