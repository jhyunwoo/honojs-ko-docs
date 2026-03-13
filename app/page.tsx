import Link from 'next/link'

import { LogoHero } from '@/components/logo-hero'
import { WebSiteJsonLd } from '@/components/structured-data'
import { getHomeData } from '@/lib/content'
import { buildMetadata } from '@/lib/site'

export async function generateMetadata() {
  const home = await getHomeData()
  return buildMetadata({
    title: home.title,
    description: home.description,
    path: '/',
    keywords: ['Hono 홈', 'Hono 공식 문서', 'Hono 한국어', '웹 프레임워크'],
  })
}

export default async function HomePage() {
  const home = await getHomeData()
  const hero = home.hero

  return (
    <main className="page-shell">
      <WebSiteJsonLd path="/" title={home.title} description={home.description} />
      <section className="home-hero">
        <div className="home-hero__copy">
          <span className="hero-kicker">{hero?.name ?? 'Hono'}</span>
          <h1>{hero?.text ?? '웹 애플리케이션 프레임워크'}</h1>
          <p>{hero?.tagline}</p>
          <div className="hero-actions">
            {hero?.actions?.map((action) =>
              action.link?.startsWith('http') ? (
                <a
                  key={action.link}
                  className={`hero-button hero-button--${action.theme ?? 'brand'}`}
                  href={action.link}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {action.text}
                </a>
              ) : (
                <Link
                  key={action.link}
                  className={`hero-button hero-button--${action.theme ?? 'brand'}`}
                  href={action.link ?? '/docs'}
                  prefetch={false}
                >
                  {action.text}
                </Link>
              )
            )}
          </div>
          <ul className="hero-highlights">
            <li>App Router 기반 정적 export</li>
            <li>라이트/다크 테마와 로컬 검색</li>
            <li>문서 111개 페이지와 예제 전체 제공</li>
          </ul>
        </div>

        <LogoHero
          defaultSrc={hero?.image?.src ?? '/images/code.webp'}
          defaultAlt={hero?.image?.alt ?? 'Hono 예제 코드'}
        />
      </section>

      <section className="feature-grid">
        {home.features.map((feature, index) => (
          <article key={`${feature.title}-${index}`} className="feature-card">
            <span className="feature-card__icon">{feature.icon}</span>
            <h2>{feature.title}</h2>
            <p>{feature.details}</p>
          </article>
        ))}
      </section>

      <section className="home-sections">
        <article className="home-panel">
          <span className="home-panel__eyebrow">문서</span>
          <h2>섹션별로 문서를 빠르게 탐색하세요.</h2>
          <p>
            개념, 시작하기, API, 가이드, 헬퍼, 미들웨어, LLM 문서를 한 자리에서
            이동할 수 있도록 구성했습니다.
          </p>
          <div className="home-panel__links">
            <Link href="/docs" prefetch={false}>문서 홈</Link>
            <Link href="/docs/api/context" prefetch={false}>Context API</Link>
            <Link href="/docs/guides/jsx" prefetch={false}>JSX 가이드</Link>
          </div>
        </article>

        <article className="home-panel">
          <span className="home-panel__eyebrow">예제</span>
          <h2>실전 예제로 곧바로 구현 패턴을 살펴보세요.</h2>
          <p>
            Better Auth, Cloudflare, OpenAPI, Prisma, htmx 등 실제 프로젝트에
            가까운 예제를 주제별로 묶어 제공됩니다.
          </p>
          <div className="home-panel__links">
            <Link href="/examples" prefetch={false}>예제 둘러보기</Link>
            <Link href="/examples/better-auth-on-cloudflare" prefetch={false}>
              Better Auth on Cloudflare
            </Link>
            <Link href="/examples/prisma" prefetch={false}>Prisma 예제</Link>
          </div>
        </article>
      </section>
    </main>
  )
}
