import fs from 'node:fs/promises'
import path from 'node:path'

import matter from 'gray-matter'

const ROOT = process.cwd()
const PUBLIC_DIR = path.join(ROOT, 'public')

const manifest = JSON.parse(
  await fs.readFile(path.join(ROOT, 'translation-manifest.json'), 'utf8')
)

await fs.mkdir(PUBLIC_DIR, { recursive: true })
await buildSearchIndex()
await buildLlmDocs()

async function buildSearchIndex() {
  const records = await Promise.all(
    manifest.targets.map(async (target) => {
      const source = await fs.readFile(path.join(ROOT, target), 'utf8')
      const { data, content } = matter(source)
      const cleaned = stripMarkdown(content)
      const headings = Array.from(
        cleaned.matchAll(/^#{1,6}\s+(.+)$/gm),
        (match) => match[1].trim()
      )
      const plainBody = cleaned
        .replace(/^#{1,6}\s+.+$/gm, ' ')
        .replace(/\s+/g, ' ')
        .trim()
      const body = [headings.join(' '), plainBody].filter(Boolean).join(' ').trim()
      const title =
        typeof data.title === 'string'
          ? data.title
          : headings[0] ?? inferTitleFromPath(target)

      return {
        id: target,
        kind: target.startsWith('examples/') ? 'examples' : target.startsWith('docs/') ? 'docs' : 'home',
        url: filePathToHref(target),
        title,
        body,
      }
    })
  )

  await fs.writeFile(
    path.join(PUBLIC_DIR, 'search-index.json'),
    JSON.stringify(records),
    'utf8'
  )
}

async function buildLlmDocs() {
  const docsTargets = manifest.targets.filter(
    (target) => target.startsWith('docs/') && target.endsWith('.md')
  )

  const docsContent = await Promise.all(
    docsTargets.map(async (target) => {
      const source = await fs.readFile(path.join(ROOT, target), 'utf8')
      const { content } = matter(source)
      return {
        target,
        content: content.trim(),
      }
    })
  )

  const optionals = docsTargets.map((target) => {
    const href = `https://hono.dev${filePathToHref(target)}`
    const label = inferTitleFromPath(target)
    return `- [${label}](${href})`
  })

  await fs.writeFile(
    path.join(PUBLIC_DIR, 'llms.txt'),
    [
      '# Hono',
      '',
      '> Hono는 웹 표준을 기반으로 구축된 작고 단순하며 초고속 웹 프레임워크입니다. Cloudflare Workers, Fastly Compute, Deno, Bun, Vercel, Netlify, AWS Lambda, Lambda@Edge, Node.js 등 다양한 JavaScript 런타임에서 작동합니다.',
      '',
      '## Docs',
      '',
      '- [전체 문서](https://hono.dev/llms-full.txt): Hono 전체 문서입니다. 예제는 제외됩니다.',
      '- [작은 문서](https://hono.dev/llms-small.txt): 핵심 설명만 포함한 축약 문서입니다.',
      '',
      '## Examples',
      '',
      '- [예제 저장소](https://github.com/honojs/website/tree/main/examples)',
      '',
      '## Optional',
      '',
      ...optionals,
    ].join('\n'),
    'utf8'
  )

  await fs.writeFile(
    path.join(PUBLIC_DIR, 'llms-full.txt'),
    [
      '<SYSTEM>This is the full developer documentation for Hono in Korean.</SYSTEM>',
      '',
      '# Start of Hono documentation',
      '',
      ...docsContent.map((entry) => entry.content),
    ].join('\n\n'),
    'utf8'
  )

  const tinyContent = docsContent
    .filter(
      (entry) =>
        !entry.target.startsWith('docs/concepts/') &&
        !entry.target.startsWith('docs/helpers/') &&
        !entry.target.startsWith('docs/middleware/')
    )
    .map((entry) => entry.content)

  await fs.writeFile(
    path.join(PUBLIC_DIR, 'llms-small.txt'),
    [
      '<SYSTEM>This is the tiny developer documentation for Hono in Korean.</SYSTEM>',
      '',
      '# Start of Hono documentation',
      '',
      ...tinyContent,
    ].join('\n\n'),
    'utf8'
  )
}

function stripMarkdown(source) {
  return source
    .replace(/<script setup>[\s\S]*?<\/script>/g, ' ')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/^:{3,}.*$/gm, ' ')
    .replace(/<Badge[^>]*\/>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()
}

function filePathToHref(filePath) {
  if (filePath === 'index.md') {
    return '/'
  }

  const withoutExt = filePath.replace(/\.md$/, '')
  const withoutIndex = withoutExt.replace(/\/index$/, '')
  return `/${withoutIndex}`.replace(/\/+/g, '/')
}

function inferTitleFromPath(filePath) {
  return filePath
    .replace(/\.md$/, '')
    .split('/')
    .pop()
    .replace(/-/g, ' ')
}
