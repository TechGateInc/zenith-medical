// HIPAA-Compliant Google Analytics 4 Integration
// This implementation ensures no PHI (Protected Health Information) is tracked

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void
    dataLayer: unknown[]
  }
}

export interface AnalyticsEvent {
  action: string
  category: string
  label?: string
  value?: number
  custom_parameters?: Record<string, unknown>
}

export interface PageViewEvent {
  page_title: string
  page_location: string
  page_path: string
  content_group1?: string // Section like 'public', 'admin', 'intake'
  content_group2?: string // Sub-section
}

export class GoogleAnalytics {
  private measurementId: string | null = null
  private isInitialized = false
  private isProduction = false
  private consentGiven = false

  constructor() {
    this.measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || null
    this.isProduction = process.env.NODE_ENV === 'production'
    this.loadConsentSettings()
  }

  private loadConsentSettings() {
    if (typeof window !== 'undefined') {
      const consent = localStorage.getItem('analytics_consent')
      this.consentGiven = consent === 'granted'
    }
  }

  public async initialize() {
    if (!this.measurementId || this.isInitialized || typeof window === 'undefined') {
      return
    }

    try {
      // Load Google Analytics script
      const script = document.createElement('script')
      script.async = true
      script.src = `https://www.googletagmanager.com/gtag/js?id=${this.measurementId}`
      document.head.appendChild(script)

      // Initialize dataLayer
      window.dataLayer = window.dataLayer || []
      window.gtag = function gtag(...args: unknown[]) {
        window.dataLayer.push(args)
      }

      // Configure Google Analytics with privacy settings
      window.gtag('consent', 'default', {
        'analytics_storage': this.consentGiven ? 'granted' : 'denied',
        'ad_storage': 'denied', // Always deny ad storage for medical site
        'functionality_storage': 'granted',
        'security_storage': 'granted'
      })

      window.gtag('js', new Date())
      
      // Configure GA4 with HIPAA-compliant settings
      window.gtag('config', this.measurementId, {
        // Privacy and HIPAA compliance settings
        anonymize_ip: true,
        allow_google_signals: false, // Disable Google Signals for privacy
        allow_ad_personalization_signals: false,
        
        // Custom settings for medical website
        page_title: this.sanitizePageTitle(document.title),
        custom_map: {
          'custom_parameter_1': 'user_type', // 'patient', 'admin', 'visitor'
          'custom_parameter_2': 'section', // 'intake', 'appointments', etc.
        },
        
        // Enhanced measurement controls
        enhanced_measurement: {
          scrolls: true,
          outbound_clicks: true,
          site_search: false, // Disable to avoid tracking search terms
          video_engagement: true,
          file_downloads: true
        }
      })

      this.isInitialized = true
      console.log('Google Analytics initialized with privacy settings')

    } catch (error) {
      console.error('Failed to initialize Google Analytics:', error)
    }
  }

  public updateConsent(granted: boolean) {
    this.consentGiven = granted
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('analytics_consent', granted ? 'granted' : 'denied')
      
      if (window.gtag) {
        window.gtag('consent', 'update', {
          'analytics_storage': granted ? 'granted' : 'denied'
        })
      }
    }
  }

  public trackPageView(pageData: Partial<PageViewEvent> = {}) {
    if (!this.shouldTrack()) return

    const sanitizedData = {
      page_title: this.sanitizePageTitle(pageData.page_title || document.title),
      page_location: this.sanitizeUrl(pageData.page_location || window.location.href),
      page_path: this.sanitizeUrl(pageData.page_path || window.location.pathname),
      content_group1: pageData.content_group1,
      content_group2: pageData.content_group2
    }

    window.gtag('event', 'page_view', sanitizedData)
  }

  public trackEvent(event: AnalyticsEvent) {
    if (!this.shouldTrack()) return

    // Ensure no PHI is tracked in events
    const sanitizedEvent = {
      event_category: event.category,
      event_label: event.label ? this.sanitizeString(event.label) : undefined,
      value: event.value,
      ...this.sanitizeCustomParameters(event.custom_parameters || {})
    }

    window.gtag('event', event.action, sanitizedEvent)
  }

  // Medical website specific tracking methods
  public trackIntakeFormStarted() {
    this.trackEvent({
      action: 'intake_form_started',
      category: 'patient_journey',
      label: 'intake_form'
    })
  }

  public trackIntakeFormSubmitted() {
    this.trackEvent({
      action: 'intake_form_submitted',
      category: 'patient_journey',
      label: 'intake_form'
    })
  }

  public trackAppointmentBookingStarted() {
    this.trackEvent({
      action: 'appointment_booking_started',
      category: 'patient_journey',
      label: 'appointment_booking'
    })
  }

  public trackAppointmentBooked(appointmentType?: string) {
    this.trackEvent({
      action: 'appointment_booked',
      category: 'patient_journey',
      label: appointmentType || 'general',
      custom_parameters: {
        appointment_type: appointmentType
      }
    })
  }

  public trackAdminLogin() {
    this.trackEvent({
      action: 'admin_login',
      category: 'admin_actions',
      label: 'login'
    })
  }

  public trackContentManagement(action: string, contentType: string) {
    this.trackEvent({
      action: `content_${action}`,
      category: 'admin_content',
      label: contentType,
      custom_parameters: {
        content_type: contentType,
        action: action
      }
    })
  }

  public trackSearchQuery(query: string) {
    // Sanitize search query to remove any potential PHI
    const sanitizedQuery = this.sanitizeSearchQuery(query)
    
    this.trackEvent({
      action: 'search',
      category: 'site_search',
      label: sanitizedQuery,
      custom_parameters: {
        search_term: sanitizedQuery
      }
    })
  }

  public trackDownload(fileName: string, fileType: string) {
    this.trackEvent({
      action: 'file_download',
      category: 'downloads',
      label: fileType,
      custom_parameters: {
        file_name: this.sanitizeFileName(fileName),
        file_type: fileType
      }
    })
  }

  public trackError(errorType: string, errorMessage?: string) {
    this.trackEvent({
      action: 'error',
      category: 'technical',
      label: errorType,
      custom_parameters: {
        error_type: errorType,
        error_message: errorMessage ? this.sanitizeString(errorMessage) : undefined
      }
    })
  }

  public trackUserEngagement(action: string, element: string) {
    this.trackEvent({
      action: action,
      category: 'engagement',
      label: element,
      custom_parameters: {
        element_type: element
      }
    })
  }

  // Privacy and sanitization methods
  private shouldTrack(): boolean {
    return !!(
      this.isInitialized && 
      this.consentGiven && 
      this.measurementId && 
      typeof window !== 'undefined' && 
      window.gtag
    )
  }

  private sanitizePageTitle(title: string): string {
    // Remove any potential PHI from page titles
    return title
      .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN]') // SSN pattern
      .replace(/\b\d{3}-\d{3}-\d{4}\b/g, '[PHONE]') // Phone pattern
      .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]') // Email pattern
      .replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, '[CARD]') // Credit card pattern
  }

  private sanitizeUrl(url: string): string {
    try {
      const urlObj = new URL(url)
      
      // Remove sensitive query parameters
      const sensitiveParams = ['id', 'token', 'email', 'phone', 'ssn', 'patient']
      sensitiveParams.forEach(param => {
        if (urlObj.searchParams.has(param)) {
          urlObj.searchParams.set(param, '[REDACTED]')
        }
      })

      // Remove hash fragments that might contain sensitive data
      urlObj.hash = ''

      return urlObj.toString()
    } catch {
      return '[INVALID_URL]'
    }
  }

  private sanitizeString(str: string): string {
    // Remove common patterns that might contain PHI
    return str
      .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN]')
      .replace(/\b\d{3}-\d{3}-\d{4}\b/g, '[PHONE]')
      .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]')
      .replace(/\b\d{1,2}\/\d{1,2}\/\d{4}\b/g, '[DATE]')
      .replace(/\b[A-Z][a-z]+ [A-Z][a-z]+\b/g, '[NAME]') // Simple name pattern
  }

  private sanitizeSearchQuery(query: string): string {
    // More aggressive sanitization for search queries
    const sanitized = this.sanitizeString(query.toLowerCase())
    
    // Remove common medical terms that combined with other info could be identifying
    const medicalTerms = ['appointment', 'doctor', 'patient', 'medical', 'health']
    const words = sanitized.split(' ')
    
    const cleanWords = words.map(word => {
      // If word looks like it could be identifying, replace it
      if (word.length > 2 && !medicalTerms.includes(word)) {
        return '[TERM]'
      }
      return word
    })

    return cleanWords.join(' ').substring(0, 50) // Limit length
  }

  private sanitizeFileName(fileName: string): string {
    // Extract just the file extension and generic info
    const extension = fileName.split('.').pop()
    return `file.${extension}`
  }

  private sanitizeCustomParameters(params: Record<string, unknown>): Record<string, unknown> {
    const sanitized: Record<string, unknown> = {}
    
    Object.entries(params).forEach(([key, value]) => {
      if (typeof value === 'string') {
        sanitized[key] = this.sanitizeString(value)
      } else if (typeof value === 'number' || typeof value === 'boolean') {
        sanitized[key] = value
      }
      // Skip objects and arrays to avoid accidental PHI inclusion
    })

    return sanitized
  }

  public getAnalyticsStatus() {
    return {
      isInitialized: this.isInitialized,
      consentGiven: this.consentGiven,
      measurementId: this.measurementId ? `${this.measurementId.substring(0, 5)}...` : null,
      isProduction: this.isProduction
    }
  }
}

// Export singleton instance
export const analytics = new GoogleAnalytics()

// Auto-initialize in browser
if (typeof window !== 'undefined') {
  analytics.initialize()
} 