import { generateMetadata as generateSEOMetadata, PAGE_METADATA } from '../../lib/utils/seo'

export const metadata = generateSEOMetadata({
  ...PAGE_METADATA.blog,
  canonical: '/blog',
})

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 