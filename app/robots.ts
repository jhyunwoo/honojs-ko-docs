import type { MetadataRoute } from 'next'

import { isIndexableSiteUrl, siteUrl } from '@/lib/site'

export const dynamic = 'force-static'

export default function robots(): MetadataRoute.Robots {
  const allowed = isIndexableSiteUrl()

  return {
    rules: {
      userAgent: '*',
      allow: allowed ? '/' : '',
      disallow: allowed ? '' : '/',
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  }
}
