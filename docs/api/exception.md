# HTTP 예외

치명적인 오류가 발생하면 Hono(및 많은 생태계 미들웨어)가 `HTTPException`을 throw할 수 있습니다. 이는 [오류 응답 처리](#handling-httpexceptions)를 단순화해 주는 Hono 전용 `Error`입니다.

## HTTPException 발생

상태 코드와 메시지 또는 사용자 정의 응답을 지정하여 고유한 HTTPException을 발생시킬 수 있습니다.

### 맞춤 메시지

기본 `text` 응답의 경우 오류 `message`를 설정하면 됩니다.

```ts twoslash
import { HTTPException } from 'hono/http-exception'

throw new HTTPException(401, { message: '승인되지 않은' })
```

### 맞춤 응답

다른 응답 유형의 경우 또는 응답 헤더를 설정하려면 `res` 옵션을 사용하십시오. _생성자에 전달된 상태는 응답을 생성하는 데 사용되는 상태입니다._

```ts twoslash
import { HTTPException } from 'hono/http-exception'

const errorResponse = new Response('승인되지 않은', {
  status: 401, // this gets ignored
  headers: {
    Authenticate: 'error="invalid_token"',
  },
})

throw new HTTPException(401, { res: errorResponse })
```

### 원인

두 경우 모두 [`cause`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/cause) 옵션을 사용하여 HTTPException에 임의의 데이터를 추가할 수 있습니다.

```ts twoslash
import { Hono, Context } from 'hono'
import { HTTPException } from 'hono/http-exception'
const app = new Hono()
declare const message: string
declare const authorize: (c: Context) => Promise<void>
// ---cut---
app.post('/login', async (c) => {
  try {
    await authorize(c)
  } catch (cause) {
    throw new HTTPException(401, { message, cause })
  }
  return c.redirect('/')
})
```

## HTTPException 처리

[`app.onError`](/docs/api/hono#error-handling)를 사용하면 처리되지 않은 HTTPException을 다룰 수 있습니다. 여기에는 오류의 `status`로 생성한 새 `Response`를 반환하는 `getResponse` 메서드와, 오류가 발생할 때 지정된 `message` 또는 [사용자 정의 응답](#custom-response)이 포함됩니다.

```ts twoslash
import { Hono } from 'hono'
const app = new Hono()
// ---cut---
import { HTTPException } from 'hono/http-exception'

// ...

app.onError((error, c) => {
  if (error instanceof HTTPException) {
    console.error(error.cause)
    // 맞춤 응답 받기
    return error.getResponse()
  }
  // ...
  // ---cut-start---
  return c.text('예상치 못한 오류')
  // ---cut-end---
})
```

::: warning
**`HTTPException.getResponse`는 `Context`를 인식하지 못합니다**. `Context`에 이미 설정된 헤더를 포함하려면 해당 헤더를 새 `Response`에 적용해야 합니다.
:::
