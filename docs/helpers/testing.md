# 테스트 도우미

테스트 도우미는 Hono 애플리케이션을 더 쉽게 테스트할 수 있는 기능을 제공합니다.

## 가져오기

```ts
import { Hono } from 'hono'
import { testClient } from 'hono/testing'
```

## `testClient()`

`testClient()` 함수는 Hono 인스턴스를 첫 번째 인수로 사용하고 [Hono 클라이언트](/docs/guides/rpc#client)와 유사하게 Hono 애플리케이션의 경로에 따라 유형이 지정된 객체를 반환합니다. 이를 통해 테스트 내 편집기 자동 완성을 통해 유형이 안전한 방식으로 정의된 경로를 호출할 수 있습니다.

**유형 추론에 대한 중요 참고 사항:**

`testClient`가 경로 유형을 올바르게 추론하고 자동 완성을 제공하려면 **`Hono` 인스턴스에서 직접 연결된 메서드를 사용하여 경로를 정의해야 합니다**.

유형 추론은 연결된 `.get()`, `.post()` 등의 호출을 통해 흐르는 유형에 따라 달라집니다. Hono 인스턴스를 생성한 후 별도로 경로를 정의하는 경우(예: "Hello World" 예에 표시된 공통 패턴: `const app = new Hono(); app.get(...)`) `testClient`에는 특정 경로에 필요한 유형 정보가 없으며 유형이 안전한 클라이언트 기능을 얻을 수 없습니다.

**예:**

이 예제는 `.get()` 메서드가 `new Hono()` 호출에 직접 연결되어 있기 때문에 작동합니다.

```ts
// index.ts
const app = new Hono().get('/search', (c) => {
  const query = c.req.query('q')
  return c.json({ query: query, results: ['result1', 'result2'] })
})

export default app
```

```ts
// index.test.ts
import { Hono } from 'hono'
import { testClient } from 'hono/testing'
import { describe, it, expect } from 'vitest' // Or your preferred test runner
import app from './app'

describe('엔드포인트 검색', () => {
  // 앱 인스턴스에서 테스트 클라이언트 만들기
  const client = testClient(app)

  it('검색 결과를 반환해야 합니다', async () => {
    // 형식화된 클라이언트를 사용하여 엔드포인트 호출
    // 쿼리 매개변수의 유형 안전성에 유의하세요(경로에 정의된 경우).
    // .$get()을 통한 직접 액세스
    const res = await client.search.$get({
      query: { q: 'hono' },
    })

    // 주장
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({
      query: 'hono',
      results: ['result1', 'result2'],
    })
  })
})
```

테스트에 헤더를 포함하려면 헤더를 호출의 두 번째 매개변수로 전달하세요. 두 번째 매개변수는 `init` 속성을 `RequestInit` 개체로 사용하여 헤더, 메서드, 본문 등을 설정할 수도 있습니다. [여기](/docs/guides/rpc#init-option) `init` 속성에 대해 자세히 알아보세요.

```ts
// index.test.ts
import { Hono } from 'hono'
import { testClient } from 'hono/testing'
import { describe, it, expect } from 'vitest' // Or your preferred test runner
import app from './app'

describe('엔드포인트 검색', () => {
  // 앱 인스턴스에서 테스트 클라이언트 만들기
  const client = testClient(app)

  it('검색 결과를 반환해야 합니다', async () => {
    // 헤더에 토큰을 포함하고 콘텐츠 유형을 설정합니다.
    const token = 'this-is-a-very-clean-token'
    const res = await client.search.$get(
      {
        query: { q: 'hono' },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': `application/json`,
        },
      }
    )

    // 주장
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({
      query: 'hono',
      results: ['result1', 'result2'],
    })
  })
})
```
