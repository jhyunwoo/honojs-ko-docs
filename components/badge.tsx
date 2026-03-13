import clsx from 'clsx'
import type { CSSProperties } from 'react'

type BadgeProps = {
  type?: 'info' | 'warning' | 'danger' | 'tip'
  text?: string
  style?: string | CSSProperties
}

export function Badge({ type = 'info', text, style }: BadgeProps) {
  return (
    <span className={clsx('doc-badge', `doc-badge--${type}`)} style={parseStyle(style)}>
      {text}
    </span>
  )
}

function parseStyle(style: BadgeProps['style']): CSSProperties | undefined {
  if (!style) {
    return undefined
  }

  if (typeof style !== 'string') {
    return style
  }

  return style
    .split(';')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .reduce<CSSProperties>((accumulator, entry) => {
      const [property, value] = entry.split(':').map((part) => part.trim())
      if (!property || !value) {
        return accumulator
      }

      const camelCase = property.replace(/-([a-z])/g, (_, letter: string) =>
        letter.toUpperCase()
      )
      ;(accumulator as Record<string, string>)[camelCase] = value
      return accumulator
    }, {})
}
