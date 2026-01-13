'use client'

interface LocationColorInjectorProps {
  primaryColor: string
  secondaryColor: string
}

/**
 * Injects location-specific CSS custom properties for theming.
 * These variables can be used throughout the app for dynamic color theming.
 */
export default function LocationColorInjector({
  primaryColor,
  secondaryColor,
}: LocationColorInjectorProps) {
  // Generate lighter/darker variants
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 0, g: 0, b: 0 }
  }

  const primary = hexToRgb(primaryColor)
  const secondary = hexToRgb(secondaryColor)

  return (
    <style jsx global>{`
      :root {
        --color-primary: ${primaryColor};
        --color-secondary: ${secondaryColor};
        --color-primary-rgb: ${primary.r}, ${primary.g}, ${primary.b};
        --color-secondary-rgb: ${secondary.r}, ${secondary.g}, ${secondary.b};
        --color-primary-light: rgba(${primary.r}, ${primary.g}, ${primary.b}, 0.1);
        --color-primary-medium: rgba(${primary.r}, ${primary.g}, ${primary.b}, 0.2);
      }

      /* Override common Tailwind blue classes with location primary color */
      .location-theme .bg-blue-600 {
        background-color: var(--color-primary) !important;
      }
      .location-theme .bg-blue-700 {
        background-color: var(--color-secondary) !important;
      }
      .location-theme .hover\\:bg-blue-700:hover {
        background-color: var(--color-secondary) !important;
      }
      .location-theme .text-blue-600 {
        color: var(--color-primary) !important;
      }
      .location-theme .text-blue-700 {
        color: var(--color-secondary) !important;
      }
      .location-theme .border-blue-600 {
        border-color: var(--color-primary) !important;
      }
      .location-theme .ring-blue-600 {
        --tw-ring-color: var(--color-primary) !important;
      }
      .location-theme .focus\\:ring-blue-600:focus {
        --tw-ring-color: var(--color-primary) !important;
      }

      /* Custom utility classes */
      .bg-location-primary {
        background-color: var(--color-primary);
      }
      .bg-location-secondary {
        background-color: var(--color-secondary);
      }
      .text-location-primary {
        color: var(--color-primary);
      }
      .text-location-secondary {
        color: var(--color-secondary);
      }
      .border-location-primary {
        border-color: var(--color-primary);
      }
      .border-location-secondary {
        border-color: var(--color-secondary);
      }
    `}</style>
  )
}
