# Swagger UI

[Swagger UI 미들웨어](https://github.com/honojs/middleware/tree/main/packages/swagger-ui)는 [Swagger UI](https://swagger.io/docs/open-source-tools/swagger-ui/usage/installation/)를 Hono 애플리케이션과 통합하기 위한 미들웨어 및 구성 요소를 제공합니다.

```ts
import { Hono } from 'hono'
import { swaggerUI } from '@hono/swagger-ui'

// 기본 OpenAPI 문서
const openApiDoc = {
  openapi: '3.0.0', // This is the required version field
  info: {
    title: 'API 문서',
    version: '1.0.0',
    description: '서비스에 대한 API 문서',
  },
  paths: {
    // 여기에 API 경로를 추가하세요.
    '/health': {
      get: {
        summary: '건강검진',
        responses: {
          '200': {
            description: '좋아요',
          },
        },
      },
    },
    // 필요에 따라 엔드포인트를 더 추가하세요.
  },
}

const app = new Hono()

// OpenAPI 문서 제공
app.get('/doc', (c) => c.json(openApiDoc))

// 미들웨어를 사용하여 /ui에서 Swagger UI를 제공합니다.
app.get('/ui', swaggerUI({ url: '/doc' }))

app.get('/health', (c) => c.text('OK'))

export default app
```

## 또한보십시오

- [Swagger UI 미들웨어](https://github.com/honojs/middleware/tree/main/packages/swagger-ui)
