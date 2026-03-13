import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
}

export default function NotFound() {
  return (
    <main className="page-shell not-found">
      <span className="hero-kicker">404</span>
      <h1>요청한 페이지를 찾을 수 없습니다.</h1>
      <p>문서 경로가 바뀌었거나 잘못된 링크일 수 있습니다. 아래 링크에서 다시 시작해 주세요.</p>
      <div className="hero-actions">
        <Link className="hero-button hero-button--brand" href="/docs">
          문서 홈으로
        </Link>
        <Link className="hero-button hero-button--alt" href="/examples">
          예제 둘러보기
        </Link>
      </div>
    </main>
  )
}
