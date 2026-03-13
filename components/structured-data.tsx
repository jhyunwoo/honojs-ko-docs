import { buildBreadcrumbs, siteDescription, siteLocale, siteName, toAbsoluteUrl } from '@/lib/site'

type WebSiteJsonLdProps = {
  path: string
  title?: string
  description?: string
}

type ArticleJsonLdProps = {
  path: string
  title: string
  description: string
  kind: 'docs' | 'examples'
}

export function WebSiteJsonLd({
  path,
  title = siteName,
  description = siteDescription,
}: WebSiteJsonLdProps) {
  const json = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: title,
    description,
    url: toAbsoluteUrl(path),
    inLanguage: siteLocale,
    publisher: {
      '@type': 'Organization',
      name: siteName,
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(json) }}
    />
  )
}

export function ArticleJsonLd({
  path,
  title,
  description,
  kind,
}: ArticleJsonLdProps) {
  const breadcrumbs = buildBreadcrumbs(path, title)
  const articleType = kind === 'docs' ? 'TechArticle' : 'Article'
  const json = {
    '@context': 'https://schema.org',
    '@type': articleType,
    headline: title,
    description,
    url: toAbsoluteUrl(path),
    inLanguage: siteLocale,
    isPartOf: {
      '@type': 'WebSite',
      name: siteName,
      url: toAbsoluteUrl('/'),
    },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: toAbsoluteUrl(item.href),
      })),
    },
    about: [
      {
        '@type': 'Thing',
        name: 'Hono',
      },
      {
        '@type': 'Thing',
        name: kind === 'docs' ? '공식 문서' : '예제',
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(json) }}
    />
  )
}

function serializeJsonLd(value: unknown) {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029')
}
