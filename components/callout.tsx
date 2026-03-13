import clsx from 'clsx'
import type { ReactNode } from 'react'

type CalloutProps = {
  type?: 'info' | 'tip' | 'warning' | 'danger' | 'details'
  title?: string
  children: ReactNode
}

const labels = {
  info: '안내',
  tip: '팁',
  warning: '주의',
  danger: '경고',
  details: '자세히 보기',
} as const

export function Callout({ type = 'info', title, children }: CalloutProps) {
  if (type === 'details') {
    return (
      <details className="doc-callout doc-callout--details">
        <summary>{title ?? labels.details}</summary>
        <div>{children}</div>
      </details>
    )
  }

  return (
    <aside className={clsx('doc-callout', `doc-callout--${type}`)}>
      <div className="doc-callout__title">{title ?? labels[type]}</div>
      <div className="doc-callout__body">{children}</div>
    </aside>
  )
}
