# Cloudflare에서 Better Auth 사용

Cloudflare Workers에 최적화된 TypeScript 기반의 경량 인증 서비스

## 스택 요약

**🔥 [Hono](https://hono.dev)**  
웹 표준을 기반으로 구축된 빠르고 가벼운 웹 프레임워크입니다.

**🔒 [Better Auth](https://www.better-auth.com)**  
TypeScript를 위한 포괄적인 인증 프레임워크입니다.

**🧩 [Drizzle ORM](https://orm.drizzle.team)**
DX를 염두에 두고 구축된 TypeScript용 경량 고성능 ORM입니다.

**🐘 [Neon 기반 Postgres](https://neon.tech)**
클라우드에 최적화된 서버리스 Postgres입니다.

## 준비

### 1. 설치

::: code-group

```sh [npm]
# Hono
# > cloudflare-workers 템플릿 선택
npm create hono

# Better Auth
npm install better-auth

# Drizzle ORM
npm install drizzle-orm
npm install --save-dev drizzle-kit

# Neon
npm install @neondatabase/serverless
```

```sh [pnpm]
# Hono
# > cloudflare-workers 템플릿 선택
pnpm create hono

# Better Auth
pnpm add better-auth

# Drizzle ORM
pnpm add drizzle-orm
pnpm add -D drizzle-kit

# Neon
pnpm add @neondatabase/serverless
```

```sh [yarn]
# Hono
# > cloudflare-workers 템플릿 선택
yarn create hono

# Better Auth
yarn add better-auth

# Drizzle ORM
yarn add drizzle-orm
yarn add --dev drizzle-kit

# Neon
yarn add @neondatabase/serverless
```

```sh [bun]
# Hono
# > cloudflare-workers 템플릿 선택
bun create hono

# Better Auth
bun add better-auth

# Drizzle ORM
bun add drizzle-orm
bun add -d drizzle-kit

# Neon
bun add @neondatabase/serverless
```

:::

### 2. 환경변수

애플리케이션을 Better Auth 및 Neon에 연결하려면 다음 환경 변수를 설정하세요.

공식 가이드를 참조하세요:

- [Better Auth – 가이드](https://www.better-auth.com/docs/installation#set-environment-variables)
- [네온 – 가이드](https://neon.tech/docs/connect/connect-from-any-app)

**필수 파일:**

::: code-group

```Plain Text[.dev.vars]
# Used by Wrangler in local development
# In production, these should be set as Cloudflare Worker Secrets.

BETTER_AUTH_URL=
BETTER_AUTH_SECRET=
DATABASE_URL=
```

```Plain Text[.env]
# Used for local development and CLI tools such as:
#
# - Drizzle CLI
# - Better Auth CLI

BETTER_AUTH_URL=
BETTER_AUTH_SECRET=
DATABASE_URL=
```

:::

### 3. Wrangler

환경 변수를 설정한 후 다음 스크립트를 실행하여 Cloudflare Workers 구성에 대한 유형을 생성합니다.

::: code-group

```sh[npm]
npx wrangler types --env-interface CloudflareBindings
# OR
npm run cf-typegen
```

```sh[pnpm]
pnpm wrangler types --env-interface CloudflareBindings
# OR
pnpm cf-typegen

```

```sh[yarn]
yarn wrangler types --env-interface CloudflareBindings
# OR
yarn cf-typegen
```

```sh[bun]
bunx wrangler types --env-interface CloudflareBindings
# OR
bun run cf-typegen
```

:::

그런 다음 tsconfig.json에 생성된 유형이 포함되어 있는지 확인하세요.

```json[tsconfig.json]
{
  "compilerOptions": {
    "types": ["worker-configuration.d.ts"]
  }
}
```

### 4. Drizzle

Drizzle Kit CLI를 사용하려면 다음 Drizzle 구성 파일을 프로젝트 루트에 추가하세요.

```ts[drizzle.config.ts]
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

## 애플리케이션

### 1. Better Auth 인스턴스

Cloudflare Workers 바인딩을 사용하여 Better Auth 인스턴스를 만듭니다.

이 예에서 다룰 수 있는 것보다 훨씬 더 많은 사용 가능한 구성 옵션이 있습니다.
공식 문서를 참조하여 프로젝트의 필요에 따라 구성하십시오.

(문서: [Better Auth - 옵션](https://www.better-auth.com/docs/reference/options))

::: code-group

```ts[src/lib/better-auth/index.ts]
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { betterAuth } from 'better-auth';
import { betterAuthOptions } from './options';

import * as schema from "../db/schema"; // Ensure the schema is imported

/**
 * Better Auth Instance
 */
export const auth = (env: CloudflareBindings): ReturnType<typeof betterAuth> => {
  const sql = neon(env.DATABASE_URL);
  const db = drizzle(sql);

  return betterAuth({
    ...betterAuthOptions,
    database: drizzleAdapter(db, { provider: 'pg' }),
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,

    // 환경에 따른 추가 옵션 ...
  });
};
```

```ts[src/lib/better-auth/options.ts]
import { BetterAuthOptions } from 'better-auth';

/**
 * Custom options for Better Auth
 *
 * Docs: https://www.better-auth.com/docs/reference/options
 */
export const betterAuthOptions: BetterAuthOptions = {
  /**
   * The name of the application.
   */
  appName: 'YOUR_APP_NAME',
  /**
   * Base path for Better Auth.
   * @default "/api/auth"
   */
  basePath: '/api',

  // .... 추가 옵션
};
```

:::

### 2. Better Auth 스키마

Better Auth에 필요한 테이블을 생성하려면 먼저 루트 디렉터리에 다음 파일을 추가합니다.

```ts[better-auth.config.ts]
/**
 * Better Auth CLI configuration file
 *
 * Docs: https://www.better-auth.com/docs/concepts/cli
 */
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { betterAuth } from 'better-auth';
import { betterAuthOptions } from './src/lib/better-auth/options';

const { DATABASE_URL, BETTER_AUTH_URL, BETTER_AUTH_SECRET } = process.env;

const sql = neon(DATABASE_URL!);
const db = drizzle(sql);

export const auth: ReturnType<typeof betterAuth> = betterAuth({
  ...betterAuthOptions,
  database: drizzleAdapter(db, { provider: 'pg', schema }),  // schema is required in order for bettter-auth to recognize
  baseURL: BETTER_AUTH_URL,
  secret: BETTER_AUTH_SECRET,
});
```

그런 다음 다음 스크립트를 실행합니다.

::: code-group

```sh[npm]
npx @better-auth/cli@latest generate --config ./better-auth.config.ts --output ./src/db/schema.ts
```

```sh[pnpm]
pnpm dlx @better-auth/cli@latest generate --config ./better-auth.config.ts --output ./src/db/schema.ts
```

```sh[yarn]
yarn dlx @better-auth/cli@latest generate --config ./better-auth.config.ts --output ./src/db/schema.ts
```

```sh[bun]
bunx @better-auth/cli@latest generate --config ./better-auth.config.ts --output ./src/db/schema.ts
```

:::

### 3. 데이터베이스에 스키마 적용

스키마 파일을 생성한 후 다음 명령을 실행하여 데이터베이스 마이그레이션을 생성하고 적용합니다.
나중에 `wrangler dev`가 작동하려면 랭글러 구성을 확인하여 `process.env`를 올바르게 읽으세요. [`node_compatibility`](https://developers.cloudflare.com/workers/wrangler/configuration/#hyperdrive) 설정이 필요합니다.

::: code-group

```sh[npm]
npx drizzle-kit generate
npx drizzle-kit migrate
```

```sh[pnpm]
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
```

```sh[yarn]
yarn drizzle-kit generate
yarn drizzle-kit migrate
```

```sh[bun]
bunx drizzle-kit generate
bunx drizzle-kit migrate
```

:::

### 4. 핸들러 마운트

Better Auth 핸들러를 Hono 엔드포인트에 마운트하여 마운트 경로가 Better Auth 인스턴스의 `basePath` 설정과 일치하는지 확인합니다.

```ts[src/index.ts]
import { Hono } from 'hono';
import { auth } from './lib/better-auth';

const app = new Hono<{ Bindings: CloudflareBindings }>();

app.on(['GET', 'POST'], '/api/*', (c) => {
  return auth(c.env).handler(c.req.raw);
});

export default app;
```

## 고급의

이 예제는 Hono, Better Auth 및 Drizzle의 공식 문서를 기반으로 구성되었습니다. 그러나 이는 단순한 통합을 넘어 다음과 같은 이점을 제공합니다.

- Cloudflare CLI, Better Auth CLI, Drizzle CLI의 통합을 통한 효율적인 개발.
- 개발 환경과 프로덕션 환경 간의 원활한 전환.
- 스크립트를 사용하여 변경 사항을 일관되게 적용합니다.

귀하의 작업 흐름에 맞는 사용자 정의 스크립트를 사용하여 이 설정을 확장할 수 있습니다. 예를 들어:

```json[package.json]
{
  "scripts": {
    "dev": "wrangler dev",
    "deploy": "pnpm run cf-gen-types && wrangler secret bulk .dev.vars.production && wrangler deploy --minify",
    "cf-gen-types": "wrangler types --env-interface CloudflareBindings",
    "better-auth-gen-schema": "pnpm dlx @better-auth/cli@latest generate --config ./better-auth.config.ts --output ./src/db/schema.ts"
  },
}
```

> 메모:
> 고급 사용법과 최신 옵션에 대해서는 각 도구에 대한 공식 CLI 문서를 참조하세요.
>
> - [Cloudflare CLI](https://developers.cloudflare.com/workers/wrangler/)
> - [Better Auth CLI](https://www.better-auth.com/docs/concepts/cli)
> - [드리즐 ORM CLI](https://orm.drizzle.team/docs/kit-overview)

## 마무리 중

이제 Cloudflare Workers에서 가볍고 빠르며 포괄적인 인증 서비스가 실행됩니다. 서비스 바인딩을 활용하면 이 설정을 통해 대기 시간을 최소화하면서 마이크로서비스 기반 아키텍처를 구축할 수 있습니다.

이 가이드에서는 **기본 예**만 설명하므로 OAuth 또는 속도 제한과 같은 고급 사용 사례의 경우 공식 문서를 참조하고 서비스 요구 사항에 맞게 구성을 조정하세요.

여기에서 전체 예제 소스 코드를 찾을 수 있습니다.
[GitHub 저장소](https://github.com/bytaesu/cloudflare-auth-worker)
