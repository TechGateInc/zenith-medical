import { generateMetadata as generateSEOMetadata, PAGE_METADATA } from '../../lib/utils/seo'

export const metadata = generateSEOMetadata({
  ...PAGE_METADATA.faq,
  canonical: '/faq',
})

export default function FAQLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 