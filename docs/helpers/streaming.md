# 스트리밍 도우미

스트리밍 도우미는 스트리밍 응답을 위한 방법을 제공합니다.

## 가져오기

```ts
import { Hono } from 'hono'
import { stream, streamText, streamSSE } from 'hono/streaming'
```

## `stream()`

간단한 스트리밍 응답을 `Response` 객체로 반환합니다.

```ts
app.get('/stream', (c) => {
  return stream(c, async (stream) => {
    // 중단 시 실행할 프로세스를 작성합니다.
    stream.onAbort(() => {
      console.log('중단되었습니다!')
    })
    // Uint8Array를 작성합니다.
    await stream.write(new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f]))
    // 읽을 수 있는 스트림을 파이프합니다.
    await stream.pipe(anotherReadableStream)
  })
})
```

## `streamText()`

`Content-Type:text/plain`, `Transfer-Encoding:chunked` 및 `X-Content-Type-Options:nosniff` 헤더가 포함된 스트리밍 응답을 반환합니다.

```ts
app.get('/streamText', (c) => {
  return streamText(c, async (stream) => {
    // 새 줄('\n')로 텍스트를 작성합니다.
    await stream.writeln('안녕하세요')
    // 1초만 기다리세요.
    await stream.sleep(1000)
    // 새 줄 없이 텍스트를 작성합니다.
    await stream.write(`Hono!`)
  })
})
```

::: warning

Cloudflare Workers용 애플리케이션을 개발하는 경우 Wrangler에서는 스트리밍이 제대로 작동하지 않을 수 있습니다. 그렇다면 `Content-Encoding` 헤더에 `Identity`를 추가하세요.

```ts
app.get('/streamText', (c) => {
  c.header('Content-Encoding', 'Identity')
  return streamText(c, async (stream) => {
    // ...
  })
})
```

:::

## `streamSSE()`

이를 통해 서버에서 보낸 이벤트(SSE)를 원활하게 스트리밍할 수 있습니다.

```ts
const app = new Hono()
let id = 0

app.get('/sse', async (c) => {
  return streamSSE(c, async (stream) => {
    while (true) {
      const message = `It is ${new Date().toISOString()}`
      await stream.writeSSE({
        data: message,
        event: 'time-update',
        id: String(id++),
      })
      await stream.sleep(1000)
    }
  })
})
```

## 오류 처리

스트리밍 도우미의 세 번째 인수는 오류 처리기입니다.
이 인수는 선택 사항이며, 지정하지 않으면 오류가 콘솔 오류로 출력됩니다.

```ts
app.get('/stream', (c) => {
  return stream(
    c,
    async (stream) => {
      // 중단 시 실행할 프로세스를 작성합니다.
      stream.onAbort(() => {
        console.log('중단되었습니다!')
      })
      // Uint8Array를 작성합니다.
      await stream.write(
        new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f])
      )
      // 읽을 수 있는 스트림을 파이프합니다.
      await stream.pipe(anotherReadableStream)
    },
    (err, stream) => {
      stream.writeln('오류가 발생했습니다!')
      console.error(err)
    }
  )
})
```

콜백이 실행된 후 스트림이 자동으로 닫힙니다.

::: warning

스트리밍 헬퍼의 콜백 함수에서 오류가 발생하면 Hono의 `onError` 이벤트가 트리거되지 않습니다.

`onError`는 응답이 전송되기 전에 오류를 처리하고 응답을 덮어쓰기 위한 후크입니다. 하지만 콜백 함수가 실행되면 스트림은 이미 시작되었기 때문에 덮어쓸 수 없습니다.

:::
