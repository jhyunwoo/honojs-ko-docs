import Link from 'next/link'

type BreadcrumbItem = {
  name: string
  href: string
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  if (items.length <= 1) {
    return null
  }

  return (
    <nav className="breadcrumbs" aria-label="페이지 경로">
      <ol>
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            <li key={`${item.href}-${item.name}`}>
              {isLast ? (
                <span aria-current="page">{item.name}</span>
              ) : (
                <Link href={item.href} prefetch={false}>
                  {item.name}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
