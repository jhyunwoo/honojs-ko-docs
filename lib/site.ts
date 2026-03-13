import type { Metadata } from 'next'

export const siteName = 'Hono 한국어 문서'
export const siteDescription =
  'Hono 공식 문서와 예제를 한국어 번역본으로 제공하는 정적 문서 사이트입니다.'
export const siteLocale = 'ko-KR'
export const siteUrl = normalizeSiteUrl(
  process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.SITE_URL ??
    'https://hono-docs-ko.local'
)
export const siteKeywords = [
  'Hono',
  'Hono 한국어 문서',
  'Hono 번역',
  '웹 프레임워크',
  'TypeScript',
  'Cloudflare Workers',
  'Bun',
  'Deno',
  'Next.js',
  'API 문서',
]

export function buildMetadata({
  title,
  description,
  path,
  type = 'website',
  keywords = [],
  noIndex = false,
}: {
  title: string
  description: string
  path: string
  type?: 'website' | 'article'
  keywords?: string[]
  noIndex?: boolean
}): Metadata {
  const canonicalUrl = toAbsoluteUrl(path)
  const mergedKeywords = [...new Set([...siteKeywords, ...keywords])]

  return {
    title,
    description,
    applicationName: siteName,
    category: 'technology',
    keywords: mergedKeywords,
    referrer: 'origin-when-cross-origin',
    creator: siteName,
    publisher: siteName,
    authors: [{ name: siteName }],
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    alternates: {
      canonical: path,
      languages: {
        ko: path,
        'ko-KR': path,
      },
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName,
      locale: 'ko_KR',
      type,
      images: ['/images/hono-title.png'],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/images/hono-title.png'],
    },
  }
}

export function toAbsoluteUrl(path: string) {
  return new URL(normalizePath(path), siteUrl).toString()
}

export function isIndexableSiteUrl() {
  return !/\.local($|\/)/.test(siteUrl) && !/localhost/.test(siteUrl)
}

export function buildBreadcrumbs(
  path: string,
  currentTitle: string
): Array<{ name: string; href: string }> {
  const normalized = normalizePath(path)

  if (normalized === '/') {
    return [{ name: '홈', href: '/' }]
  }

  const parts = normalized.split('/').filter(Boolean)
  const breadcrumbs: Array<{ name: string; href: string }> = [
    { name: '홈', href: '/' },
  ]

  let currentPath = ''
  parts.forEach((part, index) => {
    currentPath += `/${part}`
    const isLast = index === parts.length - 1
    const label = isLast ? currentTitle : segmentLabel(part, currentPath)
    if (!label) {
      return
    }
    breadcrumbs.push({ name: label, href: currentPath })
  })

  return breadcrumbs
}

function segmentLabel(segment: string, currentPath: string) {
  if (currentPath === '/docs') return '문서'
  if (currentPath === '/examples') return '예제'

  const labels: Record<string, string> = {
    concepts: '개념',
    'getting-started': '시작하기',
    api: 'API',
    guides: '가이드',
    helpers: '도우미',
    middleware: '미들웨어',
    builtin: '기본 제공',
  }

  return labels[segment]
}

function normalizeSiteUrl(url: string) {
  return url.replace(/\/+$/, '')
}

function normalizePath(path: string) {
  if (!path.startsWith('/')) {
    return `/${path}`
  }

  return path
}
