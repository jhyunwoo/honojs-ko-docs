import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

const ROOT = process.cwd()
const MANIFEST_PATH = path.join(ROOT, 'translation-manifest.json')

const splitFrontmatter = (content) => {
  if (!content.startsWith('---\n')) return { frontmatter: '', body: content }
  const endIndex = content.indexOf('\n---\n', 4)
  if (endIndex === -1) return { frontmatter: '', body: content }
  return {
    frontmatter: content.slice(4, endIndex),
    body: content.slice(endIndex + 5),
  }
}

const countMatches = (content, regex) => [...content.matchAll(regex)].length

const compareCounts = (source, translated) => {
  const sourceBody = splitFrontmatter(source).body
  const translatedBody = splitFrontmatter(translated).body

  return {
    headings: countMatches(sourceBody, /^#{1,6}\s/mg) === countMatches(translatedBody, /^#{1,6}\s/mg),
    codeFences: countMatches(sourceBody, /^```/mg) === countMatches(translatedBody, /^```/mg),
    tables: countMatches(sourceBody, /^\|/mg) === countMatches(translatedBody, /^\|/mg),
    admonitions: countMatches(sourceBody, /^:::/mg) === countMatches(translatedBody, /^:::/mg),
  }
}

const extractInternalLinks = (content) => {
  const matches = content.matchAll(/\[[^\]]+\]\((\/(?:docs|examples)\/[^)\s#]+|\/docs\/|\/examples\/)\)/g)
  return [...matches].map((match) => match[1])
}

const linkExists = async (target) => {
  if (target === '/docs/' || target === '/examples/') return true
  const relative = target.replace(/^\//, '')
  const fullPath = path.join(ROOT, `${relative}.md`)
  try {
    const stat = await fs.stat(fullPath)
    return stat.isFile()
  } catch {
    return false
  }
}

const cloneSource = async (repo, sha) => {
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'hono-docs-verify-'))
  await execFileAsync('git', ['clone', '--depth', '1', repo, tempRoot])
  await execFileAsync('git', ['checkout', sha], { cwd: tempRoot })
  return tempRoot
}

const main = async () => {
  const manifest = JSON.parse(await fs.readFile(MANIFEST_PATH, 'utf8'))
  const sourceRoot = await cloneSource(manifest.upstreamRepo, manifest.upstreamSha)

  const failures = []

  for (const relativePath of manifest.targets) {
    const source = await fs.readFile(path.join(sourceRoot, relativePath), 'utf8')
    const translated = await fs.readFile(path.join(ROOT, relativePath), 'utf8')
    const counts = compareCounts(source, translated)

    for (const [key, ok] of Object.entries(counts)) {
      if (!ok) {
        failures.push(`${relativePath}: ${key} mismatch`)
      }
    }

    if (translated.startsWith('---\n') && !translated.includes('\n---\n')) {
      failures.push(`${relativePath}: invalid frontmatter`)
    }

    const links = extractInternalLinks(translated)
    for (const link of links) {
      if (!(await linkExists(link))) {
        failures.push(`${relativePath}: missing internal link target ${link}`)
      }
    }
  }

  const config = await fs.readFile(path.join(ROOT, '.vitepress', 'config.ts'), 'utf8')
  if (!config.includes("lang: 'ko-KR'")) {
    failures.push('.vitepress/config.ts: expected ko-KR lang setting')
  }

  if (failures.length > 0) {
    console.error('verification failed')
    for (const failure of failures) {
      console.error(`- ${failure}`)
    }
    process.exitCode = 1
    return
  }

  console.log(`verified ${manifest.targets.length} translated markdown files`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
