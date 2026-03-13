# Better Auth

인증을 위해 [Better Auth](http://better-auth.com/)와 함께 Hono를 사용합니다.

Better Auth는 TypeScript에 대한 프레임워크 독립적인 인증 및 권한 부여 프레임워크입니다. 기본적으로 포괄적인 기능 세트를 제공하고 고급 기능 추가를 단순화하는 플러그인 에코시스템을 포함합니다.

## 구성

1. 프레임워크를 설치합니다.

```sh
# npm
npm install better-auth

# bun
bun add better-auth

# pnpm
pnpm add better-auth

# yarn
yarn add better-auth
```

2. `.env` 파일에 필수 환경 변수를 추가합니다.

```sh
BETTER_AUTH_SECRET=<generate-a-secret-key> (e.g. D27gijdvth3Ul3DjGcexjcFfgCHc8jWd)
BETTER_AUTH_URL=<url-of-your-server> (e.g. http://localhost:1234)
```

3. Better Auth 인스턴스 만들기

```ts
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'

import prisma from '@/db/index'
import env from '@/env'

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  // 프런트엔드 개발 서버의 요청 허용
  trustedOrigins: ['http://localhost:5173'],
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    github: {
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
    },
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
})

export type AuthType = {
  user: typeof auth.$Infer.Session.user | null
  session: typeof auth.$Infer.Session.session | null
}
```

위 코드는 다음과 같습니다.

- Prisma ORM 및 PostgreSQL을 사용하도록 데이터베이스 설정
- 신뢰할 수 있는 출처를 지정합니다.
  - 신뢰할 수 있는 원본은 인증 API에 요청할 수 있는 앱입니다. 일반적으로 이는 귀하의 클라이언트(프런트엔드)입니다.
  - 다른 모든 출처는 자동으로 차단됩니다.
- 이메일/비밀번호 인증을 활성화하고 소셜 로그인 공급자를 구성합니다.

4. Prisma 스키마 파일에 대한 모든 필수 모델, 필드 및 관계를 생성합니다.

```sh
bunx @better-auth/cli generate
```

5. `routes/auth.ts`에서 인증 API 요청을 위한 API 핸들러를 생성합니다.

이 경로는 Better Auth에서 제공하는 핸들러를 사용하여 `POST` 및 `GET` 요청을 `/api/auth` 엔드포인트에 제공합니다.

```ts
import { Hono } from 'hono'
import { auth } from '../lib/auth'
import type { AuthType } from '../lib/auth'

const router = new Hono<{ Bindings: AuthType }>({
  strict: false,
})

router.on(['POST', 'GET'], '/auth/*', (c) => {
  return auth.handler(c.req.raw)
})

export default router
```

6. 경로를 마운트하세요

아래 코드는 경로를 마운트합니다.

```ts
import { Hono } from "hono";
import type { AuthType } from "../lib/auth"
import auth from "@/routes/auth";

const app = new Hono<{ Variables: AuthType }>({
  strict: false,
});

const routes = [auth, ...other routes] as const;

routes.forEach((route) => {
  app.basePath("/api").route("/", route);
});

export default app;
```

## 또한보십시오

- [전체 코드가 포함된 저장소](https://github.com/catalinpit/example-app/)
- [Hono, Bun, TypeScript, React 및 Vite가 포함된 Better Auth](https://catalins.tech/better-auth-with-hono-bun-typescript-react-vite/)
