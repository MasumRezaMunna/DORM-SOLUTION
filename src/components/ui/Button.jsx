import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * Reusable Micro-Interaction Button Component
 * Follows Scandinavian Calm + Bold Futuristic design tokens.
 * Features subtle lift on hover, scale-down on active press,
 * loading spin states, and reduced-motion compliance.
 */
export const Button = forwardRef(function Button(
  {
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    icon: Icon,
    iconPosition = 'left',
    className = '',
    onClick,
    type = 'button',
    ...props
  },
  ref
) {
  const { isDark } = useTheme();

  // Size styles
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
    md: 'px-5 py-2.5 text-sm rounded-xl gap-2',
    lg: 'px-6 py-3 text-base rounded-2xl gap-2.5',
  }[size] || 'px-5 py-2.5 text-sm rounded-xl gap-2';

  // Variant styles
  const variantClasses = {
    primary: isDark
      ? 'bg-[#A3B18A] hover:bg-[#BAC7A8] text-[#171C18] shadow-sm font-bold'
      : 'bg-[#526B52] hover:bg-[#405640] text-white shadow-sm font-bold',
    secondary: isDark
      ? 'bg-[#292F29] hover:bg-[#303A30] text-[#F0F1E9] border border-[#394239] font-semibold'
      : 'bg-[#ECECE4] hover:bg-[#DDE1D8] text-[#202720] border border-[#DDE1D8] font-semibold',
    outline: isDark
      ? 'bg-transparent hover:bg-[#202720] text-[#F0F1E9] border border-[#394239] font-semibold'
      : 'bg-transparent hover:bg-[#ECECE4]/60 text-[#202720] border border-[#DDE1D8] font-semibold',
    ghost: isDark
      ? 'bg-transparent hover:bg-white/5 text-[#B1B8AC] hover:text-[#F0F1E9] font-medium'
      : 'bg-transparent hover:bg-[#ECECE4] text-[#687168] hover:text-[#202720] font-medium',
    danger:
      'bg-rose-600 hover:bg-rose-700 text-white shadow-sm font-bold',
  }[variant] || '';

  const isDisabled = disabled || loading;

  return (
    <motion.button
      ref={ref}
      type={type}
      disabled={isDisabled}
      onClick={isDisabled ? undefined : onClick}
      whileHover={isDisabled ? {} : { y: -1.5, transition: { duration: 0.12 } }}
      whileTap={isDisabled ? {} : { scale: 0.97, transition: { duration: 0.08 } }}
      className={`inline-flex items-center justify-center transition-colors select-none focus:outline-none focus:ring-2 focus:ring-[#748D6B] disabled:opacity-50 disabled:pointer-events-none disabled:transform-none ${sizeClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
      ) : Icon && iconPosition === 'left' ? (
        <Icon className="w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110" />
      ) : null}

      <span>{children}</span>

      {!loading && Icon && iconPosition === 'right' && (
        <Icon className="w-4 h-4 flex-shrink-0 transition-transform group-hover:translate-x-0.5" />
      )}
    </motion.button>
  );
});

export default Button;
