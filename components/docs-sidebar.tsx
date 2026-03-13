import Link from 'next/link'
import clsx from 'clsx'

import type { NavGroup } from '@/lib/navigation'

export function DocsSidebar({
  groups,
  currentHref,
}: {
  groups: NavGroup[]
  currentHref: string
}) {
  return (
    <nav className="docs-sidebar" aria-label="문서 사이드바">
      {groups.map((group) => (
        <section key={group.title} className="docs-sidebar__group">
          <h2>{group.title}</h2>
          <ul>
            {group.items.map((item) => (
              <li key={item.href}>
                <Link
                  className={clsx(
                    'docs-sidebar__link',
                    item.href === currentHref && 'is-active'
                  )}
                  href={item.href}
                  prefetch={false}
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </nav>
  )
}
