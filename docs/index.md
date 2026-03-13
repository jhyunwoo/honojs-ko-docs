---
title: Hono - 웹 표준을 기반으로 구축된 웹 프레임워크
titleTemplate: ':title'
---

# Hono

Hono - _**일본어로 불꽃🔥을 의미**_ - 웹 표준을 기반으로 구축된 작고 단순하며 초고속 웹 프레임워크입니다.
JavaScript 런타임(Cloudflare Workers, Fastly Compute, Deno, Bun, Vercel, Netlify, AWS Lambda, Lambda@Edge 및 Node.js)에서 작동합니다.

빠르지만 빠르기만 한 것은 아닙니다.

```ts twoslash
import { Hono } from 'hono'
const app = new Hono()

app.get('/', (c) => c.text('Hono!'))

export default app
```

## 빠른 시작

이것을 실행하세요:

::: code-group

```sh [npm]
npm create hono@latest
```

```sh [yarn]
yarn create hono
```

```sh [pnpm]
pnpm create hono@latest
```

```sh [bun]
bun create hono@latest
```

```sh [deno]
deno init --npm hono@latest
```

:::

## 특징

- **초고속** 🚀 - 라우터 `RegExpRouter`는 정말 빠릅니다. 선형 루프를 사용하지 않습니다. 빠른.
- **경량** 🪶 - `hono/tiny` 사전 설정은 14kB 미만입니다. Hono는 종속성이 없으며 웹 표준만 사용합니다.
- **다중 런타임** 🌍 - Cloudflare Workers, Fastly Compute, Deno, Bun, AWS Lambda 또는 Node.js에서 작동합니다. 모든 플랫폼에서 동일한 코드가 실행됩니다.
- **배터리 포함** 🔋 - Hono에는 미들웨어, 맞춤형 미들웨어, 타사 미들웨어 및 도우미가 내장되어 있습니다. 배터리가 포함되어 있습니다.
- **유쾌한 DX** 😃 - 매우 깨끗한 API. 일류 TypeScript 지원. 이제 "유형"이 있습니다.

## 사용 사례

Hono는 프런트엔드가 없는 Express와 유사한 간단한 웹 애플리케이션 프레임워크입니다.
그러나 CDN Edge에서 실행되며 미들웨어와 결합하면 더 큰 애플리케이션을 구축할 수 있습니다.
다음은 사용 사례의 몇 가지 예입니다.

- 웹 API 구축
- 백엔드 서버의 프록시
- CDN 앞
- 엣지 애플리케이션
- 도서관용 기본 서버
- 풀스택 애플리케이션

## Hono를 사용하는 사람은 누구입니까?

| 프로젝트                                                                            | 플랫폼           | 무엇 때문에?                                                                                                   |
| ---------------------------------------------------------------------------------- | ------------------ | ----------------------------------------------------------------------------------------------------------- |
| [cdnjs](https://cdnjs.com)                                                         | Cloudflare Workers | 무료 오픈 소스 CDN 서비스입니다. _Hono는 API 서버_에 사용됩니다.                                      |
| [Cloudflare D1](https://www.cloudflare.com/developer-platform/d1/)                 | Cloudflare Workers | 서버리스 SQL 데이터베이스. _Hono는 내부 API 서버_에 사용됩니다.                                       |
| [Cloudflare Workers KV](https://www.cloudflare.com/developer-platform/workers-kv/) | Cloudflare Workers | 서버리스 키-값 데이터베이스. _Hono는 내부 API 서버_에 사용됩니다.                                  |
| [베이스AI](https://baseai.dev)                                                       | 로컬 AI 서버    | 메모리가 포함된 서버리스 AI 에이전트 파이프. 웹용 오픈 소스 에이전트 AI 프레임워크입니다. _Hono_가 있는 _API 서버. |
| [키 해제](https://unkey.dev)                                                         | Cloudflare Workers | 오픈 소스 API 인증 및 승인. _Hono는 API 서버_에 사용됩니다.                     |
| [열린상태](https://openstatus.dev)                                               | Bun                | 오픈 소스 웹사이트 및 API 모니터링 플랫폼. _Hono는 API 서버_에 사용됩니다.                        |
| [Deno 벤치마크](https://deno.com/benchmarks)                                     | Deno               | V8을 기반으로 구축된 보안 TypeScript 런타임. _Hono는 벤치마킹에 사용됩니다_.                                   |
| [점원](https://clerk.com)                                                         | Cloudflare Workers | 오픈 소스 사용자 관리 플랫폼. _Hono는 API 서버_에 사용됩니다.                                 |

그리고 다음.

- [드라이블리](https://driv.ly/) - Cloudflare Workers
- [repeat.dev](https://repeat.dev/) - Cloudflare Workers

더 보고 싶나요? [프로덕션에서 누가 Hono를 사용하고 있습니까?](https://github.com/orgs/honojs/discussions/1510)를 참조하세요.

## 1분 안에 Hono

Hono를 사용하여 Cloudflare Workers용 애플리케이션을 만드는 데모입니다.

![빠른 반복을 통해 빠르게 생성되는 hono 앱을 보여주는 gif](/images/sc.gif)

## 초고속

**Hono는 Cloudflare Workers의 다른 라우터에 비해 가장 빠릅니다**.

```
Hono x 402,820 ops/sec ±4.78% (80 runs sampled)
itty-router x 212,598 ops/sec ±3.11% (87 runs sampled)
sunder x 297,036 ops/sec ±4.76% (77 runs sampled)
worktop x 197,345 ops/sec ±2.40% (88 runs sampled)
Fastest is Hono
✨  Done in 28.06s.
```

[더 많은 벤치마크](/docs/concepts/benchmarks)를 참조하세요.

## 경량

**Hono는 너무 작습니다**. `hono/tiny` 사전 설정을 사용하면 축소 시 크기가 **14KB 미만**입니다. 미들웨어와 어댑터가 많이 있는데, 사용하는 경우에만 bundled됩니다. 문맥상 Express의 크기는 572KB입니다.

```
$ npx wrangler dev --minify ./src/index.ts
 ⛅️ wrangler 2.20.0
--------------------
⬣ Listening at http://0.0.0.0:8787
- http://127.0.0.1:8787
- http://192.168.128.165:8787
Total Upload: 11.47 KiB / gzip: 4.34 KiB
```

## 다중 라우터

**Hono에는 여러 개의 라우터가 있습니다**.

**RegExpRouter**는 JavaScript 세계에서 가장 빠른 라우터입니다. 발송 전에 생성된 단일 대형 Regex를 사용하여 경로를 일치시킵니다. **SmartRouter**를 사용하면 모든 경로 패턴을 지원합니다.

**LinearRouter**는 매우 빠르게 경로를 등록하므로 매번 애플리케이션을 초기화하는 환경에 적합합니다. **PatternRouter**는 단순히 패턴을 추가하고 일치시켜 작게 만듭니다.

[경로에 대한 자세한 내용](/docs/concepts/routers)을 참조하세요.

## 웹 표준

**웹 표준**을 사용함으로써 Hono는 다양한 플랫폼에서 작동합니다.

- Cloudflare Workers
- Cloudflare Pages
- Fastly Compute
- Deno
- Bun
- Vercel
- AWS 람다
- Lambda@Edge
- 기타

그리고 [Node.js 어댑터](https://github.com/honojs/node-server)를 사용하면 Hono가 Node.js에서 작동합니다.

[웹 표준에 대한 추가 정보](/docs/concepts/web-standard)를 참조하세요.

## 미들웨어 및 도우미

**Hono에는 많은 미들웨어와 도우미가 있습니다**. 이는 "적게 작성하고 더 많은 작업을 수행"하는 것을 현실로 만듭니다.

기본적으로 Hono는 다음을 위한 미들웨어와 도우미를 제공합니다.

- [기본인증](/docs/middleware/builtin/basic-auth)
- [베어러 인증](/docs/middleware/builtin/bearer-auth)
- [신체 제한](/docs/middleware/builtin/body-limit)
- [캐시](/docs/middleware/builtin/cache)
- [압축](/docs/middleware/builtin/compress)
- [컨텍스트 저장](/docs/middleware/builtin/context-storage)
- [쿠키](/docs/helpers/cookie)
- [CORS](/docs/middleware/builtin/cors)
- [ETag](/docs/middleware/builtin/etag)
- [html](/docs/helpers/html)
- [JSX](/docs/guides/jsx)
- [JWT 인증](/docs/middleware/builtin/jwt)
- [로거](/docs/middleware/builtin/logger)
- [언어](/docs/middleware/builtin/language)
- [예쁘다 JSON](/docs/middleware/builtin/pretty-json)
- [보안 헤더](/docs/middleware/builtin/secure-headers)
- [SSG](/docs/helpers/ssg)
- [스트리밍](/docs/helpers/streaming)
- [GraphQL 서버](https://github.com/honojs/middleware/tree/main/packages/graphql-server)
- [Firebase 인증](https://github.com/honojs/middleware/tree/main/packages/firebase-auth)
- [센트리](https://github.com/honojs/middleware/tree/main/packages/sentry)
- 기타!

예를 들어 ETag를 추가하고 로깅을 요청하려면 Hono를 사용하여 몇 줄의 코드만 사용하면 됩니다.

```ts
import { Hono } from 'hono'
import { etag } from 'hono/etag'
import { logger } from 'hono/logger'

const app = new Hono()
app.use(etag(), logger())
```

[미들웨어에 대한 추가 정보](/docs/concepts/middleware)를 참조하세요.

## 개발자 경험

Hono는 즐거운 "**개발자 경험**"을 제공합니다.

`Context` 개체 덕분에 요청/응답에 쉽게 액세스할 수 있습니다.
또한 Hono는 TypeScript로 작성됩니다. Hono에는 "**유형**"이 있습니다.

예를 들어, 경로 매개변수는 리터럴 유형입니다.

![URL 매개변수에 적절한 리터럴 입력이 있는 Hono를 보여주는 스크린샷. URL "/entry/:date/:id"에서는 요청 매개변수가 "date" 또는 "id"](/images/ss.png)가 되도록 허용합니다.

그리고 Validator와 Hono 클라이언트 `hc`는 RPC 모드를 활성화합니다. RPC 모드에서는
Zod와 같이 선호하는 유효성 검사기를 사용하고 서버 측 API 사양을 클라이언트와 쉽게 공유하고 유형이 안전한 애플리케이션을 구축할 수 있습니다.

[Hono 스택](/docs/concepts/stacks)을 참조하세요.
