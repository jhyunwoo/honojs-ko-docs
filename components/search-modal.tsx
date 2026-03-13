'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import type MiniSearch from 'minisearch'

type SearchRecord = {
  id: string
  kind: 'docs' | 'examples' | 'home'
  url: string
  title: string
  body: string
}

type IndexedRecord = SearchRecord

type SearchResult = {
  kind: SearchRecord['kind']
  url: string
  title: string
  description: string
}

type SearchModalProps = {
  open: boolean
  onClose: () => void
}

export function SearchModal({ open, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('')
  const [records, setRecords] = useState<SearchRecord[]>([])
  const [searcher, setSearcher] = useState<MiniSearch<IndexedRecord> | null>(null)
  const recordsByUrl = useMemo(
    () => new Map(records.map((record) => [record.url, record])),
    [records]
  )

  useEffect(() => {
    if (!open || searcher) {
      return
    }

    let cancelled = false
    const controller = new AbortController()

    void (async () => {
      try {
        const [module, payload] = await Promise.all([
          import('minisearch'),
          fetch('/search-index.json', {
            signal: controller.signal,
          }).then((response) => response.json() as Promise<SearchRecord[]>),
        ])

        if (cancelled) {
          return
        }

        const MiniSearchConstructor = module.default
        const nextSearcher = new MiniSearchConstructor<IndexedRecord>(miniSearchOptions)
        nextSearcher.addAll(payload)

        if (cancelled) {
          return
        }

        setRecords(payload)
        setSearcher(nextSearcher)
      } catch (error: unknown) {
        if (
          error instanceof Error &&
          error.name === 'AbortError'
        ) {
          return
        }
        throw error
      }
    })()

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [open, searcher])

  useEffect(() => {
    if (!open) {
      setQuery('')
    }
  }, [open])

  const results = useMemo<SearchResult[]>(() => {
    if (!searcher) {
      return query.trim() ? [] : records.slice(0, 8).map(toSearchResult)
    }
    if (!query.trim()) {
      return records.slice(0, 8).map(toSearchResult)
    }

    return searcher.search(query).slice(0, 12).map((result) =>
      ({
        kind: result.kind,
        url: result.url,
        title: result.title,
        description: summarize(recordsByUrl.get(result.url)?.body ?? ''),
      })
    )
  }, [query, records, recordsByUrl, searcher])

  if (!open) {
    return null
  }

  return (
    <div className="search-modal" role="dialog" aria-modal="true">
      <button
        type="button"
        className="search-modal__backdrop"
        aria-label="검색 닫기"
        onClick={onClose}
      />
      <div className="search-modal__panel">
        <div className="search-modal__header">
          <input
            autoFocus
            className="search-modal__input"
            placeholder="문서 제목, 섹션, 본문에서 검색"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <button
            type="button"
            className="search-modal__close"
            onClick={onClose}
          >
            Esc
          </button>
        </div>
        <div className="search-modal__body">
          {results.length > 0 ? (
            <ul className="search-results">
              {results.map((result) => (
                <li key={result.url}>
                  <Link
                    className="search-result"
                    href={result.url}
                    prefetch={false}
                    onClick={onClose}
                  >
                    <span className="search-result__kind">{kindLabel(result.kind)}</span>
                    <strong>{result.title}</strong>
                    <span>{result.description}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="search-empty">
              <strong>검색 결과가 없습니다.</strong>
              <span>다른 키워드나 문서 섹션 이름으로 다시 찾아보세요.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const miniSearchOptions = {
  fields: ['title', 'body'],
  storeFields: ['title', 'url', 'kind'],
  searchOptions: {
    boost: {
      title: 6,
    },
    prefix: true,
    fuzzy: 0.15,
  },
}

function kindLabel(kind: SearchRecord['kind']) {
  if (kind === 'docs') {
    return '문서'
  }
  if (kind === 'examples') {
    return '예제'
  }
  return '홈'
}

function summarize(text: string) {
  return text.length <= 120 ? text : `${text.slice(0, 120).trimEnd()}...`
}

function toSearchResult(record: {
  kind: SearchRecord['kind']
  url: string
  title: string
  body?: string
}): SearchResult {
  return {
    kind: record.kind,
    url: record.url,
    title: record.title,
    description: summarize(record.body ?? ''),
  }
}
