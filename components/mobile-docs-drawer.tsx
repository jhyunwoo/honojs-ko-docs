'use client'

import Link from 'next/link'
import clsx from 'clsx'
import { useState } from 'react'

import type { Heading } from '@/lib/content'
import type { NavGroup } from '@/lib/navigation'

type MobileDocsDrawerProps = {
  groups: NavGroup[]
  currentHref: string
  headings: Heading[]
}

export function MobileDocsDrawer({
  groups,
  currentHref,
  headings,
}: MobileDocsDrawerProps) {
  const [panel, setPanel] = useState<'closed' | 'nav' | 'toc'>('closed')
  const visibleHeadings = headings.filter(
    (heading) => heading.depth >= 2 && heading.depth <= 3
  )

  return (
    <>
      <div className="mobile-docs-toolbar">
        <button type="button" onClick={() => setPanel('nav')}>
          문서 메뉴
        </button>
        {visibleHeadings.length > 0 ? (
          <button type="button" onClick={() => setPanel('toc')}>
            현재 페이지
          </button>
        ) : null}
      </div>

      {panel !== 'closed' ? (
        <div className="mobile-docs-overlay">
          <button
            type="button"
            className="mobile-docs-overlay__backdrop"
            aria-label="오버레이 닫기"
            onClick={() => setPanel('closed')}
          />
          <div className="mobile-docs-overlay__panel">
            <div className="mobile-docs-overlay__header">
              <strong>{panel === 'nav' ? '탐색' : '현재 페이지'}</strong>
              <button type="button" onClick={() => setPanel('closed')}>
                닫기
              </button>
            </div>

            {panel === 'nav' ? (
              <div className="mobile-docs-overlay__body">
                {groups.map((group) => (
                  <section key={group.title} className="mobile-docs-section">
                    <h2>{group.title}</h2>
                    <ul>
                      {group.items.map((item) => (
                        <li key={item.href}>
                          <Link
                            className={clsx(
                              'mobile-docs-link',
                              item.href === currentHref && 'is-active'
                            )}
                            href={item.href}
                            prefetch={false}
                            onClick={() => setPanel('closed')}
                          >
                            {item.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            ) : (
              <div className="mobile-docs-overlay__body">
                <ul className="mobile-docs-toc">
                  {visibleHeadings.map((heading) => (
                    <li key={heading.id} data-depth={heading.depth}>
                      <a href={`#${heading.id}`} onClick={() => setPanel('closed')}>
                        {heading.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </>
  )
}
