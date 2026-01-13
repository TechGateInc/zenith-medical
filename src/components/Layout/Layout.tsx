import { type ReactNode } from 'react'
import type { Location } from '@prisma/client'
import Header from './Header'
import Footer from './Footer'

interface LayoutProps {
  children: ReactNode
  className?: string
  location?: Location
}

export default function Layout({ children, className = '', location }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header location={location} />
      <main className={`flex-grow ${className}`}>
        {children}
      </main>
      <Footer location={location} />
    </div>
  )
} 