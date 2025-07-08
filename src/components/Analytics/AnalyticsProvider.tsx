'use client'

import { createContext, useContext, useEffect } from 'react'
import type { ReactNode } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { analytics } from '../../lib/analytics/google-analytics'

interface AnalyticsContextType {
  trackEvent: (action: string, category: string, label?: string, value?: number) => void
  trackPageView: (pagePath?: string, pageTitle?: string) => void
  trackIntakeFormStarted: () => void
  trackIntakeFormSubmitted: () => void
  trackAppointmentBookingStarted: () => void
  trackAppointmentBooked: (appointmentType?: string) => void
  trackSearchQuery: (query: string) => void
  trackDownload: (fileName: string, fileType: string) => void
  trackError: (errorType: string, errorMessage?: string) => void
  trackUserEngagement: (action: string, element: string) => void
}

const AnalyticsContext = createContext<AnalyticsContextType | null>(null)

interface AnalyticsProviderProps {
  children: ReactNode
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Track page views on route changes
  useEffect(() => {
    const handleRouteChange = () => {
      const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '')
      
      // Determine content groups based on pathname
      let contentGroup1 = 'public'
      let contentGroup2 = 'general'
      
      if (pathname.startsWith('/admin')) {
        contentGroup1 = 'admin'
        contentGroup2 = pathname.split('/')[2] || 'dashboard'
      } else if (pathname.startsWith('/intake')) {
        contentGroup1 = 'patient'
        contentGroup2 = 'intake'
      } else if (pathname.includes('appointment')) {
        contentGroup1 = 'patient'
        contentGroup2 = 'appointment'
      } else if (pathname.startsWith('/blog')) {
        contentGroup1 = 'public'
        contentGroup2 = 'blog'
      } else if (pathname.startsWith('/team')) {
        contentGroup1 = 'public'
        contentGroup2 = 'team'
      }

      analytics.trackPageView({
        page_path: pathname,
        page_location: url,
        page_title: document.title,
        content_group1: contentGroup1,
        content_group2: contentGroup2
      })
    }

    // Track initial page load
    handleRouteChange()
  }, [pathname, searchParams])

  const contextValue: AnalyticsContextType = {
    trackEvent: (action: string, category: string, label?: string, value?: number) => {
      analytics.trackEvent({ action, category, label, value })
    },

    trackPageView: (pagePath?: string, pageTitle?: string) => {
      analytics.trackPageView({
        page_path: pagePath,
        page_title: pageTitle
      })
    },

    trackIntakeFormStarted: () => {
      analytics.trackIntakeFormStarted()
    },

    trackIntakeFormSubmitted: () => {
      analytics.trackIntakeFormSubmitted()
    },

    trackAppointmentBookingStarted: () => {
      analytics.trackAppointmentBookingStarted()
    },

    trackAppointmentBooked: (appointmentType?: string) => {
      analytics.trackAppointmentBooked(appointmentType)
    },

    trackSearchQuery: (query: string) => {
      analytics.trackSearchQuery(query)
    },

    trackDownload: (fileName: string, fileType: string) => {
      analytics.trackDownload(fileName, fileType)
    },

    trackError: (errorType: string, errorMessage?: string) => {
      analytics.trackError(errorType, errorMessage)
    },

    trackUserEngagement: (action: string, element: string) => {
      analytics.trackUserEngagement(action, element)
    }
  }

  return (
    <AnalyticsContext.Provider value={contextValue}>
      {children}
    </AnalyticsContext.Provider>
  )
}

// Hook to use analytics in components
export function useAnalytics() {
  const context = useContext(AnalyticsContext)
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider')
  }
  return context
}

// Higher-order component for tracking form interactions
export function withFormAnalytics<T extends object>(
  WrappedComponent: React.ComponentType<T>,
  formName: string
) {
  return function FormAnalyticsWrapper(props: T) {
    const { trackEvent } = useAnalytics()

    const trackFormStart = () => {
      trackEvent('form_started', 'forms', formName)
    }

    const trackFormSubmit = () => {
      trackEvent('form_submitted', 'forms', formName)
    }

    const trackFormError = (error: string) => {
      trackEvent('form_error', 'forms', `${formName}_${error}`)
    }

    const enhancedProps = {
      ...props,
      onFormStart: trackFormStart,
      onFormSubmit: trackFormSubmit,
      onFormError: trackFormError
    } as T

    return <WrappedComponent {...enhancedProps} />
  }
}

// Component for tracking button clicks
interface AnalyticsButtonProps {
  children: ReactNode
  onClick?: () => void
  category: string
  action: string
  label?: string
  className?: string
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}

export function AnalyticsButton({
  children,
  onClick,
  category,
  action,
  label,
  className = '',
  disabled = false,
  type = 'button'
}: AnalyticsButtonProps) {
  const { trackEvent } = useAnalytics()

  const handleClick = () => {
    if (!disabled) {
      trackEvent(action, category, label)
      onClick?.()
    }
  }

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={disabled}
      className={className}
    >
      {children}
    </button>
  )
}

// Component for tracking link clicks
interface AnalyticsLinkProps {
  children: ReactNode
  href: string
  category: string
  action: string
  label?: string
  className?: string
  target?: string
  external?: boolean
}

export function AnalyticsLink({
  children,
  href,
  category,
  action,
  label,
  className = '',
  target,
  external = false
}: AnalyticsLinkProps) {
  const { trackEvent } = useAnalytics()

  const handleClick = () => {
    trackEvent(action, category, label || href)
  }

  if (external) {
    return (
      <a
        href={href}
        onClick={handleClick}
        className={className}
        target={target || '_blank'}
        rel="noopener noreferrer"
      >
        {children}
      </a>
    )
  }

  return (
    <a
      href={href}
      onClick={handleClick}
      className={className}
      target={target}
    >
      {children}
    </a>
  )
}

// Hook for tracking user interactions
export function useInteractionTracking() {
  const { trackUserEngagement } = useAnalytics()

  const trackScroll = (percentage: number) => {
    if (percentage >= 25 && percentage < 50) {
      trackUserEngagement('scroll_25', 'page')
    } else if (percentage >= 50 && percentage < 75) {
      trackUserEngagement('scroll_50', 'page')
    } else if (percentage >= 75 && percentage < 90) {
      trackUserEngagement('scroll_75', 'page')
    } else if (percentage >= 90) {
      trackUserEngagement('scroll_complete', 'page')
    }
  }

  const trackTimeOnPage = (seconds: number) => {
    if (seconds >= 30 && seconds < 60) {
      trackUserEngagement('time_on_page_30s', 'engagement')
    } else if (seconds >= 60 && seconds < 180) {
      trackUserEngagement('time_on_page_1m', 'engagement')
    } else if (seconds >= 180 && seconds < 300) {
      trackUserEngagement('time_on_page_3m', 'engagement')
    } else if (seconds >= 300) {
      trackUserEngagement('time_on_page_5m', 'engagement')
    }
  }

  const trackElementClick = (elementType: string, elementId?: string) => {
    trackUserEngagement('element_click', elementId ? `${elementType}_${elementId}` : elementType)
  }

  const trackVideoPlay = (videoId: string) => {
    trackUserEngagement('video_play', `video_${videoId}`)
  }

  const trackVideoComplete = (videoId: string) => {
    trackUserEngagement('video_complete', `video_${videoId}`)
  }

  return {
    trackScroll,
    trackTimeOnPage,
    trackElementClick,
    trackVideoPlay,
    trackVideoComplete
  }
}

// Component for automatic scroll tracking
export function ScrollTracker() {
  const { trackScroll } = useInteractionTracking()

  useEffect(() => {
    let lastScrollPercentage = 0
    
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrollPercentage = Math.round((scrollTop / scrollHeight) * 100)
      
      if (scrollPercentage > lastScrollPercentage) {
        trackScroll(scrollPercentage)
        lastScrollPercentage = scrollPercentage
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [trackScroll])

  return null
}

// Component for automatic time tracking
export function TimeTracker() {
  const { trackTimeOnPage } = useInteractionTracking()

  useEffect(() => {
    const intervals = [30, 60, 180, 300] // seconds
    const timers: NodeJS.Timeout[] = []

    intervals.forEach(seconds => {
      const timer = setTimeout(() => {
        trackTimeOnPage(seconds)
      }, seconds * 1000)
      timers.push(timer)
    })

    return () => {
      timers.forEach(timer => clearTimeout(timer))
    }
  }, [trackTimeOnPage])

  return null
} 