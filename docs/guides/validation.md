# 확인

Hono는 매우 얇은 유효성 검사기만 제공합니다.
그러나 타사 유효성 검사기와 결합하면 강력할 수 있습니다.
또한 RPC 기능을 사용하면 유형을 통해 클라이언트와 API 사양을 공유할 수 있습니다.

## 수동 유효성 검사기

먼저, 타사 유효성 검사기를 사용하지 않고 들어오는 값의 유효성을 검사하는 방법을 소개합니다.

`hono/validator`에서 `validator`를 가져옵니다.

```ts
import { validator } from 'hono/validator'
```

양식 데이터의 유효성을 검사하려면 `form`를 첫 번째 인수로 지정하고 콜백을 두 번째 인수로 지정합니다.
콜백에서 값의 유효성을 검사하고 마지막에 유효성이 검사된 값을 반환합니다.
`validator`를 미들웨어로 사용할 수 있습니다.

```ts
app.post(
  '/posts',
  validator('form', (value, c) => {
    const body = value['body']
    if (!body || typeof body !== 'string') {
      return c.text('유효하지 않은!', 400)
    }
    return {
      body: body,
    }
  }),
  //...
```

핸들러 내에서 `c.req.valid('form')`를 사용하여 검증된 값을 얻을 수 있습니다.

```ts
, (c) => {
  const { body } = c.req.valid('form')
  // ... 뭔가 해봐
  return c.json(
    {
      message: '생성되었습니다!',
    },
    201
  )
}
```

검증 대상에는 `form` 외에도 `json`, `query`, `header`, `param` 및 `cookie`가 포함됩니다.

::: warning
`json` 또는 `form`를 검증할 때 요청에는 일치하는 `content-type` 헤더(예: `json`의 경우 `Content-Type: application/json`)가 _반드시_ 포함되어야 합니다. 그렇지 않으면 요청 본문이 구문 분석되지 않고 콜백의 값으로 빈 객체(`{}`)를 받게 됩니다.

다음을 사용하여 테스트할 때 `content-type` 헤더를 설정하는 것이 중요합니다.
[`app.request()`](../api/request.md).

이와 같은 응용 프로그램이 제공됩니다.

```ts
const app = new Hono()
app.post(
  '/testing',
  validator('json', (value, c) => {
    // 통과 유효성 검사기
    return value
  }),
  (c) => {
    const body = c.req.valid('json')
    return c.json(body)
  }
)
```

테스트는 다음과 같이 작성할 수 있습니다.

```ts
// ❌ 이것은 작동하지 않습니다
const res = await app.request('/testing', {
  method: 'POST',
  body: JSON.stringify({ key: 'value' }),
})
const data = await res.json()
console.log(data) // {}

// ✅ 이렇게 하면 됩니다
const res = await app.request('/testing', {
  method: 'POST',
  body: JSON.stringify({ key: 'value' }),
  headers: new Headers({ 'Content-Type': 'application/json' }),
})
const data = await res.json()
console.log(data) // { key: 'value' }
```

:::

::: warning
`header`의 유효성을 검사할 때 **소문자** 이름을 키로 사용해야 합니다.

`Idempotency-Key` 헤더의 유효성을 검사하려면 `idempotency-key`를 키로 사용해야 합니다.

```ts
// ❌ 이것은 작동하지 않습니다
app.post(
  '/api',
  validator('header', (value, c) => {
    // idempotencyKey는 항상 정의되지 않습니다.
    // 그래서 이 미들웨어는 항상 예상치 못한 400을 반환합니다.
    const idempotencyKey = value['Idempotency-Key']

    if (idempotencyKey == undefined || idempotencyKey === '') {
      throw new HTTPException(400, {
        message: '멱등성 키가 필요합니다.',
      })
    }
    return { idempotencyKey }
  }),
  (c) => {
    const { idempotencyKey } = c.req.valid('header')
    // ...
  }
)

// ✅ 이렇게 하면 됩니다
app.post(
  '/api',
  validator('header', (value, c) => {
    // 예상대로 헤더 값을 검색할 수 있습니다.
    const idempotencyKey = value['idempotency-key']

    if (idempotencyKey == undefined || idempotencyKey === '') {
      throw new HTTPException(400, {
        message: '멱등성 키가 필요합니다.',
      })
    }
    return { idempotencyKey }
  }),
  (c) => {
    const { idempotencyKey } = c.req.valid('header')
    // ...
  }
)
```

:::

## 다수의 검증자

요청의 다양한 부분을 검증하기 위해 여러 유효성 검사기를 포함할 수도 있습니다.

```ts
app.post(
  '/posts/:id',
  validator('param', ...),
  validator('query', ...),
  validator('json', ...),
  (c) => {
    //...
  }
```

## Zod 사용

타사 검증인 중 하나인 [Zod](https://zod.dev)를 사용할 수 있습니다.
타사 유효성 검사기를 사용하는 것이 좋습니다.

Npm 레지스트리에서 설치합니다.

::: code-group

```sh [npm]
npm i zod
```

```sh [yarn]
yarn add zod
```

```sh [pnpm]
pnpm add zod
```

```sh [bun]
bun add zod
```

:::

`zod`에서 `z`를 가져옵니다.

```ts
import * as z from 'zod'
```

스키마를 작성하세요.

```ts
const schema = z.object({
  body: z.string(),
})
```

유효성 검사를 위해 콜백 함수의 스키마를 사용하고 유효성이 검사된 값을 반환할 수 있습니다.

```ts
const route = app.post(
  '/posts',
  validator('form', (value, c) => {
    const parsed = schema.safeParse(value)
    if (!parsed.success) {
      return c.text('유효하지 않은!', 401)
    }
    return parsed.data
  }),
  (c) => {
    const { body } = c.req.valid('form')
    // ... 뭔가 해봐
    return c.json(
      {
        message: '생성되었습니다!',
      },
      201
    )
  }
)
```

## Zod 검증인 미들웨어

[Zod 유효성 검사기 미들웨어](https://github.com/honojs/middleware/tree/main/packages/zod-validator)를 사용하면 더욱 쉽게 만들 수 있습니다.

::: code-group

```sh [npm]
npm i @hono/zod-validator
```

```sh [yarn]
yarn add @hono/zod-validator
```

```sh [pnpm]
pnpm add @hono/zod-validator
```

```sh [bun]
bun add @hono/zod-validator
```

:::

그리고 `zValidator`를 가져옵니다.

```ts
import { zValidator } from '@hono/zod-validator'
```

그리고 다음과 같이 작성하세요.

```ts
const route = app.post(
  '/posts',
  zValidator(
    'form',
    z.object({
      body: z.string(),
    })
  ),
  (c) => {
    const validated = c.req.valid('form')
    // ... 검증된 데이터를 사용하세요
  }
)
```

## 표준 스키마 유효성 검사기 미들웨어

[표준 스키마](https://standardschema.dev/)는 TypeScript 검증 라이브러리에 대한 공통 인터페이스를 제공하는 사양입니다. Zod, Valibot 및 ArkType의 관리자가 만들어 생태계 도구가 맞춤형 어댑터 없이도 모든 검증 라이브러리와 작동할 수 있도록 했습니다.

[표준 스키마 유효성 검사기 미들웨어](https://github.com/honojs/middleware/tree/main/packages/standard-validator)를 사용하면 Hono와 함께 표준 스키마 호환 유효성 검사 라이브러리를 사용할 수 있으므로 일관된 유형 안전성을 유지하면서 선호하는 유효성 검사기를 선택할 수 있는 유연성을 제공합니다.

::: code-group

```sh [npm]
npm i @hono/standard-validator
```

```sh [yarn]
yarn add @hono/standard-validator
```

```sh [pnpm]
pnpm add @hono/standard-validator
```

```sh [bun]
bun add @hono/standard-validator
```

:::

패키지에서 `sValidator`를 가져옵니다.

```ts
import { sValidator } from '@hono/standard-validator'
```

### Zod 사용

표준 스키마 유효성 검사기와 함께 Zod를 사용할 수 있습니다.

::: code-group

```sh [npm]
npm i zod
```

```sh [yarn]
yarn add zod
```

```sh [pnpm]
pnpm add zod
```

```sh [bun]
bun add zod
```

:::

```ts
import * as z from 'zod'
import { sValidator } from '@hono/standard-validator'

const schema = z.object({
  name: z.string(),
  age: z.number(),
})

app.post('/author', sValidator('json', schema), (c) => {
  const data = c.req.valid('json')
  return c.json({
    success: true,
    message: `${data.name} is ${data.age}`,
  })
})
```

### 발리봇과 함께

[Valibot](https://valibot.dev/)는 모듈식 설계를 갖춘 Zod의 경량 대안입니다.

::: code-group

```sh [npm]
npm i valibot
```

```sh [yarn]
yarn add valibot
```

```sh [pnpm]
pnpm add valibot
```

```sh [bun]
bun add valibot
```

:::

```ts
import * as v from 'valibot'
import { sValidator } from '@hono/standard-validator'

const schema = v.object({
  name: v.string(),
  age: v.number(),
})

app.post('/author', sValidator('json', schema), (c) => {
  const data = c.req.valid('json')
  return c.json({
    success: true,
    message: `${data.name} is ${data.age}`,
  })
})
```

### 아크타입으로

[ArkType](https://arktype.io/)은 런타임 유효성 검사를 위한 TypeScript 기본 구문을 제공합니다.

::: code-group

```sh [npm]
npm i arktype
```

```sh [yarn]
yarn add arktype
```

```sh [pnpm]
pnpm add arktype
```

```sh [bun]
bun add arktype
```

:::

```ts
import { type } from 'arktype'
import { sValidator } from '@hono/standard-validator'

const schema = type({
  name: '끈',
  age: 'number',
})

app.post('/author', sValidator('json', schema), (c) => {
  const data = c.req.valid('json')
  return c.json({
    success: true,
    message: `${data.name} is ${data.age}`,
  })
})
```
