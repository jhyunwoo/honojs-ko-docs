# 컨텍스트 저장 미들웨어

컨텍스트 스토리지 미들웨어는 Hono `Context`를 `AsyncLocalStorage`에 저장하여 전역적으로 액세스할 수 있도록 합니다.

::: info
**참고** 이 미들웨어는 `AsyncLocalStorage`를 사용합니다. 런타임이 이를 지원해야 합니다.

**Cloudflare Workers**: `AsyncLocalStorage`를 활성화하려면 `wrangler.toml` 파일에 [`nodejs_compat` 또는 `nodejs_als` 플래그](https://developers.cloudflare.com/workers/configuration/compatibility-dates/#nodejs-compatibility-flag)를 추가하세요.
:::

## 가져오기

```ts
import { Hono } from 'hono'
import {
  contextStorage,
  getContext,
  tryGetContext,
} from 'hono/context-storage'
```

## 사용법

`contextStorage()`가 미들웨어로 적용된 경우 `getContext()`는 현재 Context 객체를 반환합니다.

```ts
type Env = {
  Variables: {
    message: string
  }
}

const app = new Hono<Env>()

app.use(contextStorage())

app.use(async (c, next) => {
  c.set('message', '안녕하세요!')
  await next()
})

// 핸들러 외부에서 변수에 액세스할 수 있습니다.
const getMessage = () => {
  return getContext<Env>().var.message
}

app.get('/', (c) => {
  return c.text(getMessage())
})
```

Cloudflare Workers에서는 핸들러 외부의 바인딩에 액세스할 수 있습니다.

```ts
type Env = {
  Bindings: {
    KV: KVNamespace
  }
}

const app = new Hono<Env>()

app.use(contextStorage())

const setKV = (value: string) => {
  return getContext<Env>().env.KV.put('key', value)
}
```

## tryGetContext

`tryGetContext()`는 `getContext()`처럼 작동하지만 컨텍스트를 사용할 수 없을 때 오류를 발생시키는 대신 `undefined`를 반환합니다.

```ts
const context = tryGetContext<Env>()
if (context) {
  // 컨텍스트를 사용할 수 있습니다.
  console.log(context.var.message)
}
```
