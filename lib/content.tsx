import fs from 'node:fs/promises'
import path from 'node:path'
import { cache } from 'react'
import type { ReactNode } from 'react'

import matter from 'gray-matter'
import GithubSlugger from 'github-slugger'
import { compileMDX } from 'next-mdx-remote/rsc'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypePrettyCode from 'rehype-pretty-code'
import rehypeSlug from 'rehype-slug'
import remarkGfm from 'remark-gfm'
import remarkMdx from 'remark-mdx'
import remarkParse from 'remark-parse'
import { unified } from 'unified'
import { visit } from 'unist-util-visit'

import manifest from '@/translation-manifest.json'
import { mdxComponents } from '@/components/mdx-components'
import { findNeighbors, type NavItem } from '@/lib/navigation'

export type PageKind = 'docs' | 'examples'

export type Heading = {
  depth: number
  title: string
  id: string
}

export type PageData = {
  kind: PageKind
  title: string
  description: string
  href: string
  sourcePath: string
  body: string
  headings: Heading[]
  content: ReactNode
  prev?: NavItem
  next?: NavItem
}

type MarkdownNode = {
  type?: string
  value?: string
  depth?: number
  children?: MarkdownNode[]
}

type HomeFrontmatter = {
  title?: string
  hero?: {
    name?: string
    text?: string
    tagline?: string
    image?: {
      src?: string
      alt?: string
    }
    actions?: Array<{
      text?: string
      link?: string
      theme?: string
    }>
  }
  features?: Array<{
    icon?: string
    title?: string
    details?: string
  }>
  head?: Array<[string, Record<string, string>]>
}

const ROOT = process.cwd()
const PRETTY_CODE_OPTIONS = {
  theme: {
    light: 'github-light',
    dark: 'github-dark',
  },
  keepBackground: false,
  defaultLang: 'text',
  onVisitLine(node: { children: Array<unknown> }) {
    if (node.children.length === 0) {
      node.children = [{ type: 'text', value: ' ' }]
    }
  },
}

export const getHomeData = cache(async () => {
  const source = await fs.readFile(path.join(ROOT, 'index.md'), 'utf8')
  const { data } = matter(source)
  const frontmatter = data as HomeFrontmatter
  const metaDescription =
    frontmatter.head?.find((entry) => entry[1]?.property === 'og:description')?.[1]
      ?.content ?? 'Hono 공식 문서를 한국어로 정적 제공하는 사이트입니다.'

  return {
    title: frontmatter.title ?? 'Hono 한국어 문서',
    description: metaDescription,
    hero: frontmatter.hero,
    features: frontmatter.features ?? [],
  }
})

export const getExamplesLandingData = cache(async () => {
  const source = await fs.readFile(path.join(ROOT, 'examples/index.md'), 'utf8')
  const body = source
    .replace(/<script setup>[\s\S]*?<\/script>/g, '')
    .replace(/<div[\s\S]*$/g, '')
    .trim()

  const intro = body
    .split('\n')
    .map((line) => line.trim())
    .find((line) => line && !line.startsWith('#'))

  return {
    title: '예제',
    description:
      intro ?? 'Hono를 사용한 실제 예제와 통합 패턴을 모아 둔 한국어 예제 모음입니다.',
    githubUrl: 'https://github.com/honojs/examples',
  }
})

export function getStaticParams(kind: PageKind) {
  return getRoutes(kind).map((href) => ({
    slug: href
      .replace(`/${kind}`, '')
      .split('/')
      .filter(Boolean),
  }))
}

export function getRoutes(kind: PageKind) {
  return manifest.targets
    .filter((target) => target.startsWith(`${kind}/`))
    .map(filePathToHref)
}

export const getPage = cache(
  async (kind: PageKind, slug: string[] = []): Promise<PageData | null> => {
    const resolved = await resolveSourcePath(kind, slug)
    if (!resolved) {
      return null
    }

    const source = await fs.readFile(path.join(ROOT, resolved), 'utf8')
    const { data, content } = matter(source)
    const processed = preprocessMarkdown(content)
    const headings = extractHeadings(processed)
    const title =
      typeof data.title === 'string'
        ? data.title
        : headings.find((heading) => heading.depth === 1)?.title ?? '문서'
    const description = extractDescription(processed, title)
    const href = filePathToHref(resolved)
    const neighbors = findNeighbors(kind, href)
    const { content: rendered } = await compileMDX({
      source: processed,
      components: mdxComponents,
      options: {
        parseFrontmatter: false,
        mdxOptions: {
          remarkPlugins: [remarkGfm],
          rehypePlugins: [
            rehypeSlug,
            [
              rehypeAutolinkHeadings,
              {
                behavior: 'append',
                properties: {
                  className: ['heading-anchor'],
                  ariaLabel: '섹션 링크',
                },
                content: [
                  {
                    type: 'element',
                    tagName: 'span',
                    properties: { 'aria-hidden': 'true' },
                    children: [{ type: 'text', value: '#' }],
                  },
                ],
              },
            ],
            [rehypePrettyCode, PRETTY_CODE_OPTIONS],
          ],
        },
      },
    })

    return {
      kind,
      title,
      description,
      href,
      sourcePath: resolved,
      body: processed,
      headings,
      content: rendered,
      prev: neighbors.prev,
      next: neighbors.next,
    }
  }
)

async function resolveSourcePath(kind: PageKind, slug: string[]) {
  if (slug.length === 0) {
    return `${kind}/index.md`
  }

  const nested = path.join(kind, ...slug, 'index.md')
  const direct = path.join(kind, `${slug.join('/')}.md`)

  for (const candidate of [nested, direct]) {
    try {
      await fs.access(path.join(ROOT, candidate))
      return candidate
    } catch {
      continue
    }
  }

  return null
}

export function filePathToHref(filePath: string) {
  if (filePath === 'index.md') {
    return '/'
  }

  const withoutExt = filePath.replace(/\.md$/, '')
  const withoutIndex = withoutExt.replace(/\/index$/, '')
  return `/${withoutIndex}`.replace(/\/+/g, '/')
}

export function preprocessMarkdown(source: string) {
  let next = source.replace(/\r\n/g, '\n')
  next = stripScriptSetup(next)
  next = stripPrettierComments(next)
  next = normalizeAutolinks(next)
  next = normalizeHtmlAnchors(next)
  next = escapeInlineJsx(next)
  next = transformContainers(next)
  next = normalizeFenceInfo(next)
  return next.trim()
}

function stripScriptSetup(source: string) {
  return source.replace(/<script setup>[\s\S]*?<\/script>/g, '')
}

function stripPrettierComments(source: string) {
  const lines = source.split('\n')
  let inFence = false
  const cleaned: string[] = []

  for (const line of lines) {
    if (/^`{3,}/.test(line.trim())) {
      inFence = !inFence
    }
    if (!inFence && line.trim() === '<!-- prettier-ignore -->') {
      continue
    }
    cleaned.push(line)
  }

  return cleaned.join('\n')
}

function normalizeAutolinks(source: string) {
  const lines = source.split('\n')
  let inFence = false

  return lines
    .map((line) => {
      if (/^`{3,}/.test(line.trim())) {
        inFence = !inFence
        return line
      }

      if (inFence || !line.includes('<http')) {
        return line
      }

      return line.replace(
        /<(https?:\/\/[^>\s]+)>/g,
        (_, url: string) => `[${url}](${url})`
      )
    })
    .join('\n')
}

function normalizeHtmlAnchors(source: string) {
  const lines = source.split('\n')
  let inFence = false

  return lines
    .map((line) => {
      if (/^`{3,}/.test(line.trim())) {
        inFence = !inFence
        return line
      }

      if (inFence || !line.includes('<a ')) {
        return line
      }

      return line.replace(
        /<a href="([^"]+)">([^<]+)<\/a>/g,
        (_, href: string, text: string) => `[${text}](${href})`
      )
    })
    .join('\n')
}

function escapeInlineJsx(source: string) {
  const lines = source.split('\n')
  let inFence = false

  return lines
    .map((line) => {
      const trimmed = line.trim()
      if (/^`{3,}/.test(trimmed)) {
        inFence = !inFence
        return line
      }

      if (
        inFence ||
        line.includes('`') ||
        !line.includes('<') ||
        trimmed.startsWith('<Callout') ||
        trimmed.startsWith('</Callout') ||
        trimmed.startsWith('<CodeGroup') ||
        trimmed.startsWith('</CodeGroup') ||
        line.includes('<Badge')
      ) {
        return line
      }

      return line
        .replace(/<>/g, '`<>`')
        .replace(/<\/>/g, '`</>`')
        .replace(
          /<\/?[A-Za-z][A-Za-z0-9._:-]*(?:\s[^>]*)?\/?>/g,
          (match) => `\`${match}\``
        )
    })
    .join('\n')
}

function transformContainers(source: string) {
  const lines = source.split('\n')
  const output: string[] = []

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]
    const match = line.match(/^(:{3,})\s*([a-z-]+)\s*(.*)$/i)
    if (!match) {
      output.push(line)
      continue
    }

    const type = match[2].toLowerCase()
    if (!['code-group', 'info', 'tip', 'warning', 'danger', 'details'].includes(type)) {
      output.push(line)
      continue
    }

    const body: string[] = []
    let cursor = index + 1

    while (cursor < lines.length && !/^:{3,}\s*$/.test(lines[cursor].trim())) {
      body.push(lines[cursor])
      cursor += 1
    }

    if (cursor >= lines.length) {
      output.push(line)
      continue
    }

    const inner = body.join('\n').trim()
    if (type === 'code-group') {
      output.push('<CodeGroup>')
      output.push('')
      output.push(normalizeFenceInfo(inner))
      output.push('')
      output.push('</CodeGroup>')
    } else {
      const extra = match[3]?.trim()
      output.push(
        extra
          ? `<Callout type="${type}" title=${JSON.stringify(extra)}>`
          : `<Callout type="${type}">`
      )
      output.push('')
      output.push(transformContainers(inner))
      output.push('')
      output.push('</Callout>')
    }

    index = cursor
  }

  return output.join('\n')
}

function normalizeFenceInfo(source: string) {
  return source.replace(/^(`{3,})([^\n`]*)$/gm, (_, ticks: string, info: string) => {
    const raw = info.trim()
    if (!raw) {
      return ticks
    }

    let next = raw.replace(/\btwoslash\b/g, '').trim()
    const labelMatch = next.match(/\[([^\]]+)\]/)
    const label = labelMatch?.[1]
    if (labelMatch) {
      const labelIndex = labelMatch.index ?? 0
      next = `${next.slice(0, labelIndex)}${next.slice(
        labelIndex + labelMatch[0].length
      )}`.trim()
    }

    const highlightMatch = next.match(/\{[^}]+\}/)
    const highlight = highlightMatch?.[0]
    if (highlightMatch) {
      const highlightIndex = highlightMatch.index ?? 0
      next = `${next.slice(0, highlightIndex)}${next.slice(
        highlightIndex + highlightMatch[0].length
      )}`.trim()
    }

    const language = normalizeLanguage(next)
    const meta = [highlight, label ? `title="${escapeAttribute(label)}"` : '']
      .filter(Boolean)
      .join(' ')

    return `${ticks}${language}${meta ? ` ${meta}` : ''}`
  })
}

function normalizeLanguage(language: string) {
  const value = language.trim().toLowerCase()
  if (!value) {
    return 'text'
  }
  if (value === 'plain text' || value === 'plaintext') {
    return 'text'
  }
  return value
}

function escapeAttribute(value: string) {
  return value.replace(/"/g, '&quot;')
}

function extractHeadings(source: string) {
  const tree = unified()
    .use(remarkParse)
    .use(remarkMdx)
    .use(remarkGfm)
    .parse(source)
  const slugger = new GithubSlugger()
  const headings: Heading[] = []

  visit(tree, 'heading', (node: MarkdownNode) => {
    const title = collectText(node.children ?? []).trim()
    if (!title) {
      return
    }
    headings.push({
      depth: node.depth ?? 1,
      title,
      id: slugger.slug(title),
    })
  })

  return headings
}

function collectText(children: MarkdownNode[]): string {
  return children
    .map((child) => {
      if (child.type === 'text' || child.type === 'inlineCode') {
        return child.value ?? ''
      }
      if (child.type === 'link' || child.children) {
        return collectText(child.children ?? [])
      }
      return ''
    })
    .join('')
}

function extractDescription(source: string, title: string) {
  const cleaned = source
    .replace(/^#{1,6}\s.+$/gm, ' ')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()

  if (!cleaned) {
    return title
  }

  return cleaned.slice(0, 160)
}
