import React from 'react'
import { cn } from '@/lib/utils/accessibility'

// Typography variant types
type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
type DisplayLevel = 'display-xl' | 'display-lg'
type BodyVariant = 'body-large' | 'body' | 'body-small' | 'lead' | 'small'
type TextColor = 'primary' | 'secondary' | 'muted' | 'inverse' | 'success' | 'warning' | 'error' | 'info' | 'brand-primary' | 'brand-secondary'
type TextWeight = 'light' | 'normal' | 'medium' | 'semibold' | 'bold'

// Base Typography component props
interface BaseTypographyProps {
  children: React.ReactNode
  className?: string
  color?: TextColor
  weight?: TextWeight
  as?: keyof JSX.IntrinsicElements
}

// Heading component props
interface HeadingProps extends BaseTypographyProps {
  level: HeadingLevel
  serif?: boolean
}

// Display component props
interface DisplayProps extends BaseTypographyProps {
  level: DisplayLevel
}

// Body text component props
interface BodyProps extends BaseTypographyProps {
  variant?: BodyVariant
  maxWidth?: boolean
}

// Caption component props
interface CaptionProps extends BaseTypographyProps {
  uppercase?: boolean
}

// Utility function to get color class
const getColorClass = (color?: TextColor): string => {
  if (!color) return ''
  
  const colorMap: Record<TextColor, string> = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    muted: 'text-muted',
    inverse: 'text-inverse',
    success: 'text-success',
    warning: 'text-warning',
    error: 'text-error',
    info: 'text-info',
    'brand-primary': 'text-brand-primary',
    'brand-secondary': 'text-brand-secondary',
  }
  
  return colorMap[color] || ''
}

// Utility function to get weight class
const getWeightClass = (weight?: TextWeight): string => {
  if (!weight) return ''
  
  const weightMap: Record<TextWeight, string> = {
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  }
  
  return weightMap[weight] || ''
}

// Heading Component
export const Heading: React.FC<HeadingProps> = ({
  level,
  serif = true,
  children,
  className,
  color,
  weight,
  as,
  ...props
}) => {
  const Component = as || level
  
  const getHeadingClass = (level: HeadingLevel, serif: boolean): string => {
    const baseClass = `text-${level}`
    const fontClass = serif ? '' : 'font-sans'
    return cn(baseClass, fontClass)
  }
  
  return (
    <Component
      className={cn(
        getHeadingClass(level, serif),
        getColorClass(color),
        getWeightClass(weight),
        className
      )}
      {...props}
    >
      {children}
    </Component>
  )
}

// Display Component
export const Display: React.FC<DisplayProps> = ({
  level,
  children,
  className,
  color,
  weight,
  as = 'h1',
  ...props
}) => {
  const Component = as
  
  return (
    <Component
      className={cn(
        `text-${level}`,
        getColorClass(color),
        getWeightClass(weight),
        className
      )}
      {...props}
    >
      {children}
    </Component>
  )
}

// Body Text Component
export const Body: React.FC<BodyProps> = ({
  variant = 'body',
  maxWidth = true,
  children,
  className,
  color,
  weight,
  as = 'p',
  ...props
}) => {
  const Component = as
  
  const getBodyClass = (variant: BodyVariant): string => {
    const variantMap: Record<BodyVariant, string> = {
      'body-large': 'text-body-large',
      'body': 'text-body',
      'body-small': 'text-body-small',
      'lead': 'text-lead',
      'small': 'text-small',
    }
    
    return variantMap[variant] || 'text-body'
  }
  
  return (
    <Component
      className={cn(
        getBodyClass(variant),
        maxWidth && 'max-w-prose',
        getColorClass(color),
        getWeightClass(weight),
        className
      )}
      {...props}
    >
      {children}
    </Component>
  )
}

// Caption Component
export const Caption: React.FC<CaptionProps> = ({
  uppercase = true,
  children,
  className,
  color = 'muted',
  weight,
  as = 'span',
  ...props
}) => {
  const Component = as
  
  return (
    <Component
      className={cn(
        'text-caption',
        !uppercase && 'normal-case',
        getColorClass(color),
        getWeightClass(weight),
        className
      )}
      {...props}
    >
      {children}
    </Component>
  )
}

// Link Component
interface LinkProps extends BaseTypographyProps {
  href?: string
  variant?: 'default' | 'muted' | 'subtle'
  external?: boolean
  underline?: boolean
}

export const Link: React.FC<LinkProps> = ({
  variant = 'default',
  external = false,
  underline = true,
  children,
  className,
  color,
  weight,
  href,
  as = 'a',
  ...props
}) => {
  const Component = as
  
  const getLinkClass = (variant: 'default' | 'muted' | 'subtle'): string => {
    const variantMap = {
      default: 'text-link',
      muted: 'text-link-muted',
      subtle: 'text-link-subtle',
    }
    
    return variantMap[variant]
  }
  
  const externalProps = external ? {
    target: '_blank',
    rel: 'noopener noreferrer',
  } : {}
  
  return (
    <Component
      href={href}
      className={cn(
        getLinkClass(variant),
        !underline && 'no-underline',
        getColorClass(color),
        getWeightClass(weight),
        className
      )}
      {...externalProps}
      {...props}
    >
      {children}
    </Component>
  )
}

// Quote Component
interface QuoteProps extends BaseTypographyProps {
  cite?: string
  author?: string
}

export const Quote: React.FC<QuoteProps> = ({
  cite,
  author,
  children,
  className,
  color,
  weight,
  as = 'blockquote',
  ...props
}) => {
  const Component = as
  
  return (
    <Component
      className={cn(
        'quote',
        getColorClass(color),
        getWeightClass(weight),
        className
      )}
      {...props}
    >
      {children}
      {(cite || author) && (
        <cite className="block mt-4 text-sm text-muted not-italic">
          {author && `— ${author}`}
          {cite && author && ', '}
          {cite && !author && `— ${cite}`}
          {cite && author && cite}
        </cite>
      )}
    </Component>
  )
}

// Medical-specific Typography Components
interface MedicalTextProps extends BaseTypographyProps {
  variant: 'important' | 'warning' | 'urgent' | 'appointment' | 'available' | 'unavailable'
}

export const MedicalText: React.FC<MedicalTextProps> = ({
  variant,
  children,
  className,
  as = 'p',
  ...props
}) => {
  const Component = as
  
  const getMedicalClass = (variant: MedicalTextProps['variant']): string => {
    const variantMap = {
      important: 'medical-content p.important',
      warning: 'medical-content p.warning',
      urgent: 'text-urgent',
      appointment: 'text-appointment',
      available: 'text-available',
      unavailable: 'text-unavailable',
    }
    
    return variantMap[variant]
  }
  
  return (
    <Component
      className={cn(
        getMedicalClass(variant),
        className
      )}
      {...props}
    >
      {children}
    </Component>
  )
}

// Main Typography export with all variants
export const Typography = {
  Heading,
  Display,
  Body,
  Caption,
  Link,
  Quote,
  MedicalText,
  
  // Convenience components
  H1: (props: Omit<HeadingProps, 'level'>) => <Heading level="h1" {...props} />,
  H2: (props: Omit<HeadingProps, 'level'>) => <Heading level="h2" {...props} />,
  H3: (props: Omit<HeadingProps, 'level'>) => <Heading level="h3" {...props} />,
  H4: (props: Omit<HeadingProps, 'level'>) => <Heading level="h4" {...props} />,
  H5: (props: Omit<HeadingProps, 'level'>) => <Heading level="h5" {...props} />,
  H6: (props: Omit<HeadingProps, 'level'>) => <Heading level="h6" {...props} />,
  
  P: (props: BodyProps) => <Body {...props} />,
  Lead: (props: Omit<BodyProps, 'variant'>) => <Body variant="lead" {...props} />,
  Small: (props: Omit<BodyProps, 'variant'>) => <Body variant="small" {...props} />,
}

// Default export
export default Typography 