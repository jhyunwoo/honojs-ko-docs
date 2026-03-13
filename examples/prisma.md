# Cloudflare Workers에서 Prisma 사용

[Prisma ORM](https://www.prisma.io/docs?utm_source=hono&utm_medium=website&utm_campaign=workers)은 데이터베이스와 상호 작용하기 위한 현대적이고 강력한 툴킷을 제공합니다. Hono 및 Cloudflare Workers와 함께 사용하면 엣지에 고성능 서버리스 애플리케이션을 배포할 수 있습니다.

이 가이드에서는 Hono에서 Prisma ORM을 사용하는 두 가지 서로 다른 접근 방식을 다룹니다.

- [**Prisma 포스트그레스**](#using-prisma-postgres):
Prisma와의 관리형 서버리스 PostgreSQL 데이터베이스 통합입니다. Prisma Postgres에는 [서버리스 및 엣지 환경의 확장 문제](https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/databases-connections?utm_source=hono&utm_medium=website&utm_campaign=workers#the-serverless-challenge)를 완화하는 제로 콜드 스타트 ​​기능이 내장된 연결 풀링이 내장되어 있으므로 이 접근 방식은 프로덕션 준비 설정에 적합합니다.

- [**드라이버 어댑터**](#using-prisma-driver-adapters):
Prisma의 유연한 드라이버 어댑터를 사용하는 대안으로, Prisma ORM이 지원하는 모든 데이터베이스에 연결할 수 있습니다.

두 접근 방식 모두 고유한 장점이 있으므로 프로젝트 요구 사항에 가장 적합한 접근 방식을 선택할 수 있습니다.

## Prisma Postgres 사용

[Prisma Postgres](https://www.prisma.io/postgres?utm_source=hono&utm_medium=website&utm_campaign=workers)는 유니커널을 기반으로 구축된 관리형 서버리스 PostgreSQL 데이터베이스입니다. 연결 풀링, 캐싱, 쿼리 최적화 권장 사항과 같은 기능을 지원합니다. 초기 개발, 테스트 및 취미 프로젝트에는 넉넉한 무료 등급이 제공됩니다.

### 1. Prisma 및 필수 종속성을 설치합니다.

Hono 프로젝트에 Prisma를 설치합니다.

```bash
npm i prisma --save-dev
```

Prisma Postgres에 필요한 [Prisma 클라이언트 확장](https://www.npmjs.com/package/@prisma/extension-accelerate)을 설치합니다.

```sh
npm i @prisma/extension-accelerate
```

Prisma Postgres 인스턴스로 Prisma를 초기화합니다.

```bash
npx prisma@latest init --db
```

아직 [Prisma 데이터 플랫폼](https://console.prisma.io/?utm_source=hono&utm_medium=website&utm_campaign=workers) 계정이 없거나 로그인하지 않은 경우 명령을 실행하면 사용 가능한 인증 공급자 중 하나를 사용하여 로그인하라는 메시지가 표시됩니다. 로그인하거나 계정을 만들 수 있는 브라우저 창이 열립니다. 이 단계를 완료한 후 CLI로 돌아갑니다.

로그인하면(또는 이미 로그인한 경우) CLI에서 프로젝트 이름과 데이터베이스 영역을 선택하라는 메시지를 표시합니다.

명령이 종료되면 다음이 생성됩니다.

- Prisma Postgres 데이터베이스 인스턴스가 포함된 [플랫폼 콘솔](https://console.prisma.io/?utm_source=hono&utm_medium=website&utm_campaign=workers)의 프로젝트입니다.
- 데이터베이스 스키마를 정의할 `schema.prisma`가 포함된 `prisma` 폴더.
- Prisma Postgres 데이터베이스 URL `DATABASE_URL=<your-prisma-postgres-database-url>`를 포함할 프로젝트 루트의 `.env` 파일.

`.dev.vars` 파일을 생성하고 여기에 `DATABASE_URL`를 저장합니다.
::: code-group

```bash [.dev.vars]
DATABASE_URL="your_prisma_postgres_url"
```

:::

나중에 Prisma CLI가 마이그레이션을 수행하거나 [Prisma 클라이언트](https://www.prisma.io/docs/orm/prisma-client?utm_source=hono&utm_medium=website&utm_campaign=workers)를 생성하거나 [Prisma Studio](https://www.prisma.io/docs/orm/tools/prisma-studio?utm_source=hono&utm_medium=website&utm_campaign=workers)를 열 수 있도록 `.env` 파일을 보관하세요.

### 2. 프로젝트에서 Prisma를 설정합니다.

이제 `schema.prisma` 파일을 열고 데이터베이스 스키마에 대한 모델을 정의하십시오. 예를 들어 `User` 모델을 추가할 수 있습니다.

::: code-group

```ts [schema.prisma]
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id  Int @id @default(autoincrement())
  email String
  name 	String
}
```

:::

[Prisma 마이그레이션](https://www.prisma.io/docs/orm/prisma-migrate)을 사용하여 데이터베이스에 변경 사항을 적용합니다.

```bash
npx prisma migrate dev
```

나중에 프로젝트에서 사용할 수 있는 다음과 같은 함수를 만듭니다.

::: code-group

```ts [prismaFunction.ts]
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'

export const getPrisma = (database_url: string) => {
  const prisma = new PrismaClient({
    datasourceUrl: database_url,
  }).$extends(withAccelerate())
  return prisma
}
```

:::

다음은 프로젝트에서 이 기능을 사용하는 방법에 대한 예입니다.

::: code-group

```ts [index.ts]
import { Hono } from 'hono'
import { sign, verify } from 'hono/jwt'
import { getPrisma } from '../usefulFun/prismaFun'

// 기본 Hono 앱 만들기
const app = new Hono<{
  Bindings: {
    DATABASE_URL: string
    JWT_SECRET: string
  }
  Variables: {
    userId: string
  }
}>()

app.post('/', async (c) => {
  // 이제 원하는 곳 어디에서나 사용할 수 있습니다.
  const prisma = getPrisma(c.env.DATABASE_URL)
})
```

:::

**Prisma ORM으로 자체 데이터베이스를 사용**하고 연결 풀링 및 에지 캐싱의 이점을 활용하려면 Prisma Accelerate를 활성화하면 됩니다. 프로젝트의 [Prisma 가속](https://www.prisma.io/docs/accelerate/getting-started?utm_source=hono&utm_medium=website&utm_campaign=workers) 설정에 대해 자세히 알아보세요.

## Prisma 드라이버 어댑터 사용

Prisma는 `driverAdapters`를 통해 D1 데이터베이스와 함께 사용할 수 있습니다. 전제 조건은 Prisma를 설치하고 Wrangler를 통합하여 Hono 프로젝트와 바인딩하는 것입니다. Hono, Prisma 및 D1 Cloudflare에 대한 모든 문서가 분리되어 있고 정확하고 정확한 단계별 지침이 없기 때문에 이것은 예제 프로젝트입니다.

### Prisma 설정

Prisma 및 D1은 Wrangler의 바인딩을 사용하여 어댑터와의 연결을 보호합니다.

```bash
npm install prisma --save-dev
npx prisma init
npm install @prisma/client
npm install @prisma/adapter-d1
```

그런 다음 Prisma는 데이터베이스에 대한 스키마를 생성합니다. `prisma/schema.prisma`에 간단한 모델을 정의합니다. 어댑터를 바꾸는 것을 잊지 마십시오.

```ts [prisma/schema.prisma]
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["driverAdapters"] // change from default
}

datasource db {
  provider = "sqlite" // d1 is sql base database
  url      = env("DATABASE_URL")
}

// 간단한 모델 데이터베이스 만들기
model User {
  id    String @id  @default(uuid())
  email String  @unique
  name  String?
}


```

### D1 데이터베이스

이미 D1 데이터베이스가 준비되어 있으면 이 단계를 건너뛰세요. 하지만 그렇지 않은 경우 [여기](https://developers.cloudflare.com/d1/get-started/)에서 찾을 수 있는 리소스를 하나 만드세요.

```bash
npx wrangler d1 create __DATABASE_NAME__ // change it with yours
```

DB가 `wrangler.toml`에 바인딩되어 있는지 확인하세요.

```toml [wrangler.toml]
[[d1_databases]]
binding = "DB" # i.e. available in your Worker on env.DB
database_name = "__DATABASE_NAME__"
database_id = "DATABASE ID"

```

### Prisma 마이그레이션

이 명령은 Prisma를 마이그레이션하고 로컬 또는 원격으로 D1 데이터베이스로 변경합니다.

```bash
npx wrangler d1 migrations create __DATABASE_NAME__ create_user_table # will generate migration folder and sql file

// SQL 문 생성을 위해

npx prisma migrate diff \
  --from-empty \
  --to-schema-datamodel ./prisma/schema.prisma \
  --script \
  --output migrations/0001_create_user_table.sql

```

데이터베이스 모델을 D1으로 마이그레이션합니다.

```bash
npx wrangler d1 migrations apply __DATABASE_NAME__ --local
npx wrangler d1 migrations apply __DATABASE_NAME__ --remote
npx prisma generate

```

### Prisma 클라이언트 구성

Prisma를 사용하여 D1 데이터베이스에서 데이터베이스를 쿼리하려면 다음을 사용하여 유형을 추가해야 합니다.

```bash
npx wrangler types
```

`worker-configuration.d.ts` 파일을 생성합니다.

#### Prisma 클라이언트

Prisma를 전역적으로 사용하려면 다음과 같은 코드로 `lib/prismaClient.ts` 파일을 만드세요.

::: code-group

```ts [lib/prisma.ts]
import { PrismaClient } from '@prisma/client'
import { PrismaD1 } from '@prisma/adapter-d1'

const prismaClients = {
  async fetch(db: D1Database) {
    const adapter = new PrismaD1(db)
    const prisma = new PrismaClient({ adapter })
    return prisma
  },
}

export default prismaClients
```

:::

Wrangler 환경 값으로 Hono 바인딩:

::: code-group

```ts [src/index.ts]
import { Hono } from 'hono'
import prismaClients from '../lib/prismaClient'

type Bindings = {
  MY_KV: KVNamespace
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>() // binding env value
```

:::

Hono 경로에서의 사용 예:

::: code-group

```ts [src/index.ts]
import { Hono } from 'hono'
import prismaClients from '../lib/prismaClient'

type Bindings = {
  MY_KV: KVNamespace
  DB: D1Database
}
const app = new Hono<{ Bindings: Bindings }>()

app.get('/', async (c) => {
  const prisma = await prismaClients.fetch(c.env.DB)
  const users = await prisma.user.findMany()
  console.log('users', users)
  return c.json(users)
})

export default app
```

:::

그러면 Postman 또는 Thunder 클라이언트를 사용하여 결과를 확인하는 `/` 경로의 모든 사용자가 반환됩니다.

## 자원

다음 리소스를 사용하여 애플리케이션을 더욱 향상할 수 있습니다.

- 쿼리에 [캐싱](https://www.prisma.io/docs/postgres/caching?utm_source=hono&utm_medium=website&utm_campaign=workers)을 추가하세요.
- [Prisma Postgres 문서](https://www.prisma.io/docs/postgres/getting-started?utm_source=hono&utm_medium=website&utm_campaign=workers)를 살펴보세요.
