import type { Heading } from '@/lib/content'

export function TableOfContents({ headings }: { headings: Heading[] }) {
  const visibleHeadings = headings.filter(
    (heading) => heading.depth >= 2 && heading.depth <= 3
  )

  if (visibleHeadings.length === 0) {
    return null
  }

  return (
    <nav className="table-of-contents" aria-label="현재 페이지 목차">
      <h2>현재 페이지</h2>
      <ul>
        {visibleHeadings.map((heading) => (
          <li key={heading.id} data-depth={heading.depth}>
            <a href={`#${heading.id}`}>{heading.title}</a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
