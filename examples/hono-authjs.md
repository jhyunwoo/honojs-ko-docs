# Hono Auth.js 통합

이 가이드에서는 **Auth.js**(이전의 NextAuth.js)를 사용하여 Hono 애플리케이션에 인증을 추가하는 방법을 보여줍니다.

> [!중요한]
> `@hono/auth-js` 패키지는 현재 클라이언트 측 통합을 위해 **React만 지원**합니다.

## 빠른 시작

5분 안에 인증 실행:

1. **설치** → `npm install @hono/auth-js @auth/core`
2. **환경 변수 설정** → 아래 `.env` 예시를 복사하세요.
3. **데이터베이스 테이블 생성** → 스키마 마이그레이션 실행
4. **인증 경로 추가** → Hono 설정 복사
5. **테스트해 보세요** → 클라이언트 예시 사용

## 설치

```bash
npm install hono @hono/auth-js @auth/core
```

## 설정

### 1단계: 환경 변수

프로젝트 루트에 `.env` 파일을 만듭니다.

```properties
AUTH_SECRET=your-auth-secret-here
GITHUB_ID=your-github-client-id
GITHUB_SECRET=your-github-client-secret
GOOGLE_ID=your-google-client-id
GOOGLE_SECRET=your-google-client-secret
```

> [!팁]
> 다음을 사용하여 강력한 `AUTH_SECRET`를 생성합니다.
> `openssl rand -base64 32`
> 또는 사용: `npx auth secret`

### 2단계: 데이터베이스 설정

> [!메모]
> [Auth.js Drizzle 어댑터 문서](https://authjs.dev/getting-started/adapters/drizzle)에서 최신 스키마를 복사합니다.

**Drizzle ORM을 사용하는 SQLite**에 대한 스키마는 다음과 같습니다.

::: code-group

```ts [db.ts]
import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'

const client = createClient({
  url: 'DATABASE_URL',
  authToken: 'DATABASE_AUTH_TOKEN',
})
export const db = drizzle(client)
```

```ts [schema.ts]
import {
  integer,
  sqliteTable,
  text,
  primaryKey,
} from 'drizzle-orm/sqlite-core'
import type { AdapterAccountType } from 'next-auth/adapters'

export const users = sqliteTable('user', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('이름'),
  email: text('email').unique(),
  emailVerified: integer('emailVerified', { mode: 'timestamp_ms' }),
  image: text('image'),
})

export const accounts = sqliteTable(
  'account',
  {
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').$type<AdapterAccountType>().notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('providerAccountId').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
)

export const sessions = sqliteTable('session', {
  sessionToken: text('sessionToken').primaryKey(),
  userId: text('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: integer('expires', { mode: 'timestamp_ms' }).notNull(),
})

export const verificationTokens = sqliteTable(
  'verificationToken',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: integer('expires', { mode: 'timestamp_ms' }).notNull(),
  },
  (verificationToken) => ({
    compositePk: primaryKey({
      columns: [
        verificationToken.identifier,
        verificationToken.token,
      ],
    }),
  })
)

export const authenticators = sqliteTable(
  'authenticator',
  {
    credentialID: text('credentialID').notNull().unique(),
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    providerAccountId: text('providerAccountId').notNull(),
    credentialPublicKey: text('credentialPublicKey').notNull(),
    counter: integer('counter').notNull(),
    credentialDeviceType: text('credentialDeviceType').notNull(),
    credentialBackedUp: integer('credentialBackedUp', {
      mode: 'boolean',
    }).notNull(),
    transports: text('transports'),
  },
  (authenticator) => ({
    compositePK: primaryKey({
      columns: [authenticator.userId, authenticator.credentialID],
    }),
  })
)
```

:::

## 기본 사용법

### 경로 설정

Hono 애플리케이션에서 API 경로를 만듭니다.

```ts
import { Hono } from 'hono'
import {
  initAuthConfig,
  verifyAuth,
  authHandler,
  DrizzleAdapter,
} from '@hono/auth-js'
import { GitHub, Google } from '@auth/core/providers'
import { db } from './db'
import {
  users,
  accounts,
  authenticators,
  sessions,
  verificationTokens,
} from './schema'

const v1Router = new Hono()
  .use(
    '*',
    initAuthConfig((c) => ({
      adapter: DrizzleAdapter(c.get('db'), {
        usersTable: users,
        accountsTable: accounts,
        authenticatorsTable: authenticators,
        sessionsTable: sessions,
        verificationTokensTable: verificationTokens,
      }),
      secret: c.env.AUTH_SECRET,
      providers: [
        GitHub({
          clientId: c.env.GITHUB_ID,
          clientSecret: c.env.GITHUB_SECRET,
        }),
        Google({
          clientId: c.env.GOOGLE_ID,
          clientSecret: c.env.GOOGLE_SECRET,
        }),
      ],
      session: { strategy: 'jwt' },
    }))
  )
  .use('*', verifyAuth())
  .use('/auth/*', authHandler())

const app = new Hono().route('/api/v1', v1Router)
export default app
```

## 사용 예

### 경로 보호

```ts
app.get('/protected', (c) => {
  const auth = c.get('authUser')
  if (!auth) return c.json({ error: '승인되지 않은' }, 401)
  return c.json(auth)
})
```

### 클라이언트측 통합(React)

```tsx
import {
  SessionProvider,
  useSession,
  signIn,
} from '@hono/auth-js/react'

function App() {
  const { data: session } = useSession()
  return session ? (
    <p>안녕하세요 {session.user?.name}</p>
  ) : (
    <button onClick={() => signIn('github')}>
      Sign in with GitHub
    </button>
  )
}

export default function Root() {
  return (
    <SessionProvider>
      <App />
    </SessionProvider>
  )
}
```

## 구성 참조

다음을 사용하여 Hono 앱에서 Auth.js를 맞춤설정하세요.

- **어댑터** → 데이터베이스에 연결합니다(위에 표시된 Drizzle).
- **제공업체** → GitHub, Google 또는 모든 Auth.js 제공업체
- **세션** → `"jwt"`(상태 비저장) 또는 `"database"`(영구)
- **콜백** → 로그인 또는 세션 이벤트에 연결

예:

```ts
initAuthConfig((c) => ({
  adapter: DrizzleAdapter(c.get('db'), {
    /* tables */
  }),
  secret: c.env.AUTH_SECRET,
  providers: [
    GitHub({
      clientId: c.env.GITHUB_ID,
      clientSecret: c.env.GITHUB_SECRET,
    }),
    Google({
      clientId: c.env.GOOGLE_ID,
      clientSecret: c.env.GOOGLE_SECRET,
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async session({ session }) {
      return session
    },
  },
}))
```

## 자세히 알아보기

- [Auth.js 문서](https://authjs.dev/) – 공급자, 스키마 참조
- [Hono 문서](https://hono.dev/) – 라우팅 및 미들웨어 패턴
- 레시피: 역할 기반 액세스, 비밀번호 재설정, 이메일 확인
