import { generateMetadata as generateSEOMetadata, PAGE_METADATA } from '../../lib/utils/seo'

export const metadata = generateSEOMetadata({
  ...PAGE_METADATA.contact,
  canonical: '/contact',
})

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 