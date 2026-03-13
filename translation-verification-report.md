# Hono 문서 한국어 번역 검증 보고서

검증 일시: 2026-03-13 (Asia/Seoul)

> 이 문서는 초기 감사 결과를 기록한 보고서이며, 이후 같은 날짜에 오번역 교정 작업이 추가로 반영되었습니다.
> 최신 상태 기준으로는 cached upstream(`honojs/website@8a3cf02690d71d2ae1bd5ca9aa683a2c4b3393a2`)과 비교한 구조 검증이 111/111 통과했습니다.

## 범위

- 대상 파일: `docs` 84개 + `examples` 26개 + 루트 `index.md` 1개 = 총 111개 Markdown 페이지
- 기준 목록: `translation-manifest.json`

## 검증 방법

1. `node scripts/verify-translation.mjs`
   - 원문 snapshot과 번역 결과를 비교해 heading 수, 코드 펜스 수, 표 수, admonition 수, 내부 링크 구조를 검증
2. 전 페이지 자동 스캔
   - 고신뢰 오역 패턴: `## 수입`, `신체 제한`, `예쁘다 JSON`, `# 대리`, `# Cloudflare 테스트 중`, `## API을 확보하세요`, `## API으로 전화하세요.`, `## Hono은 어디에 해당되나요?`, `## SSG에게`, `### 비활성화SSG`, `### 만SSG`, `### VITE 플러그인`, `이슬비 ORM`, `랭글러 유형`, `WebAssebly`
3. 대표 문제 파일 수동 확인
   - 줄 번호 기준으로 실제 문맥을 검토

## 결과 요약

- 구조 검증: 111/111 통과
- 고신뢰 번역 오류가 확인된 페이지: 41개
- 추가로 어색한 조사/표현이 다수 남아 있어, 현재 결과물을 "모든 페이지가 정확하게 한국어로 번역되었다"고 판정할 수 없음

## 고신뢰 오류 페이지

| 파일 | 검증 결과 | 확인된 문제 |
| --- | --- | --- |
| `docs/index.md` | 구조 통과 | `신체 제한`, `예쁘다 JSON` |
| `docs/getting-started/webassembly-wasi.md` | 구조 통과 | `WebAssebly` 오타 잔존 |
| `docs/helpers/accepts.md` | 구조 통과 | `## 수입` |
| `docs/helpers/adapter.md` | 구조 통과 | `## 수입` |
| `docs/helpers/conninfo.md` | 구조 통과 | `## 수입` |
| `docs/helpers/cookie.md` | 구조 통과 | `## 수입` |
| `docs/helpers/css.md` | 구조 통과 | `## 수입` |
| `docs/helpers/factory.md` | 구조 통과 | `## 수입` |
| `docs/helpers/html.md` | 구조 통과 | `## 수입` |
| `docs/helpers/jwt.md` | 구조 통과 | `## 수입` |
| `docs/helpers/proxy.md` | 구조 통과 | `## 수입` |
| `docs/helpers/route.md` | 구조 통과 | `## 수입` |
| `docs/helpers/ssg.md` | 구조 통과 | `## SSG에게`, `### 비활성화SSG`, `### 만SSG`, `### VITE 플러그인` |
| `docs/helpers/streaming.md` | 구조 통과 | `## 수입` |
| `docs/helpers/websocket.md` | 구조 통과 | `## 수입` |
| `docs/middleware/builtin/basic-auth.md` | 구조 통과 | `## 수입` |
| `docs/middleware/builtin/bearer-auth.md` | 구조 통과 | `## 수입` |
| `docs/middleware/builtin/body-limit.md` | 구조 통과 | `# 신체 제한 미들웨어`, `## 수입` |
| `docs/middleware/builtin/cache.md` | 구조 통과 | `## 수입` |
| `docs/middleware/builtin/combine.md` | 구조 통과 | `## 수입` |
| `docs/middleware/builtin/compress.md` | 구조 통과 | `## 수입` |
| `docs/middleware/builtin/context-storage.md` | 구조 통과 | `## 수입` |
| `docs/middleware/builtin/cors.md` | 구조 통과 | `## 수입` |
| `docs/middleware/builtin/csrf.md` | 구조 통과 | `## 수입` |
| `docs/middleware/builtin/etag.md` | 구조 통과 | `## 수입` |
| `docs/middleware/builtin/ip-restriction.md` | 구조 통과 | `## 수입` |
| `docs/middleware/builtin/jsx-renderer.md` | 구조 통과 | `## 수입` |
| `docs/middleware/builtin/jwk.md` | 구조 통과 | `## 수입` |
| `docs/middleware/builtin/jwt.md` | 구조 통과 | `## 수입` |
| `docs/middleware/builtin/language.md` | 구조 통과 | `## 수입` |
| `docs/middleware/builtin/logger.md` | 구조 통과 | `## 수입` |
| `docs/middleware/builtin/method-override.md` | 구조 통과 | `## 수입` |
| `docs/middleware/builtin/pretty-json.md` | 구조 통과 | `## 수입` |
| `docs/middleware/builtin/request-id.md` | 구조 통과 | `## 수입` |
| `docs/middleware/builtin/secure-headers.md` | 구조 통과 | `## 수입` |
| `docs/middleware/builtin/timeout.md` | 구조 통과 | `## 수입` |
| `docs/middleware/builtin/timing.md` | 구조 통과 | `## 수입` |
| `docs/middleware/builtin/trailing-slash.md` | 구조 통과 | `## 수입` |
| `examples/better-auth-on-cloudflare.md` | 구조 통과 | `이슬비 ORM`, `랭글러 유형` |
| `examples/cloudflare-vitest.md` | 구조 통과 | `# Cloudflare 테스트 중` |
| `examples/proxy.md` | 구조 통과 | `# 대리` |
| `examples/pylon.md` | 구조 통과 | `## API을 확보하세요`, `## API으로 전화하세요.`, `## Hono은 어디에 해당되나요?` |

## 수동 확인으로 확정한 대표 사례

- `docs/helpers/websocket.md`
  - `## 수입`
  - `WebSocket Helper` 영문 잔존
  - 코드 주석 `A WebSocket object for a client` 영문 잔존
- `docs/helpers/ssg.md`
  - `## SSG에게`
  - `### 비활성화SSG`
  - `### 만SSG`
- `docs/middleware/builtin/body-limit.md`
  - 제목이 `Body Limit`이 아니라 `신체 제한`으로 잘못 번역됨
- `examples/better-auth-on-cloudflare.md`
  - `Drizzle ORM`이 `이슬비 ORM`으로 번역됨
  - `wrangler types`가 `랭글러 유형`으로 번역됨
- `examples/pylon.md`
  - 섹션 제목 세 곳이 문장 의미와 무관하게 깨져 있음
- `examples/cloudflare-vitest.md`
  - 제목 `Cloudflare 테스트 중`은 원문의 의미를 보존하지 못함
  - 예제 값 `my variable`이 `내 변수`로 바뀌어 원문 예시와 달라짐
- `examples/proxy.md`
  - 제목 `Proxy`가 `대리`로 번역됨

## 결론

현재 번역본은 구조적으로는 전체 페이지가 살아 있지만, 의미 보존 측면에서는 다수의 확정 오류가 남아 있습니다. 따라서 전 페이지가 정확하게 한국어로 번역되었다고 볼 수 없으며, 최소한 위의 41개 페이지는 재번역 또는 수동 교정이 필요합니다.
