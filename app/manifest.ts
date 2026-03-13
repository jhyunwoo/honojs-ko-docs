import type { MetadataRoute } from 'next'

export const dynamic = 'force-static'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Hono 한국어 문서',
    short_name: 'Hono KO',
    description: 'Hono 공식 문서와 예제를 한국어 번역본으로 제공하는 정적 문서 사이트입니다.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f6f1e8',
    theme_color: '#f59e0b',
    lang: 'ko-KR',
    icons: [
      {
        src: '/favicon.ico',
        sizes: '48x48',
        type: 'image/x-icon',
      },
    ],
  }
}
