# 신체 제한 미들웨어

Body Limit 미들웨어는 요청 본문의 파일 크기를 제한할 수 있습니다.

이 미들웨어는 먼저 요청에 `Content-Length` 헤더 값(있는 경우)을 사용합니다.
설정되지 않은 경우 스트림의 본문을 읽고 지정된 파일 크기보다 큰 경우 오류 처리기를 실행합니다.

## 가져오기

```ts
import { Hono } from 'hono'
import { bodyLimit } from 'hono/body-limit'
```

## 사용법

```ts
const app = new Hono()

app.post(
  '/upload',
  bodyLimit({
    maxSize: 50 * 1024, // 50kb
    onError: (c) => {
      return c.text('overflow :(', 413)
    },
  }),
  async (c) => {
    const body = await c.req.parseBody()
    if (body['file'] instanceof File) {
      console.log(`Got file sized: ${body['file'].size}`)
    }
    return c.text('pass :)')
  }
)
```

## 옵션

### <Badge type="danger" text="required" /> 최대 크기: `number`

제한하려는 파일의 최대 파일 크기입니다. 기본값은 `100 * 1024` - `100kb`입니다.

### <Badge type="info" text="optional" /> 오류 발생: `OnError`

지정된 파일 크기를 초과하는 경우 호출될 오류 핸들러입니다.

## 대규모 요청의 경우 Bun와 함께 사용

Body Limit 미들웨어를 명시적으로 사용하여 기본값보다 큰 요청 본문을 허용하는 경우 이에 따라 `Bun.serve` 구성을 변경해야 할 수도 있습니다. [작성 당시](https://github.com/oven-sh/bun/blob/f2cfa15e4ef9d730fc6842ad8b79fb7ab4c71cb9/packages/bun-types/bun.d.ts#L2191) `Bun.serve`의 기본 요청 본문 제한은 128MiB입니다. Hono의 Body Limit Middleware를 그보다 큰 값으로 설정하면 요청이 계속 실패하고 추가적으로 미들웨어에 지정된 `onError` 핸들러가 호출되지 않습니다. 이는 `Bun.serve()`가 상태 코드를 `413`로 설정하고 요청을 Hono로 전달하기 전에 연결을 종료하기 때문입니다.

Hono 및 Bun를 사용하여 128MiB보다 큰 요청을 수락하려면 Bun에 대한 제한도 설정해야 합니다.

```ts
export default {
  port: process.env['PORT'] || 3000,
  fetch: app.fetch,
  maxRequestBodySize: 1024 * 1024 * 200, // your value here
}
```

또는 설정에 따라 다음과 같습니다.

```ts
Bun.serve({
  fetch(req, server) {
    return app.fetch(req, { ip: server.requestIP(req) })
  },
  maxRequestBodySize: 1024 * 1024 * 200, // your value here
})
```
