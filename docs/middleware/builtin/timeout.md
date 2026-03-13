# 시간 초과 미들웨어

Timeout Middleware를 사용하면 애플리케이션에서 요청 시간 초과를 쉽게 관리할 수 있습니다. 이를 통해 요청의 최대 기간을 설정하고 지정된 제한 시간이 초과된 경우 선택적으로 사용자 정의 오류 응답을 정의할 수 있습니다.

## 가져오기

```ts
import { Hono } from 'hono'
import { timeout } from 'hono/timeout'
```

## 사용법

기본 설정과 사용자 정의 설정 모두에서 Timeout Middleware를 사용하는 방법은 다음과 같습니다.

기본 설정:

```ts
const app = new Hono()

// 5초 제한 시간 적용
app.use('/api', timeout(5000))

// 경로 처리
app.get('/api/data', async (c) => {
  // 경로 처리기 논리
  return c.json({ data: '귀하의 데이터는 여기에 있습니다' })
})
```

맞춤 설정:

```ts
import { HTTPException } from 'hono/http-exception'

// 사용자 정의 예외 팩토리 기능
const customTimeoutException = (context) =>
  new HTTPException(408, {
    message: `Request timeout after waiting ${context.req.headers.get(
      'Duration'
    )} seconds. Please try again later.`,
  })

// 정적 예외 메시지의 경우
// const customTimeoutException = 새로운 HTTPException(408, {
//   메시지: '작업 시간이 초과되었습니다. 나중에 다시 시도해 주세요.'
// });

// 사용자 지정 예외로 1분 제한 시간 적용
app.use('/api/long-process', timeout(60000, customTimeoutException))

app.get('/api/long-process', async (c) => {
  // 긴 프로세스 시뮬레이션
  await new Promise((resolve) => setTimeout(resolve, 61000))
  return c.json({ data: '일반적으로 시간이 더 오래 걸립니다.' })
})
```

## 메모

- 시간 초과 기간은 밀리초 단위로 지정할 수 있습니다. 미들웨어는 약속을 자동으로 거부하고 지정된 기간이 초과되면 잠재적으로 오류를 발생시킵니다.

- 타임아웃 미들웨어는 스트림과 함께 사용할 수 없습니다. 따라서 `stream.close`와 `setTimeout`를 함께 사용하세요.

```ts
app.get('/sse', async (c) => {
  let id = 0
  let running = true
  let timer: number | undefined

  return streamSSE(c, async (stream) => {
    timer = setTimeout(() => {
      console.log('스트림 시간 초과에 도달하여 스트림을 닫습니다.')
      stream.close()
    }, 3000) as unknown as number

    stream.onAbort(async () => {
      console.log('클라이언트가 연결을 닫았습니다.')
      running = false
      clearTimeout(timer)
    })

    while (running) {
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

## 미들웨어 충돌

특히 오류 처리 또는 기타 타이밍 관련 미들웨어를 사용할 때 미들웨어 순서에 주의하세요. 시간 초과 미들웨어의 동작에 영향을 미칠 수 있기 때문입니다.
