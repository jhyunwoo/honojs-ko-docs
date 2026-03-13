'use client'

import clsx from 'clsx'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

const themeOptions = [
  { label: '라이트', value: 'light' },
  { label: '다크', value: 'dark' },
  { label: '시스템', value: 'system' },
] as const

export function ThemeToggle() {
  const { resolvedTheme, theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="theme-toggle" aria-label="테마 전환">
      {themeOptions.map((option) => {
        const active = mounted
          ? theme === option.value ||
            (option.value === 'system' && theme === 'system') ||
            (theme === undefined &&
              option.value !== 'system' &&
              resolvedTheme === option.value)
          : option.value === 'system'

        return (
          <button
            key={option.value}
            type="button"
            className={clsx('theme-toggle__button', active && 'is-active')}
            onClick={() => setTheme(option.value)}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
