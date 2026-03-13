import Link from 'next/link'
import { notFound } from 'next/navigation'

import { DocLayout } from '@/components/doc-layout'
import { ArticleJsonLd, WebSiteJsonLd } from '@/components/structured-data'
import { getExamplesLandingData, getPage, getStaticParams } from '@/lib/content'
import { examplesSidebar } from '@/lib/navigation'
import { buildMetadata } from '@/lib/site'

type ExamplesPageProps = {
  params: Promise<{
    slug?: string[]
  }>
}

export const dynamicParams = false

export async function generateStaticParams() {
  return getStaticParams('examples')
}

export async function generateMetadata({ params }: ExamplesPageProps) {
  const { slug = [] } = await params

  if (slug.length === 0) {
    const landing = await getExamplesLandingData()
    return buildMetadata({
      title: landing.title,
      description: landing.description,
      path: '/examples',
      keywords: ['Hono 예제', 'Hono 실전 예제', 'Cloudflare', 'OpenAPI'],
    })
  }

  const page = await getPage('examples', slug)
  if (!page) {
    return buildMetadata({
      title: '예제를 찾을 수 없습니다',
      description: '요청한 예제를 찾을 수 없습니다.',
      path: '/examples',
    })
  }

  return buildMetadata({
    title: page.title,
    description: page.description,
    path: page.href,
    type: 'article',
    keywords: ['Hono 예제', page.title],
  })
}

export default async function ExamplesPage({ params }: ExamplesPageProps) {
  const { slug = [] } = await params

  if (slug.length === 0) {
    const landing = await getExamplesLandingData()
    return (
      <>
        <WebSiteJsonLd
          path="/examples"
          title={landing.title}
          description={landing.description}
        />
        <DocLayout kind="examples" href="/examples" title={landing.title} headings={[]}>
          <section className="examples-landing">
            <header className="examples-landing__header">
              <span className="hero-kicker">Examples</span>
              <h1>{landing.title}</h1>
              <p>{landing.description}</p>
              <a href={landing.githubUrl} rel="noopener noreferrer" target="_blank">
                GitHub 저장소 보기
              </a>
            </header>

            {examplesSidebar.map((group) => (
              <section key={group.title} className="examples-section">
                <h2>{group.title}</h2>
                <div className="examples-grid">
                  {group.items.map((item) => (
                    <Link
                      key={item.href}
                      className="example-card"
                      href={item.href}
                      prefetch={false}
                    >
                      <strong>{item.title}</strong>
                      <span>{item.href.replace('/examples/', '').replace(/-/g, ' ')}</span>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </section>
        </DocLayout>
      </>
    )
  }

  const page = await getPage('examples', slug)
  if (!page) {
    notFound()
  }

  return (
    <>
      <ArticleJsonLd
        kind="examples"
        path={page.href}
        title={page.title}
        description={page.description}
      />
      <DocLayout
        kind="examples"
        href={page.href}
        title={page.title}
        headings={page.headings}
        prev={page.prev}
        next={page.next}
      >
        {page.content}
      </DocLayout>
    </>
  )
}
