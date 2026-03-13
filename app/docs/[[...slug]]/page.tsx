import { notFound } from 'next/navigation'

import { DocLayout } from '@/components/doc-layout'
import { ArticleJsonLd } from '@/components/structured-data'
import { getPage, getStaticParams } from '@/lib/content'
import { buildMetadata } from '@/lib/site'

type DocsPageProps = {
  params: Promise<{
    slug?: string[]
  }>
}

export const dynamicParams = false

export async function generateStaticParams() {
  return getStaticParams('docs')
}

export async function generateMetadata({ params }: DocsPageProps) {
  const { slug = [] } = await params
  const page = await getPage('docs', slug)

  if (!page) {
    return buildMetadata({
      title: '문서를 찾을 수 없습니다',
      description: '요청한 문서를 찾을 수 없습니다.',
      path: '/docs',
    })
  }

  return buildMetadata({
    title: page.title,
    description: page.description,
    path: page.href,
    type: 'article',
    keywords: ['Hono 문서', 'Hono API', page.title],
  })
}

export default async function DocsPage({ params }: DocsPageProps) {
  const { slug = [] } = await params
  const page = await getPage('docs', slug)

  if (!page) {
    notFound()
  }

  return (
    <>
      <ArticleJsonLd
        kind="docs"
        path={page.href}
        title={page.title}
        description={page.description}
      />
      <DocLayout
        kind="docs"
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
