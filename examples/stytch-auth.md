# Hono를 사용한 Stytch 인증

이 예에서는 Cloudflare에서 Stytch 프런트엔드 SDK 및 Hono 백엔드로 전체 스택 애플리케이션을 설정하는 방법을 보여줍니다.
`vite` 및 `react`를 사용하는 작업자.

이러한 원칙을 사용하는 완전한 예제 애플리케이션은 다음과 같습니다.
[여기](https://github.com/honojs/examples/tree/main/stytch-auth)를 찾았습니다.

## 설치

::: code-group

```sh [npm]
# Backend
npm install @hono/stytch-auth stytch

# Frontend
npm install @stytch/react @stytch/vanilla-js
```

```sh [yarn]
# Backend
yarn add @hono/stytch-auth stytch

# Frontend
yarn add @stytch/react @stytch/vanilla-js
```

```sh [pnpm]
# Backend
pnpm add @hono/stytch-auth stytch

# Frontend
pnpm add @stytch/react @stytch/vanilla-js
```

```sh [bun]
# Backend
bun add @hono/stytch-auth stytch

# Frontend
bun add @stytch/react @stytch/vanilla-js
```

:::

## 설정

1. [Stytch](https://stytch.com/?utm_source=hono&utm_medium=website&utm_campaign=workers) 계정을 만들고 선택
**소비자 인증**.
2. [구성](https://stytch.com/dashboard/sdk-configuration)에서 **프런트엔드 SDK**를 활성화합니다.
3. [프로젝트 설정](https://stytch.com/dashboard)에서 자격 증명을 받으세요.

## 환경 변수

백엔드 작업자 환경 변수는 `.dev.vars`에 들어갑니다. 프런트엔드 Vite 환경 변수는 `.env.local`에 들어갑니다.

::: code-group

```Plain Text[.dev.vars]
STYTCH_PROJECT_ID=project-live-xxx
STYTCH_PROJECT_SECRET=secret-live-xxx
```

```Plain Text[.env.local]
VITE_STYTCH_PUBLIC_TOKEN=public-token-live-xxx
```

:::

## 프런트엔드

1. 애플리케이션을 `<StytchProvider />` 구성요소로 래핑하고 이를 Stytch UI 클라이언트의 인스턴스에 전달합니다.
2. 사용자를 로그인하려면 `<StytchLogin />` 구성요소를 사용하십시오.
다양한 예시를 보려면 [Component Playground](https://stytch.com/docs/sdks/component-playground)를 참조하세요.
인증 방법 및 스타일 사용자 정의가 가능합니다.
3. 사용자가 로그인한 후 `useStytchUser()` 후크를 사용하여 활성 사용자 데이터를 검색할 수 있습니다.
4. 사용자의 세션 정보는 자동으로 쿠키로 저장되어 백엔드에서 사용할 수 있게 됩니다.

::: code-group

```tsx[App.tsx]
import React from 'react'
import {StytchUIClient} from '@stytch/vanilla-js';
import {StytchProvider, useStytchUser} from '@stytch/react';
import LoginPage from './LoginPage'
import Dashboard from './Dashboard'

const stytch = new StytchUIClient(import.meta.env.VITE_STYTCH_PUBLIC_TOKEN ?? '');

function AppContent() {
  const { user, isInitialized } = useStytchUser()

  if (!isInitialized) return <div>로드 중...</div>
  return user ? <Dashboard /> : <LoginPage />
}

function App() {
  return (
    <StytchProvider stytch={stytch}>
      <AppContent />
    </StytchProvider>
  )
}

export default App
```

```tsx[LoginPage.tsx]
import React from 'react'
import { StytchLogin } from '@stytch/react'
import { Products, OTPMethods } from '@stytch/vanilla-js'

const loginConfig = {
  products: [Products.otp],
  otpOptions: {
    expirationMinutes: 10,
    methods: [OTPMethods.Email],
  },
}

const LoginPage = () => {
  return <StytchLogin config={loginConfig} />
}

export default LoginPage
```

```tsx[Dashboard.tsx]
import React from 'react'
import { useStytchUser, useStytch } from '@stytch/react'

const Dashboard = () => {
  const { user } = useStytchUser()
  const stytchClient = useStytch()

  const handleLogout = () => stytchClient.session.revoke()

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h1>계기반</h1>
        <button onClick={handleLogout}>로그아웃</button>
      </div>
      <p>환영합니다, {user.emails[0]?.email}!</p>
    </div>
  )
}

export default Dashboard
```

:::

## 백엔드

1. Stytch 세션을 인증하기 위해 `Consumer.authenticateSessionLocal()` 미들웨어로 보호된 엔드포인트를 래핑합니다.
   JWT.
2. 경로 내에서 Stytch 세션 정보를 검색하려면 `Consumer.getStytchSession(c)` 메서드를 사용합니다.
3. 전체 사용자 개체가 필요한 경로는 `Consumer.authenticateSessionRemote()` 메서드를 사용하여 다음을 수행할 수 있습니다.
Stytch 서버에 대한 네트워크 호출.

```ts[src/index.ts]
import { Hono } from 'hono'
import { Consumer } from '@hono/stytch-auth'

const app = new Hono()

// 공공 경로
app.get('/health', (c) => c.json({ status: 'ok' }))

// 로컬 인증으로 보호된 경로(매우 빠름)
app.get('/api/local', Consumer.authenticateSessionLocal(), (c) => {
  const session = Consumer.getStytchSession(c)
  return c.json({
    message: 'Protected data',
    sessionId: session.session_id,
  })
})

// 원격 인증 및 전체 사용자 데이터를 갖춘 보호된 경로
app.get('/api/remote', Consumer.authenticateSessionRemote(), (c) => {
  const session = Consumer.getStytchSession(c)
  const user = Consumer.getStytchUser(c)
  return c.json({
    message: 'Protected data',
    sessionId: session.session_id,
    firstName: user.name.first_name,
  })
})

export default app
```

## 다음 단계

추가 문서 및 리소스:

- [Stytch 인증 Hono 예시 앱](https://github.com/honojs/examples/tree/main/stytch-auth)을 확인해 보세요.
- [Stytch JS SDK](https://stytch.com/docs/sdks/installation) 시작 가이드입니다.
- [@hono/stytch-auth 패키지](https://www.npmjs.com/package/@hono/stytch-auth)에 대한 완전한 문서입니다.

조직 관리, RBAC, SSO와 같은 엔터프라이즈 B2B 기능에 관심이 있으십니까? 보다
[Stytch B2B 인증](https://stytch.com/docs/getting-started/b2b-vs-consumer-auth) 제품 라인입니다.

토론에 참여하고, 질문하고, 새로운 기능을 제안하세요.
[Stytch Slack 커뮤니티](https://stytch.com/docs/resources/support/overview).
