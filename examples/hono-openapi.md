# Hono OpenAPI

[hono-openapi](https://github.com/rhinobase/hono-openapi)는 Zod, Valibot, ArkType, TypeBox와 같은 검증 라이브러리와 [표준 스키마](https://standardschema.dev/)를 지원하는 모든 라이브러리를 통합하여 Hono API에 대한 자동 OpenAPI 문서 생성을 가능하게 하는 _미들웨어_입니다.

## 🛠️ 설치

원하는 유효성 검사 라이브러리 및 해당 종속 항목과 함께 패키지를 설치합니다.

```bash
npm install hono-openapi @hono/standard-validator
```

이 가이드에서는 `valibot`를 사용합니다.

```bash
npm install valibot @valibot/to-json-schema
```

여기에서 설치에 대해 자세히 알아볼 수 있습니다. <https://honohub.dev/docs/openapi#installation>

---

## 🚀 시작하기

### 1. 스키마 정의

선호하는 검증 라이브러리를 사용하여 요청 및 응답 스키마를 정의하세요. Valibot을 사용하는 예는 다음과 같습니다.

```ts
import * as v from 'valibot'

const querySchema = v.object({
  name: v.optional(v.string()),
})

const responseSchema = v.string()
```

---

### 2. 경로 생성

경로 문서화 및 검증을 위해 `describeRoute`를 사용하세요.

```ts
import { Hono } from 'hono'
import { describeRoute, resolver, validator } from 'hono-openapi'

const app = new Hono()

app.get(
  '/',
  describeRoute({
    description: '사용자에게 인사하기',
    responses: {
      200: {
        description: '성공적인 응답',
        content: {
          'text/plain': { schema: resolver(responseSchema) },
        },
      },
    },
  }),
  validator('query', querySchema),
  (c) => {
    const query = c.req.valid('query')
    return c.text(`Hello ${query?.name ?? 'Hono'}!`)
  }
)
```

> **메모:**
> `hono-openapi`에서 `validator()`를 사용하는 경우 `query`, `json`, `param` 또는 `form`에 대해 추가된 모든 검증이 자동으로 OpenAPI 요청 스키마에 포함됩니다.
> `describeRoute()` 내부에서 요청 매개변수를 수동으로 정의할 필요가 없습니다.

---

### 3. OpenAPI 사양 생성

OpenAPI 문서에 대한 엔드포인트를 추가합니다.

```ts
import { openAPIRouteHandler } from 'hono-openapi'

app.get(
  '/openapi',
  openAPIRouteHandler(app, {
    documentation: {
      info: {
        title: 'Hono API',
        version: '1.0.0',
        description: '인사말 API',
      },
      servers: [
        { url: 'http://localhost:3000', description: '로컬 서버' },
      ],
    },
  })
)
```

---

더 자세히 알아보려면 문서를 확인하세요. <https://honohub.dev/docs/openapi>
