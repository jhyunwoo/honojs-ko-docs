# 타사 미들웨어

타사 미들웨어는 Hono 패키지 내에서 bundled가 아닌 미들웨어를 나타냅니다.
이 미들웨어의 대부분은 외부 라이브러리를 활용합니다.

### 입증

- [Auth.js(다음 인증)](https://github.com/honojs/middleware/tree/main/packages/auth-js)
- [카스빈](https://github.com/honojs/middleware/tree/main/packages/casbin)
- [서기 인증](https://github.com/honojs/middleware/tree/main/packages/clerk-auth)
- [Cloudflare 액세스](https://github.com/honojs/middleware/tree/main/packages/cloudflare-access)
- [OAuth 제공업체](https://github.com/honojs/middleware/tree/main/packages/oauth-providers)
- [OIDC 인증](https://github.com/honojs/middleware/tree/main/packages/oidc-auth)
- [Firebase 인증](https://github.com/honojs/middleware/tree/main/packages/firebase-auth)
- [RSA 확인 JWT(JWKS)](https://github.com/wataruoguchi/verify-rsa-jwt-cloudflare-worker)
- [Stytch 인증](https://github.com/honojs/middleware/tree/main/packages/stytch-auth)

### 검증인

- [Ajv 검증기](https://github.com/honojs/middleware/tree/main/packages/ajv-validator)
- [Ark 유형 검증기](https://github.com/honojs/middleware/tree/main/packages/arktype-validator)
- [클래스 검증자](https://github.com/honojs/middleware/tree/main/packages/class-validator)
- [적합성 검증기](https://github.com/honojs/middleware/tree/main/packages/conform-validator)
- [효과 스키마 검사기](https://github.com/honojs/middleware/tree/main/packages/effect-validator)
- [표준 스키마 검사기](https://github.com/honojs/middleware/tree/main/packages/standard-validator)
- [TypeBox 유효성 검사기](https://github.com/honojs/middleware/tree/main/packages/typebox-validator)
- [타이피아 검증기](https://github.com/honojs/middleware/tree/main/packages/typia-validator)
- [unknownutil 유효성 검사기](https://github.com/ryoppippi/hono-unknownutil-validator)
- [발리봇 검증기](https://github.com/honojs/middleware/tree/main/packages/valibot-validator)
- [Zod 검증인](https://github.com/honojs/middleware/tree/main/packages/zod-validator)

### OpenAPI

- [Zod OpenAPI](https://github.com/honojs/middleware/tree/main/packages/zod-openapi)
- [Scalar](https://github.com/scalar/scalar/tree/main/integrations/hono)
- [Swagger UI](https://github.com/honojs/middleware/tree/main/packages/swagger-ui)
- [스웨거 에디터](https://github.com/honojs/middleware/tree/main/packages/swagger-editor)
- [Hono OpenAPI](https://github.com/rhinobase/hono-openapi)
- [hono-zod-openapi](https://github.com/paolostyle/hono-zod-openapi)

### 개발

- [ESLint 구성](https://github.com/honojs/middleware/tree/main/packages/eslint-config)
- [SSG 플러그인 필수](https://github.com/honojs/middleware/tree/main/packages/ssg-plugins-essential)

### 모니터링/추적

- [Apitally (API 모니터링 및 분석)](https://docs.apitally.io/frameworks/hono)
- [하이라이트.io](https://www.highlight.io/docs/getting-started/backend-sdk/js/hono)
- [로그테이프(로깅)](https://logtape.org/manual/integrations#hono)
- [오픈원격측정](https://github.com/honojs/middleware/tree/main/packages/otel)
- [프로메테우스 지표](https://github.com/honojs/middleware/tree/main/packages/prometheus)
- [센트리](https://github.com/honojs/middleware/tree/main/packages/sentry)

### 서버/어댑터

- [GraphQL 서버](https://github.com/honojs/middleware/tree/main/packages/graphql-server)
- [노드 WebSocket 도우미](https://github.com/honojs/middleware/tree/main/packages/node-ws)
- [tRPC 서버](https://github.com/honojs/middleware/tree/main/packages/trpc-server)

### 트랜스파일러

- [Bun 트랜스파일러](https://github.com/honojs/middleware/tree/main/packages/bun-transpiler)
- [esbuild 트랜스파일러](https://github.com/honojs/middleware/tree/main/packages/esbuild-transpiler)

### UI/렌더러

- [퀵시티](https://github.com/honojs/middleware/tree/main/packages/qwik-city)
- [리액트 호환성](https://github.com/honojs/middleware/tree/main/packages/react-compat)
- [리액트 렌더러](https://github.com/honojs/middleware/tree/main/packages/react-renderer)

### 대기열/작업 처리

- [GlideMQ(메시지 큐 REST API + SSE)](https://github.com/avifenesh/glidemq-hono)

### 유용

- [Bun 압축](https://github.com/honojs/middleware/tree/main/packages/bun-compress)
- [캡 체크포인트](https://capjs.js.org/guide/middleware/hono.html)
- [이벤트 이미터](https://github.com/honojs/middleware/tree/main/packages/event-emitter)
- [지역](https://github.com/ktkongtong/hono-geo-middleware/tree/main/packages/middleware)
- [Hono 속도 제한기](https://github.com/rhinobase/hono-rate-limiter)
- [Hono 문제 세부 정보(RFC 9457)](https://github.com/paveg/hono-problem-details)
- [Hono 단순 DI](https://github.com/maou-shonen/hono-simple-DI)
- [멱등성(스트라이프 스타일 멱등성 키)](https://github.com/paveg/hono-idempotency)
- [jsonv-ts(검증기, OpenAPI, MCP)](https://github.com/dswbx/jsonv-ts)
- [MCP](https://github.com/honojs/middleware/tree/main/packages/mcp)
- [로닌(데이터베이스)](https://github.com/ronin-co/hono-client)
- [세션](https://github.com/honojs/middleware/tree/main/packages/session)
- [주사기](https://github.com/honojs/middleware/tree/main/packages/tsyringe)
- [사용자 에이전트 기반 차단](https://github.com/honojs/middleware/tree/main/packages/ua-blocker)
