'use client'

import clsx from 'clsx'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

import { topNavigation } from '@/lib/navigation'

import { ThemeToggle } from './theme-toggle'

const SearchModal = dynamic(
  () => import('./search-modal').then((module) => module.SearchModal),
  {
    ssr: false,
  }
)

export function SiteHeader() {
  const pathname = usePathname()
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setSearchOpen((value) => !value)
      }

      if (event.key === 'Escape') {
        setSearchOpen(false)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <>
      <header className="site-header">
        <div className="site-header__inner">
          <Link className="site-brand" href="/" prefetch={false}>
            <Image
              src="/images/logo.svg"
              alt="Hono 로고"
              width={28}
              height={28}
              priority
            />
            <span>Hono 한국어 문서</span>
          </Link>

          <nav className="site-nav" aria-label="주요 탐색">
            {topNavigation.map((item) => {
              const external = /^https?:/.test(item.href)
              const active =
                !external &&
                (pathname === item.href || pathname.startsWith(`${item.href}/`))

              return external ? (
                <a
                  key={item.href}
                  className="site-nav__link"
                  href={item.href}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {item.title}
                </a>
              ) : (
                <Link
                  key={item.href}
                  className={clsx('site-nav__link', active && 'is-active')}
                  href={item.href}
                  prefetch={false}
                >
                  {item.title}
                </Link>
              )
            })}
          </nav>

          <div className="site-header__actions">
            <button
              type="button"
              className="search-trigger"
              onClick={() => setSearchOpen(true)}
            >
              <span>검색</span>
              <kbd>⌘K</kbd>
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>
      {searchOpen ? (
        <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
      ) : null}
    </>
  )
}
