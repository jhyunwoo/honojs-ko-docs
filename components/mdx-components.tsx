import clsx from 'clsx'
import Link from 'next/link'
import type { ComponentPropsWithoutRef } from 'react'

import { Badge } from './badge'
import { Callout } from './callout'
import { CodeGroup } from './code-group'

export const mdxComponents = {
  a: SmartLink,
  img: ImageComponent,
  table: TableComponent,
  Badge,
  Callout,
  CodeGroup,
}

function SmartLink({
  href = '',
  className,
  ...props
}: ComponentPropsWithoutRef<'a'>) {
  const normalizedHref = normalizeHref(href)
  const safeHref = isSafeHref(normalizedHref) ? normalizedHref : '#'
  const external = /^(https?:|mailto:|tel:)/.test(safeHref)
  const relative = safeHref.startsWith('./') || safeHref.startsWith('../')

  if (external || relative || safeHref.startsWith('#')) {
    return (
      <a
        href={safeHref}
        className={className}
        rel={external ? 'noopener noreferrer' : undefined}
        target={external ? '_blank' : undefined}
        {...props}
      />
    )
  }

  return (
    <Link href={safeHref} className={className} prefetch={false} {...props} />
  )
}

function ImageComponent({
  className,
  alt = '',
  ...props
}: ComponentPropsWithoutRef<'img'>) {
  return (
    <img
      alt={alt}
      className={clsx('mdx-image', className)}
      decoding="async"
      loading="lazy"
      {...props}
    />
  )
}

function TableComponent(props: ComponentPropsWithoutRef<'table'>) {
  return (
    <div className="table-scroll">
      <table {...props} />
    </div>
  )
}

function normalizeHref(href: string) {
  return href
    .replace(/\.md(?=#|$)/, '')
    .replace(/\/index(?=#|$)/, '')
    .replace(/\/$/, '') || '/'
}

function isSafeHref(href: string) {
  return (
    href.startsWith('/') ||
    href.startsWith('./') ||
    href.startsWith('../') ||
    href.startsWith('#') ||
    /^(https?:|mailto:|tel:)/.test(href)
  )
}
