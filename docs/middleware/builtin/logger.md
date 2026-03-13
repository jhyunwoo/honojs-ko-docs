# 로거 미들웨어

간단한 로거입니다.

## 가져오기

```ts
import { Hono } from 'hono'
import { logger } from 'hono/logger'
```

## 사용법

```ts
const app = new Hono()

app.use(logger())
app.get('/', (c) => c.text('안녕하세요 Hono!'))
```

## 로깅 세부정보

로거 미들웨어는 각 요청에 대해 다음 세부 정보를 기록합니다.

- **수신 요청**: HTTP 메서드, 요청 경로 및 수신 요청을 기록합니다.
- **보내는 응답**: HTTP 메서드, 요청 경로, 응답 상태 코드 및 요청/응답 시간을 기록합니다.
- **상태 코드 색상**: 응답 상태 코드는 더 나은 가시성과 상태 범주의 빠른 식별을 위해 색상으로 구분됩니다. 다양한 상태 코드 범주는 다양한 색상으로 표시됩니다.
- **경과 시간**: 요청/응답 주기에 소요된 시간은 밀리초(ms) 또는 초(s) 단위로 사람이 읽을 수 있는 형식으로 기록됩니다.

로거 미들웨어를 사용하면 Hono 애플리케이션의 요청 및 응답 흐름을 쉽게 모니터링하고 문제나 성능 병목 현상을 빠르게 식별할 수 있습니다.

맞춤형 로깅 동작을 위해 자체 `PrintFunc` 기능을 제공하여 미들웨어를 더욱 확장할 수도 있습니다.

## PrintFunc

로거 미들웨어는 선택적 `PrintFunc` 함수를 매개변수로 허용합니다. 이 기능을 사용하면 로거를 사용자 정의하고 추가 로그를 추가할 수 있습니다.

## 옵션

### <Badge type="info" text="optional" /> fn: `PrintFunc(str: string, ...rest: string[])`

- `str`: 로거에 의해 전달되었습니다.
- `...rest`: 콘솔에 인쇄할 추가 문자열 소품입니다.

### 예

Logger 미들웨어에 사용자 정의 `PrintFunc` 기능 설정:

```ts
export const customLogger = (message: string, ...rest: string[]) => {
  console.log(message, ...rest)
}

app.use(logger(customLogger))
```

경로에서 사용자 정의 로거 설정:

```ts
app.post('/blog', (c) => {
  // 라우팅 논리

  customLogger('Blog saved:', `Path: ${blog.url},`, `ID: ${blog.id}`)
  // 산출
  // <-- 게시/블로그
  // 저장된 블로그: 경로: /blog/example, ID: 1
  // --> 게시/블로그 201 93ms

  // 컨텍스트 반환
})
```
