# Hono 문서

> Hono 경로 유형 정의에서 OpenAPI 3.0 사양 및 TypeScript 유형 스냅샷 자동 생성

[Hono Docs](https://github.com/Rcmade/hono-docs)는 Hono용 자동 생성 OpenApi Docs를 제공합니다.

## **구성 파일 생성** 프로젝트 루트(`hono-docs.ts`)에

```ts
import { defineConfig } from '@rcmade/hono-docs'

export default defineConfig({
  tsConfigPath: './tsconfig.json',
  openApi: {
    openapi: '3.0.0',
    info: { title: '내 API', version: '1.0.0' },
    servers: [{ url: 'http://localhost:3000/api' }],
  },
  outputs: {
    openApiJson: './openapi/openapi.json',
  },
  apis: [
    {
      name: '인증 경로',
      apiPrefix: '/auth', // This will be prepended to all `api` values below
      appTypePath: 'src/routes/authRoutes.ts', // Path to your AppType export

      api: [
        // ✅ GET /auth/u/{id} 엔드포인트에 대한 사용자 정의 OpenAPI 메타데이터
        {
          api: '/u/{id}', // Final route = /auth/u/{id}
          method: 'get',
          summary: 'ID로 사용자 가져오기', // Optional: title shown in docs
          description:
            '제공된 ID를 기반으로 사용자 개체를 반환합니다.',
          tag: ['User'],
        },

        // ✅ GET /auth에 대한 메타데이터가 포함된 또 다른 예
        {
          api: '/', // Final route = /auth/
          method: 'get',
          summary: '현재 사용자 가져오기',
          description:
            "Returns the currently authenticated user's information.",
          tag: ['사용자 정보'],
        },
      ],
    },
  ],
})
```

### **경로 정의 및 AppType**

이 라이브러리는 경로 파일의 단일 AppType 내보내기를 통해 **경로 변경만** 지원합니다. **반드시** 다음을 내보내야 합니다.

```ts
export type AppType = typeof yourRoutesVariable
```

**예:**

```ts
// src/routes/userRoutes.ts
import { Hono } from 'hono'
import * as z from 'zod'

export const userRoutes = new Hono()
  .get('/u/:id', (c) => {
    /* … */
  })
  .post('/', async (c) => {
    /* … */
  })
// AppType을 추가해야 합니다.
export type AppType = typeof userRoutes
export default userRoutes
```

Hono 앱에 마운트하세요.

```ts
// src/경로/docs.ts
import { Hono } from 'hono'
import { Scalar } from '@scalar/hono-api-reference'
import fs from 'node:fs/promises'
import path from 'node:path'

const docs = new Hono()
  .get(
    '/',
    Scalar({
      url: '/api/docs/open-api',
      theme: 'kepler',
      layout: 'modern',
      defaultHttpClient: { targetKey: 'js', clientKey: 'axios' },
    })
  )
  .get('/open-api', async (c) => {
    const raw = await fs.readFile(
      path.join(process.cwd(), './openapi/openapi.json'),
      'utf-8'
    )
    return c.json(JSON.parse(raw))
  })

export type AppType = typeof docs
export default docs
```

`/api/docs`를 방문하면 UI가 표시됩니다. `/api/docs/open-api`는 JSON를 제공합니다.

**구성**을 **생성**한 후 다음을 사용하여 사양을 생성하세요.

```bash
npx @rcmade/hono-docs generate --config ./hono-docs.ts
```

## CLI 사용법

```text
Usage: @rcmade/hono-docs generate --config <your hono-docs.ts path (default root/hono-docs.ts)>

Options:
  -c, --config   Path to your config file (TS or JS)        [string] [required]
  -h, --help     Show help                                 [boolean]
```

## 예

최소한의 설정은 [`examples/basic-app/`](https://github.com/rcmade/hono-docs/tree/main/examples/basic-app)를 확인하세요.
