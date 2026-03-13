'use client'

import clsx from 'clsx'
import {
  Children,
  isValidElement,
  type ReactElement,
  type ReactNode,
  useMemo,
  useState,
} from 'react'

export function CodeGroup({ children }: { children: ReactNode }) {
  const panels = useMemo(
    () =>
      Children.toArray(children).filter(
        (child) => !(typeof child === 'string' && child.trim() === '')
      ),
    [children]
  )
  const [activeIndex, setActiveIndex] = useState(0)

  if (panels.length <= 1) {
    return <div className="code-group">{panels}</div>
  }

  return (
    <div className="code-group">
      <div className="code-group__tabs" role="tablist" aria-label="코드 예제">
        {panels.map((panel, index) => (
          <button
            key={index}
            type="button"
            role="tab"
            className={clsx('code-group__tab', activeIndex === index && 'is-active')}
            aria-selected={activeIndex === index}
            onClick={() => setActiveIndex(index)}
          >
            {extractLabel(panel, index)}
          </button>
        ))}
      </div>
      <div className="code-group__panels">
        {panels.map((panel, index) => (
          <div
            key={index}
            className={clsx(
              'code-group__panel',
              activeIndex === index && 'is-active'
            )}
          >
            {panel}
          </div>
        ))}
      </div>
    </div>
  )
}

function extractLabel(node: ReactNode, index: number): string {
  if (!isElement(node)) {
    return `예제 ${index + 1}`
  }

  const title = findTitle(node)
  if (title) {
    return title
  }

  const language = findLanguage(node)
  return language ? language.toUpperCase() : `예제 ${index + 1}`
}

type CodeElementProps = {
  children?: ReactNode
  'data-language'?: string
  'data-rehype-pretty-code-title'?: string
}

function findTitle(node: ReactNode): string | null {
  if (!isElement(node)) {
    return null
  }

  const props = node.props

  if ('data-rehype-pretty-code-title' in props) {
    return plainText(props.children)
  }

  for (const child of Children.toArray(props.children)) {
    const nested = findTitle(child)
    if (nested) {
      return nested
    }
  }

  return null
}

function findLanguage(node: ReactNode): string | null {
  if (!isElement(node)) {
    return null
  }

  const props = node.props

  if (typeof props['data-language'] === 'string') {
    return props['data-language']
  }

  for (const child of Children.toArray(props.children)) {
    const nested = findLanguage(child)
    if (nested) {
      return nested
    }
  }

  return null
}

function plainText(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node)
  }

  if (!isElement(node)) {
    return ''
  }

  return Children.toArray(node.props.children).map(plainText).join('').trim()
}

function isElement(node: ReactNode): node is ReactElement<CodeElementProps> {
  return isValidElement<CodeElementProps>(node)
}
