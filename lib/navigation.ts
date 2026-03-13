export type NavItem = {
  title: string
  href: string
}

export type NavGroup = {
  title: string
  items: NavItem[]
}

export const topNavigation: NavItem[] = [
  { title: '문서', href: '/docs' },
  { title: '예제', href: '/examples' },
  {
    title: '토론',
    href: 'https://github.com/orgs/honojs/discussions',
  },
]

export const docsSidebar: NavGroup[] = [
  {
    title: '소개',
    items: [
      { title: 'Hono 소개', href: '/docs' },
      { title: 'API 개요', href: '/docs/api' },
    ],
  },
  {
    title: '개념',
    items: [
      { title: '동기', href: '/docs/concepts/motivation' },
      { title: '라우터', href: '/docs/concepts/routers' },
      { title: '벤치마크', href: '/docs/concepts/benchmarks' },
      { title: '웹 표준', href: '/docs/concepts/web-standard' },
      { title: '미들웨어', href: '/docs/concepts/middleware' },
      {
        title: '개발자 경험',
        href: '/docs/concepts/developer-experience',
      },
      { title: 'Hono 스택', href: '/docs/concepts/stacks' },
    ],
  },
  {
    title: '시작하기',
    items: [
      { title: '기본', href: '/docs/getting-started/basic' },
      {
        title: 'Cloudflare Workers',
        href: '/docs/getting-started/cloudflare-workers',
      },
      {
        title: 'Cloudflare Pages',
        href: '/docs/getting-started/cloudflare-pages',
      },
      { title: 'Deno', href: '/docs/getting-started/deno' },
      { title: 'Bun', href: '/docs/getting-started/bun' },
      { title: 'Fastly Compute', href: '/docs/getting-started/fastly' },
      { title: 'Vercel', href: '/docs/getting-started/vercel' },
      { title: 'Next.js', href: '/docs/getting-started/nextjs' },
      { title: 'Netlify', href: '/docs/getting-started/netlify' },
      { title: 'AWS Lambda', href: '/docs/getting-started/aws-lambda' },
      { title: 'Lambda@Edge', href: '/docs/getting-started/lambda-edge' },
      {
        title: 'Azure Functions',
        href: '/docs/getting-started/azure-functions',
      },
      {
        title: 'Google Cloud Run',
        href: '/docs/getting-started/google-cloud-run',
      },
      {
        title: 'Supabase Functions',
        href: '/docs/getting-started/supabase-functions',
      },
      {
        title: 'Ali Function Compute',
        href: '/docs/getting-started/ali-function-compute',
      },
      {
        title: 'WebAssembly',
        href: '/docs/getting-started/webassembly-wasi',
      },
      {
        title: 'Service Worker',
        href: '/docs/getting-started/service-worker',
      },
      { title: 'Node.js', href: '/docs/getting-started/nodejs' },
    ],
  },
  {
    title: 'API',
    items: [
      { title: '애플리케이션', href: '/docs/api/hono' },
      { title: '라우팅', href: '/docs/api/routing' },
      { title: 'Context', href: '/docs/api/context' },
      { title: 'HonoRequest', href: '/docs/api/request' },
      { title: '예외', href: '/docs/api/exception' },
      { title: '프리셋', href: '/docs/api/presets' },
    ],
  },
  {
    title: '가이드',
    items: [
      { title: 'create-hono', href: '/docs/guides/create-hono' },
      { title: '예제', href: '/docs/guides/examples' },
      { title: '미들웨어', href: '/docs/guides/middleware' },
      { title: '헬퍼', href: '/docs/guides/helpers' },
      { title: 'JSX', href: '/docs/guides/jsx' },
      {
        title: '클라이언트 구성요소',
        href: '/docs/guides/jsx-dom',
      },
      { title: '테스팅', href: '/docs/guides/testing' },
      { title: '검증', href: '/docs/guides/validation' },
      { title: 'RPC', href: '/docs/guides/rpc' },
      { title: '모범 사례', href: '/docs/guides/best-practices' },
      { title: '기타', href: '/docs/guides/others' },
      { title: '자주 묻는 질문', href: '/docs/guides/faq' },
    ],
  },
  {
    title: '도우미',
    items: [
      { title: 'Accepts', href: '/docs/helpers/accepts' },
      { title: 'Adapter', href: '/docs/helpers/adapter' },
      { title: 'ConnInfo', href: '/docs/helpers/conninfo' },
      { title: 'Cookie', href: '/docs/helpers/cookie' },
      { title: 'css', href: '/docs/helpers/css' },
      { title: 'Dev', href: '/docs/helpers/dev' },
      { title: 'Factory', href: '/docs/helpers/factory' },
      { title: 'html', href: '/docs/helpers/html' },
      { title: 'JWT', href: '/docs/helpers/jwt' },
      { title: 'Proxy', href: '/docs/helpers/proxy' },
      { title: 'Route', href: '/docs/helpers/route' },
      { title: 'SSG', href: '/docs/helpers/ssg' },
      { title: 'Streaming', href: '/docs/helpers/streaming' },
      { title: 'Testing', href: '/docs/helpers/testing' },
      { title: 'WebSocket', href: '/docs/helpers/websocket' },
    ],
  },
  {
    title: '미들웨어',
    items: [
      {
        title: '기본 인증',
        href: '/docs/middleware/builtin/basic-auth',
      },
      {
        title: '베어러 인증',
        href: '/docs/middleware/builtin/bearer-auth',
      },
      {
        title: '본문 크기 제한',
        href: '/docs/middleware/builtin/body-limit',
      },
      { title: 'Cache', href: '/docs/middleware/builtin/cache' },
      { title: 'Combine', href: '/docs/middleware/builtin/combine' },
      { title: 'Compress', href: '/docs/middleware/builtin/compress' },
      {
        title: '컨텍스트 저장소',
        href: '/docs/middleware/builtin/context-storage',
      },
      { title: 'CORS', href: '/docs/middleware/builtin/cors' },
      { title: 'CSRF 보호', href: '/docs/middleware/builtin/csrf' },
      { title: 'ETag', href: '/docs/middleware/builtin/etag' },
      {
        title: 'IP 제한',
        href: '/docs/middleware/builtin/ip-restriction',
      },
      {
        title: 'JSX 렌더러',
        href: '/docs/middleware/builtin/jsx-renderer',
      },
      { title: 'JWK', href: '/docs/middleware/builtin/jwk' },
      { title: 'JWT', href: '/docs/middleware/builtin/jwt' },
      { title: 'Logger', href: '/docs/middleware/builtin/logger' },
      { title: 'Language', href: '/docs/middleware/builtin/language' },
      {
        title: '메서드 재정의',
        href: '/docs/middleware/builtin/method-override',
      },
      {
        title: 'Pretty JSON',
        href: '/docs/middleware/builtin/pretty-json',
      },
      {
        title: '요청 ID',
        href: '/docs/middleware/builtin/request-id',
      },
      {
        title: '보안 헤더',
        href: '/docs/middleware/builtin/secure-headers',
      },
      { title: 'Timeout', href: '/docs/middleware/builtin/timeout' },
      { title: 'Timing', href: '/docs/middleware/builtin/timing' },
      {
        title: '후행 슬래시',
        href: '/docs/middleware/builtin/trailing-slash',
      },
      {
        title: '서드파티 미들웨어',
        href: '/docs/middleware/third-party',
      },
    ],
  },
  {
    title: 'LLM',
    items: [
      { title: '문서 목록', href: '/llms.txt' },
      { title: '전체 문서', href: '/llms-full.txt' },
      { title: '작은 문서', href: '/llms-small.txt' },
    ],
  },
]

export const examplesSidebar: NavGroup[] = [
  {
    title: '애플리케이션',
    items: [
      { title: '웹 API', href: '/examples/web-api' },
      { title: '프록시', href: '/examples/proxy' },
      { title: '파일 업로드', href: '/examples/file-upload' },
      {
        title: '리버스 프록시 바인딩',
        href: '/examples/behind-reverse-proxy',
      },
      {
        title: 'Validator 오류 처리',
        href: '/examples/validator-error-handling',
      },
      {
        title: 'RPC에 대한 경로 그룹화',
        href: '/examples/grouping-routes-rpc',
      },
      { title: 'CBOR', href: '/examples/cbor' },
    ],
  },
  {
    title: '서드파티 미들웨어',
    items: [
      { title: 'Zod OpenAPI', href: '/examples/zod-openapi' },
      { title: 'Hono OpenAPI', href: '/examples/hono-openapi' },
      { title: 'Swagger UI', href: '/examples/swagger-ui' },
      { title: 'Scalar', href: '/examples/scalar' },
      { title: 'Hono Docs Generator', href: '/examples/hono-docs' },
    ],
  },
  {
    title: '통합',
    items: [
      {
        title: 'Cloudflare Durable Objects',
        href: '/examples/cloudflare-durable-objects',
      },
      {
        title: 'Cloudflare Queues',
        href: '/examples/cloudflare-queue',
      },
      { title: 'Cloudflare 테스트', href: '/examples/cloudflare-vitest' },
      { title: 'Remix', href: '/examples/with-remix' },
      { title: 'htmx', href: '/examples/htmx' },
      { title: 'Stripe Webhook', href: '/examples/stripe-webhook' },
      { title: 'Cloudflare에서 Prisma 사용', href: '/examples/prisma' },
      { title: 'Better Auth', href: '/examples/better-auth' },
      {
        title: 'Cloudflare에서 Better Auth 사용',
        href: '/examples/better-auth-on-cloudflare',
      },
      { title: 'Pylon (GraphQL)', href: '/examples/pylon' },
      { title: 'Stytch Authentication', href: '/examples/stytch-auth' },
      { title: 'Auth.js', href: '/examples/hono-authjs' },
      { title: 'Apitally (모니터링)', href: '/examples/apitally' },
    ],
  },
]

export const docsSequence = dedupe([
  '/docs',
  ...flattenGroups(docsSidebar).map((item) => item.href),
])

export const examplesSequence = dedupe([
  '/examples',
  ...flattenGroups(examplesSidebar).map((item) => item.href),
])

export function flattenGroups(groups: NavGroup[]): NavItem[] {
  return groups.flatMap((group) => group.items)
}

export function getSidebar(kind: 'docs' | 'examples') {
  return kind === 'docs' ? docsSidebar : examplesSidebar
}

export function findNeighbors(
  kind: 'docs' | 'examples',
  href: string
): { prev?: NavItem; next?: NavItem } {
  const sequence = kind === 'docs' ? docsSequence : examplesSequence
  const index = sequence.indexOf(href)
  if (index === -1) {
    return {}
  }
  const items =
    kind === 'docs'
      ? [
          { title: 'Hono 소개', href: '/docs' },
          ...flattenGroups(docsSidebar),
        ]
      : [
          { title: '예제 홈', href: '/examples' },
          ...flattenGroups(examplesSidebar),
        ]

  return {
    prev: items.find((item) => item.href === sequence[index - 1]),
    next: items.find((item) => item.href === sequence[index + 1]),
  }
}

function dedupe(items: string[]) {
  return [...new Set(items)]
}
