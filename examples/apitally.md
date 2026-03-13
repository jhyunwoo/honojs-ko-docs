# Apitally를 사용하여 Hono API 모니터링

[Apitally](https://apitally.io/hono)는 REST API를 위한 간단한 API 모니터링 및 분석 도구입니다. 경량 미들웨어를 통해 Hono와 통합되며 즉시 사용 가능한 메트릭, 로그 및 경고가 포함된 깔끔하고 직관적인 대시보드를 제공합니다.

Apitally를 사용하면 다음을 수행할 수 있습니다.

- API 사용량, 성능, 오류 모니터링
- 개별 소비자의 API 채택 추적
- API 요청 및 응답 기록 및 검사
- 요청과 관련된 애플리케이션 로그 및 추적을 캡처합니다.
- 가동 시간 모니터링 및 맞춤 알림 설정

## 설치

프로젝트에 [Apitally SDK](https://www.npmjs.com/package/apitally)를 설치합니다.

```bash
# npm
npm install apitally

# yarn
yarn add apitally

# pnpm
pnpm add apitally

# bun
bun add apitally
```

## 설정

먼저 [Apitally 대시보드](https://app.apitally.io)에서 앱을 만들어 클라이언트 ID를 받으세요. 그런 다음 `useApitally` 함수를 사용하여 Hono 애플리케이션에 미들웨어를 추가합니다.

```ts
import { Hono } from 'hono'
import { useApitally } from 'apitally/hono'

const app = new Hono()

useApitally(app, {
  clientId: 'your-client-id', // Get this from the Apitally dashboard
  env: 'dev', // or "prod", etc.

  // 선택사항: 요청 로깅 활성화 및 구성
  requestLogging: {
    enabled: true,
    logRequestHeaders: true,
    logRequestBody: true,
    logResponseBody: true,
    captureLogs: true,
  },
})

// 미들웨어 뒤에 경로를 추가하세요.
app.get('/', (c) => c.text('안녕하세요 Hono!'))

export default app
```

다른 미들웨어보다 먼저 Apitally 미들웨어를 추가하여 전체 애플리케이션 스택을 래핑하도록 합니다.

## 소비자 식별

개별 소비자의 API 사용량을 추적하려면 `setConsumer` 함수를 사용하여 요청을 소비자 식별자와 연결합니다. 이는 일반적으로 인증 후 미들웨어에서 수행됩니다. 선택적 표시 이름과 소비자 그룹을 제공할 수도 있습니다.

```ts
import { setConsumer } from 'apitally/hono'

app.use(async (c, next) => {
  const payload = c.get('jwtPayload')
  if (payload) {
    setConsumer(c, {
      identifier: payload.sub,
      name: payload.name, // optional
      group: payload.group, // optional
    })
  }
  await next()
})
```

이제 Apitally의 소비자 대시보드에 모든 소비자가 표시되며 소비자별로 로그와 지표를 필터링할 수 있습니다.

## 또한보십시오

- [Apitally](https://apitally.io/hono) - 공식 홈페이지
- [Apitally SDK](https://github.com/apitally/apitally-js) - GitHub 저장소
- [공식 설정 가이드](https://docs.apitally.io/setup-guides/hono)
- [Cloudflare Workers 공식 설정 가이드](https://docs.apitally.io/setup-guides/hono-cloudflare-workers)
