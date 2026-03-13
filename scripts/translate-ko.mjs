import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

const UPSTREAM_REPO = 'https://github.com/honojs/website.git'
const UPSTREAM_SHA = '8a3cf02690d71d2ae1bd5ca9aa683a2c4b3393a2'

const ROOT = process.cwd()
const MANIFEST_PATH = path.join(ROOT, 'translation-manifest.json')
const CACHE_PATH = process.env.CACHE_PATH
  ? path.resolve(ROOT, process.env.CACHE_PATH)
  : path.join(ROOT, '.translation-cache-ko.json')
const BATCH_SEPARATOR = '@@SEP@@'
const PLACEHOLDER_PREFIX = 'ZZZPH'
const PLACEHOLDER_SUFFIX = 'ZZZ'
const PLACEHOLDER_RE = new RegExp(`${PLACEHOLDER_PREFIX}(\\d+)Z+`, 'g')
const USE_CURRENT_SOURCE = process.env.USE_CURRENT === '1'
const RESIDUE_ONLY = process.env.RESIDUE_ONLY === '1'
const SOURCE_ROOT_OVERRIDE = process.env.SOURCE_ROOT
  ? path.resolve(ROOT, process.env.SOURCE_ROOT)
  : ''
const TARGETS_OVERRIDE = process.env.TARGETS
  ? process.env.TARGETS.split(',').map((item) => item.trim()).filter(Boolean)
  : null
const HANGUL_RE = /[가-힣]/

const GLOSSARY = [
  'Cloudflare Workers',
  'Cloudflare Pages',
  'Fastly Compute',
  'Google Cloud Run',
  'Supabase Functions',
  'Ali Function Compute',
  'Lambda@Edge',
  'Service Worker',
  'Node.js',
  'TypeScript',
  'JavaScript',
  'VitePress',
  'Cloudflare',
  'Netlify',
  'Vercel',
  'Fastly',
  'Deno',
  'Bun',
  'JSX',
  'RPC',
  'JWT',
  'JWK',
  'CORS',
  'CSRF',
  'ETag',
  'SSG',
  'HonoRequest',
  'RegExpRouter',
  'SmartRouter',
  'LinearRouter',
  'PatternRouter',
  'create-hono',
  'Wrangler',
  'GitHub',
  'npm',
  'yarn',
  'pnpm',
  'deno',
  'bun',
  'JSON',
  'HTML',
  'CSS',
  'API',
  'WebSocket',
  'OpenAPI',
  'Auth.js',
  'Better Auth',
  'Prisma',
  'Remix',
  'htmx',
  'Scalar',
  'Swagger UI',
  'Zod',
  'Zod OpenAPI',
  'Hono OpenAPI',
  'Hono Docs Generator',
  'Apitally',
  'Stytch',
  'Pylon',
  'CBOR',
  'Hono',
  '---cut---',
]

const SIMPLE_FRONTMATTER_KEYS = new Set(['title'])
const ROOT_FRONTMATTER_KEYS = new Set([
  'title',
  'text',
  'tagline',
  'details',
  'alt',
  'content',
])
const CONFIG_TRANSLATABLE_KEYS = new Set([
  'text',
  'description',
  'message',
  'copyright',
])
const SHELL_LANGS = new Set(['sh', 'bash', 'zsh', 'shell', 'console'])
const STRING_TRANSLATION_LANGS = new Set([
  'ts',
  'tsx',
  'js',
  'jsx',
  'javascript',
  'typescript',
  'html',
])
const USER_VISIBLE_SINGLE_WORDS = new Set([
  'Hello',
  'World',
  'Welcome',
  'Loading',
  'Logout',
  'Dashboard',
  'Unauthorized',
  'Forbidden',
  'Created',
  'Success',
  'Error',
  'Client',
  'Server',
  'Manual',
  'Input',
  'Output',
  'Preparation',
])

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const pendingTranslations = new Map()
let scheduledFlush = null

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const unquote = (value) => {
  const trimmed = value.trim()
  if (
    (trimmed.startsWith("'") && trimmed.endsWith("'")) ||
    (trimmed.startsWith('"') && trimmed.endsWith('"'))
  ) {
    return trimmed.slice(1, -1)
  }
  return trimmed
}

const requote = (value, original) => {
  const trimmed = original.trim()
  if (trimmed.startsWith("'") && trimmed.endsWith("'")) {
    return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`
  }
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`
  }
  return value
}

const protectExactSegments = (text, segments, store) => {
  let result = text
  for (const segment of segments) {
    result = result.replace(segment, store.add(segment))
  }
  return result
}

const loadCache = async () => {
  try {
    return JSON.parse(await fs.readFile(CACHE_PATH, 'utf8'))
  } catch {
    return {}
  }
}

const saveCache = async (cache) => {
  await fs.writeFile(CACHE_PATH, JSON.stringify(cache, null, 2) + '\n', 'utf8')
}

const createPlaceholderStore = () => {
  const values = []
  return {
    add(value) {
      const index = values.push(value) - 1
      return `${PLACEHOLDER_PREFIX}${index}${PLACEHOLDER_SUFFIX}`
    },
    restore(text) {
      return text.replace(PLACEHOLDER_RE, (_, index) => values[Number(index)] ?? _)
    },
  }
}

const protectGlossary = (text, store) => {
  let result = text
  for (const term of [...GLOSSARY].sort((a, b) => b.length - a.length)) {
    result = result.replace(new RegExp(escapeRegex(term), 'g'), () => store.add(term))
  }
  return result
}

const looksTranslatable = (text) => {
  const stripped = text
    .replace(PLACEHOLDER_RE, '')
    .replace(/[`*_#>|[\]()/\\-]/g, ' ')
    .trim()
  return /[A-Za-z]/.test(stripped)
}

const hasHangul = (text) => HANGUL_RE.test(text)

const shouldTranslateStringLiteral = (value, line) => {
  if (!/[A-Za-z]/.test(value)) return false
  if (
    /^(https?:|\/|\.{1,2}\/|node:|npm:|file:|mailto:|@)/.test(value) ||
    /\.(ts|tsx|js|jsx|json|html|css|md|svg|png|jpg|jpeg|gif|webp)$/i.test(value)
  ) {
    return false
  }
  if (/[{}[\]<>]/.test(value) || /(?:^|[^A-Za-z])(GET|POST|PUT|PATCH|DELETE|OPTIONS|HEAD)(?:$|[^A-Za-z])/.test(value)) {
    return false
  }
  if (/[=:]/.test(value) || /\b(import|from|require)\b/.test(line)) {
    return false
  }
  if (/\b(Content-Type|Authorization|Set-Cookie|Accept|Location|Bearer|Basic)\b/i.test(value)) {
    return false
  }
  if (/^\$\{.+\}$/.test(value)) {
    return false
  }
  if (USER_VISIBLE_SINGLE_WORDS.has(value.trim())) {
    return true
  }
  if (/\b(name|message|title|label|description|details|summary)\s*:/.test(line) && /^[A-Za-z][A-Za-z -]+$/.test(value)) {
    return true
  }
  if (!/[\s.!?]/.test(value)) return false
  return true
}

const decodeHtmlEntities = (text) =>
  text
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number.parseInt(dec, 10)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")

const normalizeRestoredText = (text) =>
  text
    .replace(/\]\s+\(/g, '](')
    .replace(/!\[\s+/g, '![')
    .replace(/\(\s+(https?:\/\/)/g, '($1')
    .replace(/\*\s+\*/g, '**')
    .replace(/_\s+_/g, '__')

const requestTranslation = async (text) => {
  const requestViaMyMemory = async () => {
    const { stdout } = await execFileAsync('curl', [
      '-sS',
      '-A',
      'Mozilla/5.0',
      '--retry',
      '3',
      '--connect-timeout',
      '20',
      '--max-time',
      '60',
      '--get',
      '--data-urlencode',
      `q=${text}`,
      '--data-urlencode',
      'langpair=en|ko',
      'https://api.mymemory.translated.net/get',
    ])
    const payload = JSON.parse(stdout)
    const translated = decodeHtmlEntities(payload?.responseData?.translatedText ?? '')
    if (!translated || translated.startsWith('MYMEMORY WARNING:')) {
      throw new Error('empty translation result from MyMemory')
    }
    return translated
  }

  const requestViaGoogle = async () => {
    const { stdout } = await execFileAsync('curl', [
      '-sS',
      '-A',
      'Mozilla/5.0',
      '--retry',
      '2',
      '--connect-timeout',
      '20',
      '--max-time',
      '60',
      '--get',
      '--data-urlencode',
      'client=gtx',
      '--data-urlencode',
      'sl=en',
      '--data-urlencode',
      'tl=ko',
      '--data-urlencode',
      'dt=t',
      '--data-urlencode',
      `q=${text}`,
      'https://translate.googleapis.com/translate_a/single',
    ])
    if (stdout.startsWith('<HTML>') || stdout.startsWith('<html')) {
      throw new Error('google translate returned html')
    }
    const payload = JSON.parse(stdout)
    const translated = decodeHtmlEntities(
      payload?.[0]?.map((item) => item?.[0] ?? '').join('') ?? ''
    )
    if (!translated) {
      throw new Error('empty translation result')
    }
    return translated
  }

  let lastError

  for (let attempt = 0; attempt < 4; attempt += 1) {
    for (const requester of [requestViaGoogle, requestViaMyMemory]) {
      try {
        return await requester()
      } catch (error) {
        lastError = error
        await sleep(400 * (attempt + 1))
      }
    }
  }

  throw lastError
}

const requestBatchTranslation = async (texts) => {
  if (texts.length === 1) {
    return [await requestTranslation(texts[0])]
  }
  const translated = await requestTranslation(texts.join(BATCH_SEPARATOR))
  const parts = translated.split(BATCH_SEPARATOR)
  if (parts.length !== texts.length) {
    throw new Error(`batch split mismatch: expected ${texts.length}, got ${parts.length}`)
  }
  return parts
}

const flushTranslations = async (cache) => {
  while (pendingTranslations.size > 0) {
    const batch = []
    let currentLength = 0
    for (const text of pendingTranslations.keys()) {
      const nextLength = currentLength + text.length + (batch.length > 0 ? BATCH_SEPARATOR.length : 0)
      if (batch.length >= 20 || nextLength > 1800) {
        break
      }
      batch.push(text)
      currentLength = nextLength
    }

    const entries = batch.map((text) => [text, pendingTranslations.get(text)])
    for (const [text] of entries) {
      pendingTranslations.delete(text)
    }

    try {
      const translatedBatch = await requestBatchTranslation(batch)
      translatedBatch.forEach((translated, index) => {
        const text = batch[index]
        cache[text] = translated
        entries[index][1].resolve(translated)
      })
    } catch (error) {
      for (const [text, handlers] of entries) {
        try {
          const translated = await requestTranslation(text)
          cache[text] = translated
          handlers.resolve(translated)
        } catch (innerError) {
          handlers.reject(innerError)
        }
      }
    }
  }
}

const scheduleFlush = (cache) => {
  if (!scheduledFlush) {
    scheduledFlush = Promise.resolve()
      .then(() => flushTranslations(cache))
      .finally(() => {
        scheduledFlush = null
      })
  }
}

const translateRaw = async (text, cache) => {
  if (!text || !looksTranslatable(text)) return text
  if (cache[text]) return cache[text]
  if (pendingTranslations.has(text)) {
    return pendingTranslations.get(text).promise
  }

  const promise = new Promise((resolve, reject) => {
    pendingTranslations.set(text, { promise: null, resolve, reject })
  })
  pendingTranslations.get(text).promise = promise
  scheduleFlush(cache)
  return promise
}

const translateText = async (input, cache) => {
  if (!input || !looksTranslatable(input)) return input

  if (RESIDUE_ONLY && hasHangul(input)) return input

  const store = createPlaceholderStore()
  let text = input

  text = text.replace(/`[^`\n]+`/g, (match) => store.add(match))
  text = text.replace(/(!?\[[^\]]*?\])\(([^)\n]+)\)/g, (_, label, url) => {
    return `${label}(${store.add(url)})`
  })
  text = text.replace(/https?:\/\/[^\s)]+/g, (match) => store.add(match))
  text = text.replace(/<[^>]+>/g, (match) => store.add(match))
  text = text.replace(/\{\{[^}]+\}\}/g, (match) => store.add(match))
  text = text.replace(/\{[^}\n]+\}/g, (match) => store.add(match))
  text = protectGlossary(text, store)

  if (!looksTranslatable(text)) {
    return normalizeRestoredText(store.restore(text))
  }

  const translated = await translateRaw(text, cache)
  return normalizeRestoredText(store.restore(translated))
}

const translateFrontmatterScalarLine = async (line, cache, keys) => {
  const match = line.match(/^(\s*[\w-]+\s*:\s*)(.+?)(\s*)$/)
  if (!match) return line

  const [, prefix, rawValue, suffix] = match
  const key = prefix.split(':')[0].trim()
  if (!keys.has(key)) return line

  const value = unquote(rawValue)
  if (!looksTranslatable(value)) return line
  if (RESIDUE_ONLY && hasHangul(value)) return line

  const translated = await translateText(value, cache)
  return `${prefix}${requote(translated, rawValue)}${suffix}`
}

const translateRootIndexFrontmatter = async (frontmatter, cache) => {
  const lines = frontmatter.split('\n')
  const output = []

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]
    if (/^\s*alt:\s*"/.test(line)) {
      const collected = [line]
      while (index + 1 < lines.length) {
        index += 1
        collected.push(lines[index])
        if (lines[index].trim().endsWith('"')) {
          break
        }
      }
      const joined = collected.join('\n')
      const match = joined.match(/^(\s*alt:\s*")([\s\S]*?)(")$/)
      if (!match) {
        output.push(...collected)
        continue
      }
      const [, prefix, value, suffix] = match
      const store = createPlaceholderStore()
      const protectedValue = protectExactSegments(
        value,
        [
          "import { Hono } from 'hono'",
          'const app = new Hono()',
          "app.get('/', (c) => c.text('Hello Hono!'))",
          'export default app',
        ],
        store
      )
      const translated = store.restore(await translateText(protectedValue, cache))
      output.push(`${prefix}${translated.replace(/"/g, '\\"')}${suffix}`)
      continue
    }

    output.push(await translateFrontmatterScalarLine(line, cache, ROOT_FRONTMATTER_KEYS))
  }

  return output.join('\n')
}

const splitFrontmatter = (content) => {
  if (!content.startsWith('---\n')) {
    return { frontmatter: '', body: content }
  }
  const endIndex = content.indexOf('\n---\n', 4)
  if (endIndex === -1) {
    return { frontmatter: '', body: content }
  }
  return {
    frontmatter: content.slice(4, endIndex),
    body: content.slice(endIndex + 5),
  }
}

const translateTableRow = async (line, cache) => {
  if (/^\|\s*[-: ]+\|\s*$/.test(line) || /^\|\s*[-: ]+(\|\s*[-: ]+)+\|\s*$/.test(line)) {
    return line
  }
  const leadingPipe = line.startsWith('|') ? '|' : ''
  const trailingPipe = line.endsWith('|') ? '|' : ''
  const cells = line.split('|')
  const translatedCells = []

  for (let index = 1; index < cells.length - 1; index += 1) {
    const cell = cells[index]
    const leading = cell.match(/^\s*/)?.[0] ?? ''
    const trailing = cell.match(/\s*$/)?.[0] ?? ''
    const core = cell.trim()
    translatedCells.push(`${leading}${await translateText(core, cache)}${trailing}`)
  }

  return `${leadingPipe}${translatedCells.join('|')}${trailingPipe}`
}

const translateMarkdownLine = async (line, cache) => {
  if (!line.trim()) return line
  if (/^:::/.test(line.trim())) return line
  if (/^---$/.test(line.trim())) return line
  if (/^`{3,}/.test(line.trim())) return line
  if (/^\s*<script\b/.test(line) || /^\s*<\/script>/.test(line)) return line

  if (/^\|/.test(line.trim())) {
    return translateTableRow(line, cache)
  }

  const prefixMatch =
    line.match(/^(\s*#{1,6}\s+)(.*)$/) ||
    line.match(/^(\s*[-*+]\s+)(.*)$/) ||
    line.match(/^(\s*\d+\.\s+)(.*)$/) ||
    line.match(/^(\s*(?:>\s*)+)(.*)$/)

  if (prefixMatch) {
    const [, prefix, rest] = prefixMatch
    if (RESIDUE_ONLY && hasHangul(rest)) {
      return line
    }
    return `${prefix}${await translateText(rest, cache)}`
  }

  if (RESIDUE_ONLY && hasHangul(line)) return line
  return translateText(line, cache)
}

const replaceAsync = async (input, regex, replacer) => {
  const matches = [...input.matchAll(regex)]
  if (matches.length === 0) return input

  let output = ''
  let lastIndex = 0
  for (const match of matches) {
    output += input.slice(lastIndex, match.index)
    output += await replacer(...match)
    lastIndex = match.index + match[0].length
  }
  output += input.slice(lastIndex)
  return output
}

const translateCodeLine = async (line, lang, cache, state) => {
  if (!line.trim()) return { line, state }

  if (state.inBlockComment) {
    const endIndex = line.indexOf('*/')
    if (endIndex === -1) {
      const prefix = line.match(/^\s*\*?\s*/)?.[0] ?? ''
      const translated = await translateText(line.slice(prefix.length), cache)
      return { line: `${prefix}${translated}`, state }
    }

    const before = line.slice(0, endIndex)
    const suffix = line.slice(endIndex)
    const prefix = before.match(/^\s*\*?\s*/)?.[0] ?? ''
    const translated = await translateText(before.slice(prefix.length), cache)
    return {
      line: `${prefix}${translated}${suffix}`,
      state: { ...state, inBlockComment: false },
    }
  }

  if (/^\s*\/\//.test(line)) {
    const prefix = line.match(/^\s*\/\/\s*/)?.[0] ?? ''
    const translated = await translateText(line.slice(prefix.length), cache)
    return { line: `${prefix}${translated}`, state }
  }

  if (SHELL_LANGS.has(lang) && /^\s*#/.test(line)) {
    const prefix = line.match(/^\s*#\s*/)?.[0] ?? ''
    const translated = await translateText(line.slice(prefix.length), cache)
    return { line: `${prefix}${translated}`, state }
  }

  if (SHELL_LANGS.has(lang)) {
    return { line, state }
  }

  if (line.includes('/*')) {
    const startIndex = line.indexOf('/*')
    const endIndex = line.indexOf('*/', startIndex + 2)
    const before = line.slice(0, startIndex + 2)
    if (endIndex === -1) {
      const translated = await translateText(line.slice(startIndex + 2), cache)
      return {
        line: `${before}${translated}`,
        state: { ...state, inBlockComment: true },
      }
    }
    const middle = line.slice(startIndex + 2, endIndex)
    const after = line.slice(endIndex)
    const translated = await translateText(middle, cache)
    return { line: `${before}${translated}${after}`, state }
  }

  let output = line

  output = await replaceAsync(
    output,
    />([^<]+)</g,
    async (match, textNode) => {
      const store = createPlaceholderStore()
      const protectedNode = textNode.replace(/\{[^}\n]+\}/g, (segment) => store.add(segment))
      return `>${store.restore(await translateText(protectedNode, cache))}<`
    }
  )

  const trimmed = output.trim()
  if (
    /^[A-Za-z][A-Za-z0-9 !?.'"-]*$/.test(trimmed) &&
    /\s/.test(trimmed) &&
    !/^(?:const|let|var|return|import|export|if|else|for|while|switch|case|break|continue|try|catch|finally|await|async|function|class|interface|type|new)\b/.test(trimmed)
  ) {
    const leading = output.match(/^\s*/)?.[0] ?? ''
    return {
      line: `${leading}${await translateText(trimmed, cache)}`,
      state,
    }
  }

  if (STRING_TRANSLATION_LANGS.has(lang) || !lang) {
    output = await replaceAsync(
      output,
      /(['"])([^'"\\]*(?:\\.[^'"\\]*)*)\1/g,
      async (match, quote, value) => {
        if (!shouldTranslateStringLiteral(value, output)) {
          return match
        }
        const translated = await translateText(value, cache)
        return `${quote}${translated.replaceAll(quote, `\\${quote}`)}${quote}`
      }
    )
  }

  return { line: output, state }
}

const translateCodeBlock = async (lines, lang, cache) => {
  const output = []
  let state = { inBlockComment: false }

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]
    if (index === 0 || index === lines.length - 1) {
      output.push(line)
      continue
    }
    const translated = await translateCodeLine(line, lang, cache, state)
    output.push(translated.line)
    state = translated.state
  }

  return output
}

const translateScriptBlock = async (lines, cache) => {
  return translateCodeBlock(lines, 'ts', cache)
}

const translateMarkdown = async (content, cache, relativePath) => {
  const { frontmatter, body } = splitFrontmatter(content)
  let translatedFrontmatter = ''

  if (frontmatter) {
    if (relativePath === 'index.md') {
      translatedFrontmatter = `---\n${await translateRootIndexFrontmatter(
        frontmatter,
        cache
      )}\n---\n`
    } else {
      const lines = frontmatter.split('\n')
      const translatedLines = []
      for (const line of lines) {
        translatedLines.push(
          await translateFrontmatterScalarLine(line, cache, SIMPLE_FRONTMATTER_KEYS)
        )
      }
      translatedFrontmatter = `---\n${translatedLines.join('\n')}\n---\n`
    }
  }

  const bodyLines = body.split('\n')
  const output = []
  let inCodeBlock = false
  let codeLines = []
  let codeLang = ''
  let codeFence = ''
  let inScriptBlock = false
  let scriptLines = []

  for (const line of bodyLines) {
    if (inCodeBlock) {
      codeLines.push(line)
      if (line.trim().startsWith(codeFence)) {
        output.push(...(await translateCodeBlock(codeLines, codeLang, cache)))
        codeLines = []
        codeLang = ''
        codeFence = ''
        inCodeBlock = false
      }
      continue
    }

    if (inScriptBlock) {
      scriptLines.push(line)
      if (/^\s*<\/script>/.test(line)) {
        output.push(...(await translateScriptBlock(scriptLines, cache)))
        scriptLines = []
        inScriptBlock = false
      }
      continue
    }

    const fenceMatch = line.trim().match(/^(`{3,})(.*)$/)
    if (fenceMatch) {
      inCodeBlock = true
      codeLines = [line]
      codeFence = fenceMatch[1]
      codeLang = fenceMatch[2].trim().split(/\s+/)[0] ?? ''
      continue
    }

    if (/^\s*<script\b/.test(line)) {
      inScriptBlock = true
      scriptLines = [line]
      continue
    }

    output.push(await translateMarkdownLine(line, cache))
  }

  return translatedFrontmatter + output.join('\n')
}

const translateConfigLine = async (line, cache) => {
  if (line.includes("lang: 'en-US'")) {
    return line.replace("'en-US'", "'ko-KR'")
  }

  const scalarMatch = line.match(
    /^(\s*(?:text|description|message|copyright)\s*:\s*)(['"])(.*)\2(,\s*)?$/
  )
  if (!scalarMatch) return line

  const [, prefix, quote, value, suffix = ''] = scalarMatch
  if (RESIDUE_ONLY && hasHangul(value)) return line
  const translated = await translateText(value, cache)
  return `${prefix}${quote}${translated.replaceAll(quote, `\\${quote}`)}${quote}${suffix}`
}

const translateConfig = async (content, cache) => {
  const lines = content.split('\n')
  const output = []

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]

    if (/^\s*description:\s*$/.test(line)) {
      output.push(line)
      index += 1
      const nextLine = lines[index]
      const match = nextLine.match(/^(\s*)(['"])(.*)\2(,\s*)?$/)
      if (!match) {
        output.push(nextLine)
        continue
      }
      const [, indent, quote, value, suffix = ''] = match
      const translated = await translateText(value, cache)
      output.push(
        `${indent}${quote}${translated.replaceAll(quote, `\\${quote}`)}${quote}${suffix}`
      )
      continue
    }

    output.push(await translateConfigLine(line, cache))
  }

  return output.join('\n')
}

const listTargets = async (sourceRoot) => {
  const docsDir = path.join(sourceRoot, 'docs')
  const examplesDir = path.join(sourceRoot, 'examples')
  const targets = ['index.md', 'docs/index.md']
  const orderedDocs = [
    'concepts',
    'getting-started',
    'api',
    'guides',
    'helpers',
    'middleware',
  ]

  for (const section of orderedDocs) {
    const sectionRoot = path.join(docsDir, section)
    const files = []
    const walk = async (dir) => {
      const entries = await fs.readdir(dir, { withFileTypes: true })
      entries.sort((a, b) => a.name.localeCompare(b.name))
      for (const entry of entries) {
        const entryPath = path.join(dir, entry.name)
        if (entry.isDirectory()) {
          await walk(entryPath)
          continue
        }
        if (entry.isFile() && entry.name.endsWith('.md')) {
          files.push(path.relative(sourceRoot, entryPath))
        }
      }
    }
    await walk(sectionRoot)
    targets.push(...files)
  }

  const exampleFiles = []
  const exampleEntries = await fs.readdir(examplesDir, { withFileTypes: true })
  exampleEntries.sort((a, b) => a.name.localeCompare(b.name))
  for (const entry of exampleEntries) {
    if (entry.isFile() && entry.name.endsWith('.md')) {
      exampleFiles.push(path.posix.join('examples', entry.name))
    }
  }
  targets.push(...exampleFiles)

  return targets
}

const cloneSource = async () => {
  if (SOURCE_ROOT_OVERRIDE) {
    return SOURCE_ROOT_OVERRIDE
  }
  if (USE_CURRENT_SOURCE) {
    return ROOT
  }
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'hono-docs-source-'))
  await execFileAsync('git', ['init'], { cwd: tempRoot })
  await execFileAsync('git', ['remote', 'add', 'origin', UPSTREAM_REPO], { cwd: tempRoot })
  await execFileAsync('git', ['fetch', '--depth', '1', 'origin', UPSTREAM_SHA], {
    cwd: tempRoot,
  })
  await execFileAsync('git', ['checkout', '--detach', 'FETCH_HEAD'], { cwd: tempRoot })
  return tempRoot
}

const main = async () => {
  const cache = await loadCache()
  const sourceRoot = await cloneSource()
  const allTargets = await listTargets(sourceRoot)
  const offset = Number(process.env.OFFSET || 0)
  const limit = Number(process.env.LIMIT || 0)
  const selectedTargets = TARGETS_OVERRIDE ?? allTargets
  const slicedTargets = selectedTargets.slice(offset)
  const targets = limit > 0 ? slicedTargets.slice(0, limit) : slicedTargets
  const skipConfig = process.env.SKIP_CONFIG === '1'

  const manifest = {
    upstreamRepo: UPSTREAM_REPO,
    upstreamSha: UPSTREAM_SHA,
    generatedAt: new Date().toISOString(),
    targets: allTargets,
    uiFiles: ['.vitepress/config.ts'],
  }
  await fs.writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n', 'utf8')

  if (!skipConfig) {
    const configSource = await fs.readFile(
      path.join(sourceRoot, '.vitepress', 'config.ts'),
      'utf8'
    )
    const translatedConfig = await translateConfig(configSource, cache)
    await fs.writeFile(path.join(ROOT, '.vitepress', 'config.ts'), translatedConfig, 'utf8')
  }

  for (const relativePath of targets) {
    console.log(`starting ${relativePath}`)
    const source = await fs.readFile(path.join(sourceRoot, relativePath), 'utf8')
    const translated = await translateMarkdown(source, cache, relativePath)
    await fs.writeFile(path.join(ROOT, relativePath), translated, 'utf8')
    console.log(`translated ${relativePath}`)
    if (Object.keys(cache).length % 50 === 0) {
      await saveCache(cache)
    }
  }

  await saveCache(cache)
  console.log(`translated ${targets.length} markdown files`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
