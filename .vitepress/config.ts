import { defineConfig } from 'vitepress'
import type { DefaultTheme } from 'vitepress'
import {
  groupIconMdPlugin,
  groupIconVitePlugin,
} from 'vitepress-plugin-group-icons'
import { transformerTwoslash } from '@shikijs/vitepress-twoslash'
import { createFileSystemTypesCache } from '@shikijs/vitepress-twoslash/cache-fs'

const sidebars = (): DefaultTheme.SidebarItem[] => [
  {
    text: '개념',
    collapsed: true,
    items: [
      { text: '동기', link: '/docs/concepts/motivation' },
      { text: '라우터', link: '/docs/concepts/routers' },
      { text: '벤치마크', link: '/docs/concepts/benchmarks' },
      { text: '웹 표준', link: '/docs/concepts/web-standard' },
      { text: '미들웨어', link: '/docs/concepts/middleware' },
      {
        text: '개발자 경험',
        link: '/docs/concepts/developer-experience',
      },
      { text: 'Hono 스택', link: '/docs/concepts/stacks' },
    ],
  },
  {
    text: '시작하기',
    collapsed: true,
    items: [
      { text: '기본', link: '/docs/getting-started/basic' },
      {
        text: 'Cloudflare Workers',
        link: '/docs/getting-started/cloudflare-workers',
      },
      {
        text: 'Cloudflare Pages',
        link: '/docs/getting-started/cloudflare-pages',
      },
      { text: 'Deno', link: '/docs/getting-started/deno' },
      { text: 'Bun', link: '/docs/getting-started/bun' },
      {
        text: 'Fastly Compute',
        link: '/docs/getting-started/fastly',
      },
      { text: 'Vercel', link: '/docs/getting-started/vercel' },
      { text: 'Next.js', link: '/docs/getting-started/nextjs' },
      { text: 'Netlify', link: '/docs/getting-started/netlify' },
      {
        text: 'AWS 람다',
        link: '/docs/getting-started/aws-lambda',
      },
      {
        text: 'Lambda@Edge',
        link: '/docs/getting-started/lambda-edge',
      },
      {
        text: 'Azure Functions',
        link: '/docs/getting-started/azure-functions',
      },
      {
        text: 'Google Cloud Run',
        link: '/docs/getting-started/google-cloud-run',
      },
      {
        text: 'Supabase Functions',
        link: '/docs/getting-started/supabase-functions',
      },
      {
        text: 'Ali Function Compute',
        link: '/docs/getting-started/ali-function-compute',
      },
      {
        text: 'WebAssembly',
        link: '/docs/getting-started/webassembly-wasi',
      },
      {
        text: 'Service Worker',
        link: '/docs/getting-started/service-worker',
      },
      { text: 'Node.js', link: '/docs/getting-started/nodejs' },
    ],
  },
  {
    text: 'API',
    collapsed: true,
    items: [
      { text: '애플리케이션', link: '/docs/api/hono' },
      { text: '라우팅', link: '/docs/api/routing' },
      { text: 'Context', link: '/docs/api/context' },
      { text: 'HonoRequest', link: '/docs/api/request' },
      { text: '예외', link: '/docs/api/exception' },
      { text: '프리셋', link: '/docs/api/presets' },
    ],
  },
  {
    text: '가이드',
    collapsed: true,
    items: [
      { text: 'create-hono', link: '/docs/guides/create-hono' },
      { text: '미들웨어', link: '/docs/guides/middleware' },
      { text: '헬퍼', link: '/docs/guides/helpers' },
      {
        text: 'JSX',
        link: '/docs/guides/jsx',
      },
      {
        text: '클라이언트 구성요소',
        link: '/docs/guides/jsx-dom',
      },
      { text: '테스팅', link: '/docs/guides/testing' },
      {
        text: '검증',
        link: '/docs/guides/validation',
      },
      {
        text: 'RPC',
        link: '/docs/guides/rpc',
      },
      {
        text: '모범 사례',
        link: '/docs/guides/best-practices',
      },
      {
        text: '기타',
        link: '/docs/guides/others',
      },
      {
        text: '자주 묻는 질문',
        link: '/docs/guides/faq',
      },
    ],
  },
  {
    text: '도우미',
    collapsed: true,
    items: [
      { text: 'Accepts', link: '/docs/helpers/accepts' },
      { text: 'Adapter', link: '/docs/helpers/adapter' },
      { text: 'ConnInfo', link: '/docs/helpers/conninfo' },
      { text: 'Cookie', link: '/docs/helpers/cookie' },
      { text: 'css', link: '/docs/helpers/css' },
      { text: 'Dev', link: '/docs/helpers/dev' },
      { text: 'Factory', link: '/docs/helpers/factory' },
      { text: 'html', link: '/docs/helpers/html' },
      { text: 'JWT', link: '/docs/helpers/jwt' },
      { text: 'Proxy', link: '/docs/helpers/proxy' },
      { text: 'Route', link: '/docs/helpers/route' },
      { text: 'SSG', link: '/docs/helpers/ssg' },
      { text: 'Streaming', link: '/docs/helpers/streaming' },
      { text: 'Testing', link: '/docs/helpers/testing' },
      { text: 'WebSocket', link: '/docs/helpers/websocket' },
    ],
  },
  {
    text: '미들웨어',
    collapsed: true,
    items: [
      {
        text: '기본 인증',
        link: '/docs/middleware/builtin/basic-auth',
      },
      {
        text: '베어러 인증',
        link: '/docs/middleware/builtin/bearer-auth',
      },
      {
        text: '본문 크기 제한',
        link: '/docs/middleware/builtin/body-limit',
      },
      { text: 'Cache', link: '/docs/middleware/builtin/cache' },
      { text: 'Combine', link: '/docs/middleware/builtin/combine' },
      { text: 'Compress', link: '/docs/middleware/builtin/compress' },
      {
        text: '컨텍스트 저장소',
        link: '/docs/middleware/builtin/context-storage',
      },
      { text: 'CORS', link: '/docs/middleware/builtin/cors' },
      {
        text: 'CSRF 보호',
        link: '/docs/middleware/builtin/csrf',
      },
      { text: 'ETag', link: '/docs/middleware/builtin/etag' },
      {
        text: 'IP 제한',
        link: '/docs/middleware/builtin/ip-restriction',
      },
      {
        text: 'JSX 렌더러',
        link: '/docs/middleware/builtin/jsx-renderer',
      },
      { text: 'JWK', link: '/docs/middleware/builtin/jwk' },
      { text: 'JWT', link: '/docs/middleware/builtin/jwt' },
      { text: 'Logger', link: '/docs/middleware/builtin/logger' },
      { text: 'Language', link: '/docs/middleware/builtin/language' },
      {
        text: '메서드 재정의',
        link: '/docs/middleware/builtin/method-override',
      },
      {
        text: 'Pretty JSON',
        link: '/docs/middleware/builtin/pretty-json',
      },
      {
        text: '요청 ID',
        link: '/docs/middleware/builtin/request-id',
      },
      {
        text: '보안 헤더',
        link: '/docs/middleware/builtin/secure-headers',
      },
      { text: 'Timeout', link: '/docs/middleware/builtin/timeout' },
      { text: 'Timing', link: '/docs/middleware/builtin/timing' },
      {
        text: '후행 슬래시',
        link: '/docs/middleware/builtin/trailing-slash',
      },
      {
        text: '서드파티 미들웨어',
        link: '/docs/middleware/third-party',
      },
    ],
  },
  {
    text: 'LLM',
    collapsed: true,
    items: [
      {
        text: '문서 목록',
        link: '/llms.txt',
      },
      {
        text: '전체 문서',
        link: '/llms-full.txt',
      },
      {
        text: '작은 문서',
        link: '/llms-small.txt',
      },
    ],
  },
]

export const sidebarsExamples = (): DefaultTheme.SidebarItem[] => [
  {
    text: '애플리케이션',
    items: [
      {
        text: '웹 API',
        link: '/examples/web-api',
      },
      {
        text: '프록시',
        link: '/examples/proxy',
      },
      {
        text: '파일 업로드',
        link: '/examples/file-upload',
      },
      {
        text: '리버스 프록시 바인딩',
        link: '/examples/behind-reverse-proxy',
      },
      {
        text: 'Validator 오류 처리',
        link: '/examples/validator-error-handling',
      },
      {
        text: 'RPC에 대한 경로 그룹화',
        link: '/examples/grouping-routes-rpc',
      },
      {
        text: 'CBOR',
        link: '/examples/cbor',
      },
    ],
  },
  {
    text: '서드파티 미들웨어',
    items: [
      {
        text: 'Zod OpenAPI',
        link: '/examples/zod-openapi',
      },
      {
        text: 'Hono OpenAPI',
        link: '/examples/hono-openapi',
      },
      {
        text: 'Swagger UI',
        link: '/examples/swagger-ui',
      },
      {
        text: 'Scalar',
        link: '/examples/scalar',
      },
      {
        text: 'Hono Docs Generator',
        link: '/examples/hono-docs',
      },
    ],
  },
  {
    text: '통합',
    items: [
      {
        text: 'Cloudflare Durable Objects',
        link: '/examples/cloudflare-durable-objects',
      },
      {
        text: 'Cloudflare Queues',
        link: '/examples/cloudflare-queue',
      },
      {
        text: 'Cloudflare 테스트',
        link: '/examples/cloudflare-vitest',
      },
      {
        text: 'Remix',
        link: '/examples/with-remix',
      },
      {
        text: 'htmx',
        link: '/examples/htmx',
      },
      {
        text: 'Stripe Webhook',
        link: '/examples/stripe-webhook',
      },
      {
        text: 'Cloudflare에서 Prisma 사용',
        link: '/examples/prisma',
      },
      {
        text: 'Better Auth',
        link: '/examples/better-auth',
      },
      {
        text: 'Cloudflare에서 Better Auth 사용',
        link: '/examples/better-auth-on-cloudflare',
      },
      {
        text: 'Pylon (GraphQL)',
        link: '/examples/pylon',
      },
      {
        text: 'Stytch Authentication',
        link: '/examples/stytch-auth',
      },
      {
        text: 'Auth.js',
        link: '/examples/hono-authjs',
      },
      {
        text: 'Apitally (모니터링)',
        link: '/examples/apitally',
      },
    ],
  },
]

export default defineConfig({
  lang: 'ko-KR',
  title: 'Hono',
  description:
    'Cloudflare Workers, Fastly Compute, Deno, Bun, Vercel, Node.js 등에 대한 웹 표준을 기반으로 구축된 웹 프레임워크입니다. 빠르지만 빠르기만 한 것은 아닙니다.',
  lastUpdated: true,
  ignoreDeadLinks: true,
  cleanUrls: true,
  markdown: {
    theme: {
      light: 'github-light',
      dark: 'github-dark',
    },
    config(md) {
      md.use(groupIconMdPlugin)
    },
    codeTransformers: [
      transformerTwoslash({
        typesCache: createFileSystemTypesCache(),
      }),
    ],
  },
  themeConfig: {
    logo: '/images/logo.svg',
    siteTitle: 'Hono',
    algolia: {
      appId: '1GIFSU1REV',
      apiKey: 'c6a0f86b9a9f8551654600f28317a9e9',
      indexName: 'hono',
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/honojs' },
      { icon: 'discord', link: 'https://discord.gg/KMh2eNSdxV' },
      { icon: 'x', link: 'https://x.com/honojs' },
      { icon: 'bluesky', link: 'https://bsky.app/profile/hono.dev' },
    ],
    editLink: {
      pattern: 'https://github.com/honojs/website/edit/main/:path',
      text: 'GitHub에서 이 페이지를 편집하세요',
    },
    footer: {
      message: 'MIT 라이센스에 따라 출시되었습니다.',
      copyright:
        'Copyright © 2022-present Yusuke Wada & Hono contributors. "kawaii" 로고는 SAWARATSUKI가 제작했습니다.',
    },
    nav: [
      { text: '문서', link: '/docs/' },
      { text: '예제', link: '/examples/' },
      {
        text: '토론',
        link: 'https://github.com/orgs/honojs/discussions',
      },
    ],
    sidebar: {
      '/': sidebars(),
      '/examples/': sidebarsExamples(),
    },
  },
  head: [
    [
      'meta',
      {
        property: 'og:image',
        content: 'https://hono.dev/images/hono-title.png',
      },
    ],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'twitter:domain', content: 'hono.dev' }],
    [
      'meta',
      {
        property: 'twitter:image',
        content: 'https://hono.dev/images/hono-title.png',
      },
    ],
    [
      'meta',
      { property: 'twitter:card', content: 'summary_large_image' },
    ],
    ['link', { rel: 'shortcut icon', href: '/favicon.ico' }],
  ],
  titleTemplate: ':title - Hono',
  vite: {
    plugins: [
      groupIconVitePlugin({
        customIcon: {
          cloudflare: 'logos:cloudflare-workers-icon',
        },
      }),
    ],
    server: {
      allowedHosts: true,
    },
  },
})
