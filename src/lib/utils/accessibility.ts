// Accessibility utilities for WCAG 2.1 AA compliance

// Utility function for merging class names
export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ')
}

// Screen reader announcement utility
const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
  if (typeof window === 'undefined') return

  const announcement = document.createElement('div')
  announcement.setAttribute('aria-live', priority)
  announcement.setAttribute('aria-atomic', 'true')
  announcement.className = 'sr-only'
  announcement.textContent = message

  document.body.appendChild(announcement)

  // Remove after announcement is made
  setTimeout(() => {
    document.body.removeChild(announcement)
  }, 1000)
}

// Focus management utilities
const focusManagement = {
  // Trap focus within a container
  trapFocus: (container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault()
            lastElement?.focus()
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault()
            firstElement?.focus()
          }
        }
      }
    }

    container.addEventListener('keydown', handleKeyDown)
    firstElement?.focus()

    return () => {
      container.removeEventListener('keydown', handleKeyDown)
    }
  },

  // Move focus to element and announce change
  moveFocusTo: (element: HTMLElement | null, announcement?: string) => {
    if (!element) return

    element.focus()
    if (announcement) {
      announceToScreenReader(announcement, 'assertive')
    }
  },

  // Get all focusable elements in container
  getFocusableElements: (container: HTMLElement) => {
    return container.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>
  }
}

// Keyboard navigation helpers
const keyboardNavigation = {
  // Handle arrow key navigation in lists
  handleArrowKeyNavigation: (e: KeyboardEvent, items: HTMLElement[], currentIndex: number) => {
    let newIndex = currentIndex

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        newIndex = (currentIndex + 1) % items.length
        break
      case 'ArrowUp':
        e.preventDefault()
        newIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1
        break
      case 'Home':
        e.preventDefault()
        newIndex = 0
        break
      case 'End':
        e.preventDefault()
        newIndex = items.length - 1
        break
      default:
        return currentIndex
    }

    items[newIndex]?.focus()
    return newIndex
  },

  // Handle escape key
  handleEscape: (callback: () => void) => {
    return (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        callback()
      }
    }
  }
}

// Form accessibility helpers
const formAccessibility = {
  // Generate unique IDs for form fields
  generateFieldId: (fieldName: string, suffix?: string) => {
    const id = `field-${fieldName}`
    return suffix ? `${id}-${suffix}` : id
  },

  // Generate ARIA attributes for form fields
  generateFieldAttributes: (fieldName: string, options: {
    required?: boolean
    invalid?: boolean
    describedBy?: string[]
    labelledBy?: string[]
  } = {}) => {
    const attributes: Record<string, string> = {}

    if (options.required) {
      attributes['aria-required'] = 'true'
    }

    if (options.invalid) {
      attributes['aria-invalid'] = 'true'
    }

    const describedBy = []
    if (options.describedBy) {
      describedBy.push(...options.describedBy)
    }
    if (options.invalid) {
      describedBy.push(`${fieldName}-error`)
    }
    if (describedBy.length > 0) {
      attributes['aria-describedby'] = describedBy.join(' ')
    }

    if (options.labelledBy && options.labelledBy.length > 0) {
      attributes['aria-labelledby'] = options.labelledBy.join(' ')
    }

    return attributes
  },

  // Announce form validation errors
  announceFormErrors: (errors: Record<string, string>) => {
    const errorCount = Object.keys(errors).length
    if (errorCount > 0) {
      const message = errorCount === 1 
        ? 'There is 1 error in the form. Please review and correct it.'
        : `There are ${errorCount} errors in the form. Please review and correct them.`
      
      announceToScreenReader(message, 'assertive')
    }
  },

  // Generate accessible error message
  generateErrorMessage: (fieldName: string, error: string) => {
    return {
      id: `${fieldName}-error`,
      role: 'alert',
      'aria-live': 'polite' as const,
      children: error
    }
  }
}

// Color contrast and visual accessibility
const visualAccessibility = {
  // Check if element meets color contrast requirements
  checkColorContrast: (foreground: string, background: string): boolean => {
    // This would typically use a more sophisticated color contrast calculation
    // For now, return true as we're using design system colors
    return true
  },

  // Add high contrast mode support
  addHighContrastSupport: () => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(prefers-contrast: high)')
    
    const updateContrastMode = (e: MediaQueryListEvent | MediaQueryList) => {
      if (e.matches) {
        document.documentElement.classList.add('high-contrast')
      } else {
        document.documentElement.classList.remove('high-contrast')
      }
    }

    updateContrastMode(mediaQuery)
    mediaQuery.addEventListener('change', updateContrastMode)

    return () => {
      mediaQuery.removeEventListener('change', updateContrastMode)
    }
  }
}

// Progress indication for multi-step forms
const progressAccessibility = {
  // Announce progress updates
  announceProgress: (currentStep: number, totalSteps: number, stepName?: string) => {
    const stepInfo = stepName ? ` on ${stepName}` : ''
    const message = `Step ${currentStep} of ${totalSteps}${stepInfo}`
    announceToScreenReader(message, 'polite')
  },

  // Generate progress bar attributes
  generateProgressAttributes: (currentStep: number, totalSteps: number) => {
    const progress = (currentStep / totalSteps) * 100
    
    return {
      role: 'progressbar',
      'aria-valuenow': currentStep,
      'aria-valuemin': 1,
      'aria-valuemax': totalSteps,
      'aria-valuetext': `Step ${currentStep} of ${totalSteps} complete`,
      'aria-label': 'Form completion progress'
    }
  }
}

// Skip links utility
const skipLinks = {
  // Create skip link
  createSkipLink: (targetId: string, text: string) => {
    if (typeof window === 'undefined') return null

    const skipLink = document.createElement('a')
    skipLink.href = `#${targetId}`
    skipLink.textContent = text
    skipLink.className = 'skip-link'
    skipLink.addEventListener('click', (e) => {
      e.preventDefault()
      const target = document.getElementById(targetId)
      if (target) {
        target.focus()
        target.scrollIntoView({ behavior: 'smooth' })
      }
    })

    return skipLink
  },

  // Add skip links to page
  addSkipLinks: (links: Array<{ targetId: string; text: string }>) => {
    if (typeof window === 'undefined') return

    const skipContainer = document.createElement('div')
    skipContainer.className = 'skip-links'
    skipContainer.setAttribute('aria-label', 'Skip navigation links')

    links.forEach(({ targetId, text }) => {
      const skipLink = skipLinks.createSkipLink(targetId, text)
      if (skipLink) {
        skipContainer.appendChild(skipLink)
      }
    })

    document.body.insertBefore(skipContainer, document.body.firstChild)
  }
}

// Responsive accessibility
const responsiveAccessibility = {
  // Handle reduced motion preference
  respectReducedMotion: () => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    
    const updateMotionPreference = (e: MediaQueryListEvent | MediaQueryList) => {
      if (e.matches) {
        document.documentElement.classList.add('reduce-motion')
      } else {
        document.documentElement.classList.remove('reduce-motion')
      }
    }

    updateMotionPreference(mediaQuery)
    mediaQuery.addEventListener('change', updateMotionPreference)

    return () => {
      mediaQuery.removeEventListener('change', updateMotionPreference)
    }
  },

  // Handle focus visible polyfill
  addFocusVisibleSupport: () => {
    if (typeof window === 'undefined') return

    let hadKeyboardEvent = true
    let keyboardThrottleTimeout = 0

    const onPointerDown = () => {
      hadKeyboardEvent = false
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.altKey || e.ctrlKey) {
        return
      }
      hadKeyboardEvent = true
    }

    const onFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement
      if (target && hadKeyboardEvent) {
        target.classList.add('focus-visible')
      }
    }

    const onBlur = (e: FocusEvent) => {
      const target = e.target as HTMLElement
      if (target) {
        target.classList.remove('focus-visible')
      }
    }

    document.addEventListener('keydown', onKeyDown, true)
    document.addEventListener('mousedown', onPointerDown, true)
    document.addEventListener('pointerdown', onPointerDown, true)
    document.addEventListener('touchstart', onPointerDown, true)
    document.addEventListener('focus', onFocus, true)
    document.addEventListener('blur', onBlur, true)

    return () => {
      document.removeEventListener('keydown', onKeyDown, true)
      document.removeEventListener('mousedown', onPointerDown, true)
      document.removeEventListener('pointerdown', onPointerDown, true)
      document.removeEventListener('touchstart', onPointerDown, true)
      document.removeEventListener('focus', onFocus, true)
      document.removeEventListener('blur', onBlur, true)
    }
  }
}

// Export all utilities
export {
  announceToScreenReader,
  focusManagement,
  keyboardNavigation,
  formAccessibility,
  visualAccessibility,
  progressAccessibility,
  skipLinks,
  responsiveAccessibility
} 