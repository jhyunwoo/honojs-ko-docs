# Zod OpenAPI

[Zod OpenAPI Hono](https://github.com/honojs/middleware/tree/main/packages/zod-openapi)는 OpenAPI를 지원하는 확장된 Hono 클래스입니다.
이를 통해 [Zod](https://zod.dev/)를 사용하여 값과 유형을 검증하고 OpenAPI Swagger 문서를 생성할 수 있습니다. 본 웹사이트에서는 기본적인 사용법만 보여드립니다.

먼저 Zod를 사용하여 스키마를 정의합니다. `z` 객체는 `@hono/zod-openapi`에서 가져와야 합니다.

```ts
import { z } from '@hono/zod-openapi'

const ParamsSchema = z.object({
  id: z
    .string()
    .min(3)
    .openapi({
      param: {
        name: 'ID',
        in: 'path',
      },
      example: '1212121',
    }),
})

const UserSchema = z
  .object({
    id: z.string().openapi({
      example: '123',
    }),
    name: z.string().openapi({
      example: '존 도',
    }),
    age: z.number().openapi({
      example: 42,
    }),
  })
  .openapi('User')
```

다음으로 경로를 만듭니다.

```ts
import { createRoute } from '@hono/zod-openapi'

const route = createRoute({
  method: 'get',
  path: '/users/{id}',
  request: {
    params: ParamsSchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: UserSchema,
        },
      },
      description: '사용자 검색',
    },
  },
})
```

마지막으로 앱을 설정합니다.

```ts
import { OpenAPIHono } from '@hono/zod-openapi'

const app = new OpenAPIHono()

app.openapi(route, (c) => {
  const { id } = c.req.valid('param')
  return c.json({
    id,
    age: 20,
    name: '울트라맨',
  })
})

// OpenAPI 문서는 /doc에서 볼 수 있습니다.
app.doc('/doc', {
  openapi: '3.0.0',
  info: {
    version: '1.0.0',
    title: '내 API',
  },
})
```

Hono를 사용하는 것처럼 앱을 시작할 수 있습니다. Cloudflare Workers 및 Bun의 경우 다음 진입점을 사용합니다.

```ts
export default app
```

## 또한보십시오

- [Zod OpenAPI Hono](https://github.com/honojs/middleware/tree/main/packages/zod-openapi)
