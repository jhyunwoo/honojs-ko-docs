'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'

type LogoHeroProps = {
  defaultSrc: string
  defaultAlt: string
}

const kawaiiAlt =
  '카와이 스타일의 Hono 로고입니다. 첫 번째 o가 불꽃 모양으로 바뀌어 있습니다.'

export function LogoHero({ defaultSrc, defaultAlt }: LogoHeroProps) {
  const [kawaii, setKawaii] = useState(false)

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem('kawaii')
      const params = new URLSearchParams(window.location.search)
      const fromQuery = params.get('kawaii')

      if (fromQuery === 'true') {
        window.localStorage.setItem('kawaii', 'true')
        setKawaii(true)
        return
      }

      if (fromQuery === 'false') {
        window.localStorage.removeItem('kawaii')
        setKawaii(false)
        return
      }

      setKawaii(stored === 'true')
    } catch {
      setKawaii(false)
    }
  }, [])

  const toggle = () => {
    setKawaii((value) => {
      const next = !value
      try {
        if (next) {
          window.localStorage.setItem('kawaii', 'true')
        } else {
          window.localStorage.removeItem('kawaii')
        }
        const nextUrl = new URL(window.location.href)
        nextUrl.searchParams.set('kawaii', String(next))
        window.history.replaceState(null, '', nextUrl)
      } catch {
        return next
      }
      return next
    })
  }

  return (
    <div className="hero-visual">
      <div className="hero-visual__frame">
        <Image
          src={kawaii ? '/images/hono-kawaii.png' : defaultSrc}
          alt={kawaii ? kawaiiAlt : defaultAlt}
          fill
          className={kawaii ? 'is-kawaii' : undefined}
          priority
          sizes="(max-width: 860px) 100vw, 40vw"
        />
      </div>
      <button type="button" className="hero-visual__toggle" onClick={toggle}>
        {kawaii ? '기본 로고로 보기' : '카와이 로고로 보기'}
      </button>
    </div>
  )
}
