import React from 'react'
import { cn } from '@/lib/utils/accessibility'

// Button variant types
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'destructive' | 'success'
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
type ButtonIcon = 'left' | 'right' | 'only'

// Button component props
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  disabled?: boolean
  loading?: boolean
  icon?: React.ReactNode
  iconPosition?: ButtonIcon
  fullWidth?: boolean
  asChild?: boolean
  href?: string
  external?: boolean
}

// Get variant styles
const getVariantStyles = (variant: ButtonVariant): string => {
  const variants = {
    primary: cn(
      'bg-primary-600 text-white border-primary-600',
      'hover:bg-primary-700 hover:border-primary-700',
      'active:bg-primary-800 active:border-primary-800',
      'focus:ring-primary-500',
      'disabled:bg-primary-300 disabled:border-primary-300'
    ),
    secondary: cn(
      'bg-secondary-600 text-white border-secondary-600',
      'hover:bg-secondary-700 hover:border-secondary-700',
      'active:bg-secondary-800 active:border-secondary-800',
      'focus:ring-secondary-500',
      'disabled:bg-secondary-300 disabled:border-secondary-300'
    ),
    ghost: cn(
      'bg-transparent text-neutral-700 border-transparent',
      'hover:bg-neutral-100 hover:text-neutral-900',
      'active:bg-neutral-200',
      'focus:ring-neutral-500',
      'disabled:text-neutral-400 disabled:hover:bg-transparent'
    ),
    outline: cn(
      'bg-transparent text-primary-600 border-primary-600',
      'hover:bg-primary-50 hover:text-primary-700 hover:border-primary-700',
      'active:bg-primary-100',
      'focus:ring-primary-500',
      'disabled:text-primary-300 disabled:border-primary-300 disabled:hover:bg-transparent'
    ),
    destructive: cn(
      'bg-error-600 text-white border-error-600',
      'hover:bg-error-700 hover:border-error-700',
      'active:bg-error-800 active:border-error-800',
      'focus:ring-error-500',
      'disabled:bg-error-300 disabled:border-error-300'
    ),
    success: cn(
      'bg-success-600 text-white border-success-600',
      'hover:bg-success-700 hover:border-success-700',
      'active:bg-success-800 active:border-success-800',
      'focus:ring-success-500',
      'disabled:bg-success-300 disabled:border-success-300'
    ),
  }
  
  return variants[variant]
}

// Get size styles
const getSizeStyles = (size: ButtonSize): string => {
  const sizes = {
    xs: 'px-2.5 py-1.5 text-xs font-medium rounded',
    sm: 'px-3 py-2 text-sm font-medium rounded-md',
    md: 'px-4 py-2.5 text-base font-medium rounded-md',
    lg: 'px-6 py-3 text-lg font-semibold rounded-lg',
    xl: 'px-8 py-4 text-xl font-semibold rounded-lg',
  }
  
  return sizes[size]
}

// Loading spinner component
const LoadingSpinner: React.FC<{ size: ButtonSize }> = ({ size }) => {
  const spinnerSizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6',
  }
  
  return (
    <svg
      className={cn('animate-spin', spinnerSizes[size])}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
}

// Main Button component
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
    loading = false,
    icon,
    iconPosition = 'left',
    fullWidth = false,
    className,
  type = 'button',
    ...props
  }, ref) => {
    const isDisabled = disabled || loading
    
          // Base styles that apply to all buttons
      const baseStyles = cn(
        // Layout and positioning
        'inline-flex items-center justify-center',
        'border border-solid',
        'font-sans',
        'transition-all duration-200 ease-in-out',
        
        // Focus styles for accessibility
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        
        // Disabled styles
        'disabled:cursor-not-allowed disabled:opacity-60',
        
        // Full width option
        fullWidth ? 'w-full' : '',
        
        // Prevent text selection
        'select-none',
        
        // Ensure proper alignment
        'relative'
      )
    
    // Icon spacing based on size
    const getIconSpacing = (size: ButtonSize): string => {
      const spacing = {
        xs: 'gap-1',
        sm: 'gap-1.5',
        md: 'gap-2',
        lg: 'gap-2.5',
        xl: 'gap-3',
      }
      return spacing[size]
    }
    
    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={cn(
          baseStyles,
          getSizeStyles(size),
          getVariantStyles(variant),
          icon && iconPosition !== 'only' ? getIconSpacing(size) : '',
          className
        )}
        {...props}
      >
        {/* Loading state */}
        {loading && (
          <LoadingSpinner size={size} />
        )}
        
        {/* Left icon */}
        {icon && iconPosition === 'left' && !loading && (
          <span className="flex-shrink-0" aria-hidden="true">
            {icon}
          </span>
        )}
        
        {/* Icon only button */}
        {icon && iconPosition === 'only' && !loading && (
          <span className="flex-shrink-0" aria-hidden="true">
            {icon}
          </span>
        )}
        
        {/* Button text */}
        {iconPosition !== 'only' && (
          <span className={cn(loading ? 'ml-2' : '')}>
            {children}
          </span>
        )}
        
        {/* Right icon */}
        {icon && iconPosition === 'right' && !loading && (
          <span className="flex-shrink-0" aria-hidden="true">
            {icon}
          </span>
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'

// Link button component for navigation
interface LinkButtonProps extends Omit<ButtonProps, 'type'> {
  href: string
  external?: boolean
}

export const LinkButton = React.forwardRef<HTMLAnchorElement, LinkButtonProps>(
  ({ href, external = false, children, ...props }, ref) => {
    const externalProps = external ? {
      target: '_blank',
      rel: 'noopener noreferrer',
    } : {}
    
    return (
      <a
        ref={ref}
        href={href}
        {...externalProps}
        className={cn(
          // Convert button styles to link styles
          'inline-flex items-center justify-center',
          'border border-solid',
          'font-sans',
          'transition-all duration-200 ease-in-out',
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
          'select-none relative no-underline',
          getSizeStyles(props.size || 'md'),
          getVariantStyles(props.variant || 'primary'),
          props.fullWidth ? 'w-full' : '',
          props.className
        )}
      >
        {children}
      </a>
    )
  }
)

LinkButton.displayName = 'LinkButton'

// Button group component for related actions
interface ButtonGroupProps {
  children: React.ReactNode
  className?: string
  orientation?: 'horizontal' | 'vertical'
  spacing?: 'none' | 'sm' | 'md' | 'lg'
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  children,
  className,
  orientation = 'horizontal',
  spacing = 'sm',
}) => {
  const orientationStyles = {
    horizontal: 'flex-row',
    vertical: 'flex-col',
  }
  
  const spacingStyles = {
    none: 'gap-0',
    sm: 'gap-2',
    md: 'gap-3',
    lg: 'gap-4',
  }

  return (
    <div
      className={cn(
        'inline-flex',
        orientationStyles[orientation],
        spacingStyles[spacing],
        className
      )}
      role="group"
    >
      {children}
    </div>
  )
}

// Icon button component for icon-only buttons
interface IconButtonProps extends Omit<ButtonProps, 'children' | 'iconPosition'> {
  icon: React.ReactNode
  'aria-label': string
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        icon={icon}
        iconPosition="only"
        {...props}
      />
    )
  }
)

IconButton.displayName = 'IconButton'

// Default export
export default Button 