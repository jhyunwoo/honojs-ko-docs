import fs from 'node:fs/promises'
import path from 'node:path'

import type { MetadataRoute } from 'next'

import manifest from '@/translation-manifest.json'
import { filePathToHref } from '@/lib/content'
import { siteUrl } from '@/lib/site'

export const dynamic = 'force-static'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const items = await Promise.all(
    manifest.targets.map(async (target) => {
      const filePath = path.join(process.cwd(), target)
      const stats = await fs.stat(filePath)
      const url = new URL(filePathToHref(target), siteUrl).toString()
      const priority =
        url === `${siteUrl}/`
          ? 1
          : url.endsWith('/docs') || url.endsWith('/examples')
            ? 0.92
            : target.startsWith('docs/')
              ? 0.82
              : 0.76

      return {
        url,
        lastModified: stats.mtime,
        changeFrequency: 'weekly' as const,
        priority,
      }
    })
  )

  return items
}
