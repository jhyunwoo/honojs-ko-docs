import Link from 'next/link'
import type { ReactNode } from 'react'

import type { Heading, PageKind } from '@/lib/content'
import { getSidebar, type NavItem } from '@/lib/navigation'
import { buildBreadcrumbs } from '@/lib/site'

import { Breadcrumbs } from './breadcrumbs'
import { DocsSidebar } from './docs-sidebar'
import { MobileDocsDrawer } from './mobile-docs-drawer'
import { TableOfContents } from './table-of-contents'

type DocLayoutProps = {
  kind: PageKind
  href: string
  title: string
  headings: Heading[]
  prev?: NavItem
  next?: NavItem
  children: ReactNode
}

export function DocLayout({
  kind,
  href,
  title,
  headings,
  prev,
  next,
  children,
}: DocLayoutProps) {
  const sidebar = getSidebar(kind)
  const breadcrumbs = buildBreadcrumbs(href, title)

  return (
    <main className="page-shell page-shell--docs">
      <div className="docs-shell">
        <aside className="docs-shell__sidebar">
          <DocsSidebar groups={sidebar} currentHref={href} />
        </aside>

        <section className="docs-shell__main">
          <MobileDocsDrawer
            groups={sidebar}
            currentHref={href}
            headings={headings}
          />
          <Breadcrumbs items={breadcrumbs} />
          <article className="doc-article">{children}</article>
          <nav className="doc-pagination" aria-label="문서 이전 다음 탐색">
            {prev ? (
              <Link className="doc-pagination__item" href={prev.href} prefetch={false}>
                <span>이전</span>
                <strong>{prev.title}</strong>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link className="doc-pagination__item" href={next.href} prefetch={false}>
                <span>다음</span>
                <strong>{next.title}</strong>
              </Link>
            ) : null}
          </nav>
        </section>

        <aside className="docs-shell__toc">
          <TableOfContents headings={headings} />
        </aside>
      </div>
    </main>
  )
}
