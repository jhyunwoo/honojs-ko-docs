# Scalar

[Scalar](https://guides.scalar.com/scalar/scalar-api-references/integrations/hono)는 Hono를 사용하여 OpenAPI/Swagger 문서를 기반으로 아름다운 API 참조를 렌더링하는 쉬운 방법을 제공합니다.

## 설치

```bash
npm install @scalar/hono-api-reference
```

## 사용법

[Zod OpenAPI Hono](/examples/zod-openapi) 또는 [Hono OpenAPI](/examples/hono-openapi)를 설정하고 구성된 URL을 `Scalar` 미들웨어에 전달합니다.

```ts
import { Hono } from 'hono'
import { Scalar } from '@scalar/hono-api-reference'

const app = new Hono()

// 미들웨어를 사용하여 /scalar에서 Scalar API 참조를 제공합니다.
app.get('/scalar', Scalar({ url: '/doc' }))

// 또는 동적 구성을 사용하는 경우
app.get(
  '/scalar',
  Scalar((c) => {
    return {
      url: '/doc',
      proxyUrl:
        c.env.ENVIRONMENT === 'development'
          ? 'https://proxy.scalar.com'
          : undefined,
    }
  })
)

export default app
```

### 테마

미들웨어는 Hono에 대한 사용자 정의 테마와 함께 제공됩니다. [기타 사전 정의된 테마](https://github.com/scalar/scalar/blob/main/packages/themes/src/index.ts#L15)(`alternate`, `default`, `moon`, `purple`, `solarized`) 중 하나를 사용하거나 `none`로 덮어쓸 수 있습니다. 모든 테마는 밝고 어두운 색상 구성으로 제공됩니다.

```ts
import { Scalar } from '@scalar/hono-api-reference'

// 테마 전환(또는 다른 옵션 전달)
app.get(
  '/scalar',
  Scalar({
    url: '/doc',
    theme: 'purple',
  })
)
```

### 사용자 정의 페이지 제목

페이지 제목을 설정하는 추가 옵션이 하나 있습니다.

```ts
import { Scalar } from '@scalar/hono-api-reference'

// 페이지 제목 설정
app.get(
  '/scalar',
  Scalar({
    url: '/doc',
    pageTitle: '굉장해 API',
  })
)
```

### 맞춤형 CDN

사용자 정의 CDN을 사용할 수 있으며 기본값은 `https://cdn.jsdelivr.net/npm/@scalar/api-reference`입니다.

`https://cdn.jsdelivr.net/npm/@scalar/api-reference@1.25.28`와 같은 CDN 문자열에 지정하여 CDN을 특정 버전에 고정할 수도 있습니다.

사용 가능한 모든 CDN 버전을 [여기](https://www.jsdelivr.com/package/npm/@scalar/api-reference?tab=files)에서 찾을 수 있습니다.

```ts
import { Scalar } from '@scalar/hono-api-reference'

app.get('/scalar', Scalar({ url: '/doc', pageTitle: '굉장해 API' }))

app.get(
  '/scalar',
  Scalar({
    url: '/doc',
    cdn: 'https://cdn.jsdelivr.net/npm/@scalar/api-reference@latest',
  })
)
```

### LLM에 대한 마크다운

API 참조(LLM용)의 마크다운 버전을 생성하려면 `@scalar/openapi-to-markdown`를 설치하세요.

```bash
npm install @scalar/openapi-to-markdown
```

그리고 이에 대한 추가 경로를 추가합니다.

```ts
import { Hono } from 'hono'
import { createMarkdownFromOpenApi } from '@scalar/openapi-to-markdown'

const app = new Hono()

// OpenAPI 문서에서 마크다운 생성
const markdown = await createMarkdownFromOpenApi(content)

/**
 * Register a route to serve the Markdown for LLMs
 *
 * Q: Why /llms.txt?
 * A: It's a proposal to standardise on using an /llms.txt file.
 *
 * @see https://llmstxt.org/
 */
app.get('/llms.txt', (c) => c.text(markdown))

export default app
```

또는 Zod OpenAPI Hono를 사용하는 경우:

```ts
// OpenAPI 문서 가져오기
const content = app.getOpenAPI31Document({
  openapi: '3.1.0',
  info: { title: '예', version: 'v1' },
})

const markdown = await createMarkdownFromOpenApi(
  JSON.stringify(content)
)

app.get('/llms.txt', async (c) => {
  return c.text(markdown)
})
```
